import { ViewChild, ElementRef, OnInit, Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Observable, Subject, takeUntil } from 'rxjs';
import { ChatService } from 'src/app/services/chat.service';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { User } from 'src/app/models/user.model';

// Interface for chat messages with unique IDs
interface ChatMessage {
  id: string;
  text: string;
  isSent: boolean;
  senderId: string;
  senderName: string;
  files: File[];
  timestamp: Date;
  isTemporary?: boolean; // For optimistic UI updates
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, MatProgressSpinnerModule , MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatTooltipModule, MatIconModule],
  templateUrl: './chat.html',
  styleUrls: ['./chat.scss'],
})
export class Chat implements OnInit, OnDestroy {
  @ViewChild('form') form!: NgForm;
  @ViewChild('messagesList') messagesList!: ElementRef;

  friends: User[] = [];
  selectedFriend: User | null = null;
  messages: ChatMessage[] = [];
  attachedFiles: File[] = [];
  currentUserId: string = '';
  conversationId: string = '';
  
  // Separate loading states for better UX
  isLoadingFriends: boolean = false;
  isLoadingConversation: boolean = false;
  isSendingMessage: boolean = false;
  
  // Error message display
  errorMessage: string = '';
  successMessage: string = '';
  
  // Track message IDs to prevent duplicates
  private messageIds = new Set<string>();
  private previousConversationId: string = '';

  private destroy$ = new Subject<void>();

  constructor(
    private chatService: ChatService
  ) {}

  ngOnInit() {
    this.loadFriends();
    this.setupSocketListeners();
    this.getCurrentUserId();
  }

  /**
   * Load friends list
   */
  loadFriends() {
    this.isLoadingFriends = true;
    this.errorMessage = '';
    
    this.chatService.getFriends().pipe(takeUntil(this.destroy$)).subscribe({
      next: (friends) => {
        console.log('Friends retrieved:', friends);
        this.friends = friends;
        this.isLoadingFriends = false;
      },
      error: (error) => {
        console.error('Error fetching friends:', error);
        this.errorMessage = 'Failed to load friends list';
        this.isLoadingFriends = false;
      },
    });
  }

  /**
   * Select friend and join their conversation
   * Properly cleans up previous socket subscription
   */
  selectFriend(friend: User): void {
    if (!this.currentUserId) {
      console.warn('Current user ID not set');
      this.errorMessage = 'User not authenticated';
      return;
    }

    // CRITICAL FIX: Leave previous conversation room to avoid message leaks
    if (this.previousConversationId && this.previousConversationId !== '') {
      console.log('Leaving previous conversation:', this.previousConversationId);
      this.chatService.leaveConversation(this.previousConversationId, this.currentUserId);
    }

    this.selectedFriend = friend;
    this.messages = [];
    this.attachedFiles = [];
    this.conversationId = '';
    this.messageIds.clear();
    this.isLoadingConversation = true;
    this.errorMessage = '';

    console.log('Selecting friend:', friend.id, friend.name);

    // Load conversation history via HTTP (source of truth for history)
    this.chatService
      .getConversationByUserIds(this.currentUserId, friend.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('Conversation response from backend:', response);

          // Validate conversation ID
          if (response && response.id) {
            this.conversationId = response.id;
            this.previousConversationId = response.id; // Track for cleanup

            // Map messages for display
            if (response.messages && response.messages.length > 0) {
              this.messages = response.messages.map((msg: any) => {
                const messageId = msg.id || this.generateMessageId();
                this.messageIds.add(messageId);
                return {
                  id: messageId,
                  text: msg.content,
                  isSent: msg.senderId === this.currentUserId,
                  senderId: msg.senderId,
                  senderName: msg.sender?.name || (msg.senderId === this.currentUserId ? 'You' : friend.name),
                  files: msg.files || [],
                  timestamp: new Date(msg.createdAt),
                };
              });
              console.log('Conversation loaded with', this.messages.length, 'messages');
            }

            // Conversation is ready - stop loading
            this.isLoadingConversation = false;

            // Join socket room for real-time updates (Socket.io now handles NEW messages only)
            if (this.conversationId) {
              this.chatService.joinConversation(this.conversationId, this.currentUserId);
            }

            // Auto-scroll to bottom after messages are loaded
            setTimeout(() => this.scrollToBottom(), 100);
          } else {
            console.warn('Failed to get or create conversation');
            this.isLoadingConversation = false;
            this.errorMessage = 'Unable to load conversation';
          }
        },
        error: (error) => {
          console.error('Error fetching conversation:', error);
          this.isLoadingConversation = false;
          this.conversationId = '';
          this.messages = [];
          this.errorMessage = 'Failed to load conversation. Please try again.';
        },
      });
  }

  /**
   * Setup Socket.io listeners for real-time updates
   * FIXED: Socket.io now ONLY handles new messages, not history
   * ENHANCED: Added message notifications for new incoming messages
   */
  setupSocketListeners() {
    // Listen for new incoming messages ONLY (not conversation history)
    this.chatService.onNewMessage()
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: any) => {
        const messageId = data.id || this.generateMessageId();
        
        // Process message for current conversation
        if (data.conversationId === this.conversationId) {
          if (!this.messageIds.has(messageId)) {
            this.messageIds.add(messageId);
            
            // Check if this is OUR message coming back from server
            if (data.senderId === this.currentUserId) {
              // Try to find and replace the temporary message we added optimistically
              const tempIndex = this.messages.findIndex(msg => msg.isTemporary === true && msg.senderId === this.currentUserId);
              
              if (tempIndex >= 0) {
                // Replace temporary message with real message from server
                this.messages[tempIndex] = {
                  id: messageId,
                  text: data.content,
                  isSent: true,
                  senderId: data.senderId,
                  senderName: 'You',
                  timestamp: new Date(data.createdAt),
                  files: data.files || [],
                  isTemporary: false,
                };
                console.log('✓ Replaced temporary message with real one:', messageId);
              } else {
                // No temporary found - add as new (shouldn't happen)
                this.messages.push({
                  id: messageId,
                  text: data.content,
                  isSent: true,
                  senderId: data.senderId,
                  senderName: 'You',
                  timestamp: new Date(data.createdAt),
                  files: data.files || [],
                });
                console.warn('⚠️ No temporary message found, added as new:', messageId);
              }

            } else {
              // Message from OTHER user - add normally
              this.messages.push({
                id: messageId,
                text: data.content,
                isSent: false,
                senderId: data.senderId,
                senderName: data.senderName || (this.selectedFriend?.name || 'Friend'),
                timestamp: new Date(data.createdAt),
                files: data.files || [],
              });
              console.log('✓ New message from friend:', data.content);
              
              // NOTE: Notification is now handled globally by GlobalNotificationInitializerService
              // This ensures notifications work even when user is not on this chat page
            }
            
            // Auto-scroll to bottom
            setTimeout(() => this.scrollToBottom(), 50);
          } else {
            console.warn('✗ Duplicate message ignored:', messageId);
          }
        } else {
          // IMPORTANT: Message for DIFFERENT conversation (user not currently viewing)
          // Global notification service handles this - no need to do anything here
          console.log('✓ Message received for conversation:', data.conversationId);
        }
      });

    // Listen for socket errors
    this.chatService.onError()
      .pipe(takeUntil(this.destroy$))
      .subscribe((error: any) => {
        console.error('Socket error:', error.message);
        this.errorMessage = error.message || 'Connection error occurred';
        this.isLoadingConversation = false;
        this.isSendingMessage = false;
      });
  }

  /**
   * Submit message form
   * FIXED: Proper error handling and loading states
   */
  onSubmit(form: any) {
    const messageContent = form.value?.message?.trim();

    if (!messageContent) {
      this.errorMessage = 'Message cannot be empty';
      return;
    }

    if (!this.conversationId) {
      this.errorMessage = 'No conversation selected';
      return;
    }

    if (!this.currentUserId) {
      this.errorMessage = 'User not authenticated';
      return;
    }

    this.isSendingMessage = true;
    this.errorMessage = '';

    // TODO: Implement file upload first if attachedFiles.length > 0
    // For now, files are not being uploaded
    const fileReferences: any[] = [];

    console.log('Submitting message:', messageContent);

    // Send message via Socket.io
    const tempMessageId = 'temp-' + Date.now();
    this.chatService.sendMessage(
      this.conversationId,
      messageContent,
      this.currentUserId,
      fileReferences,
    );

    // Optimistic UI: Add message immediately with temporary ID
    this.messages.push({
      id: tempMessageId,
      text: messageContent,
      isSent: true,
      senderId: this.currentUserId,
      senderName: 'You',
      files: fileReferences.length > 0 ? fileReferences : [],
      timestamp: new Date(),
      isTemporary: true,
    });
    this.messageIds.add(tempMessageId);

    // Clear form and files
    form.resetForm();
    this.attachedFiles = [];
    
    console.log('Message sent:', messageContent);
    setTimeout(() => this.scrollToBottom(), 50);
    
    // NOTE: isSendingMessage will be set to false when socket confirms the message
    // or after timeout to allow socket response to arrive
    setTimeout(() => {
      this.isSendingMessage = false;
    }, 3000);
  }

  /**
   * Handle file selection
   */
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    
    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        this.attachedFiles.push(files[i]);
        console.log('File attached:', files[i].name, files[i].size, files[i].type);
      }
      // Reset file input
      input.value = '';
    }
  }

  /**
   * Remove attached file
   */
  removeAttachedFile(index: number): void {
    this.attachedFiles.splice(index, 1);
    console.log('File removed, remaining:', this.attachedFiles.length);
  }

  /**
   * Auto-scroll messages list to bottom
   */
  private scrollToBottom(): void {
    try {
      if (this.messagesList && this.messagesList.nativeElement) {
        this.messagesList.nativeElement.scrollTop = 
          this.messagesList.nativeElement.scrollHeight;
      }
    } catch (error) {
      console.warn('Could not scroll to bottom:', error);
    }
  }

  /**
   * Generate unique message ID
   */
  private generateMessageId(): string {
    return 'msg-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Get current logged-in user ID
   */
  private getCurrentUserId() {
    // Try to get userId from localStorage
    let userId = localStorage.getItem('userId');
    
    // If not found, extract from user object (from login response)
    if (!userId) {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          userId = user.id;
          // Save for future access
          if (userId) {
            localStorage.setItem('userId', userId);
          }
        } catch (error) {
          console.error('Failed to parse user from localStorage:', error);
        }
      }
    }
    
    // Fallback: Extract from JWT token if available
    if (!userId) {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const parts = token.split('.');
          if (parts.length === 3) {
            const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
            const payloadJson = atob(base64);
            const payload = JSON.parse(payloadJson);
            userId = payload?.sub;
            if (userId) {
              localStorage.setItem('userId', userId);
            }
          }
        } catch (error) {
          console.error('Failed to extract userId from token:', error);
        }
      }
    }
    
    this.currentUserId = userId || '';
    if (!this.currentUserId) {
      this.errorMessage = 'User ID not found. Please log in again.';
    }
  }

  ngOnDestroy() {
    // Cleanup: Leave conversation room
    if (this.conversationId && this.currentUserId) {
      this.chatService.leaveConversation(this.conversationId, this.currentUserId);
    }
    
    this.destroy$.next();
    this.destroy$.complete();
  }
}