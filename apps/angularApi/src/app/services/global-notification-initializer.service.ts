import { Injectable, OnDestroy } from '@angular/core';
import { ChatService } from './chat.service';
import { NotificationService } from './notification.service';
import { Subject, takeUntil } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GlobalNotificationInitializerService implements OnDestroy {
  private currentUserId: string = '';
  private destroy$ = new Subject<void>();

  constructor(
    private chatService: ChatService,
    private notificationService: NotificationService
  ) {}

  /**
   * Initialize global notification listener
   * Call this ONCE when app starts
   */
  initialize(): void {
    // Get current user ID
    this.currentUserId = this.getCurrentUserId();

    if (!this.currentUserId) {
      console.warn('⚠️ Cannot initialize notifications: User ID not found');
      return;
    }

    console.log('✓ Initializing global notification listener for user:', this.currentUserId);

    // Listen to ALL incoming messages globally (not tied to any component)
    this.chatService.onNewMessage()
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: any) => {
        // Only show notifications for OTHER users' messages
        if (data.senderId !== this.currentUserId) {
          console.log('🔔 Showing notification for message from:', data.senderName);
          
          this.notificationService.showMessageNotification({
            senderName: data.senderName || 'Someone',
            content: data.content,
            timestamp: new Date(data.createdAt || Date.now()),
            conversationId: data.conversationId
          });
        }
      });
  }

  /**
   * Get current user ID from storage
   */
  private getCurrentUserId(): string {
    let userId = localStorage.getItem('userId');
    
    if (!userId) {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          userId = user.id;
          if (userId) {
            localStorage.setItem('userId', userId);
          }
        } catch (error) {
          console.error('Failed to parse user:', error);
        }
      }
    }

    if (!userId) {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const parts = token.split('.');
          if (parts.length === 3) {
            const payload = JSON.parse(atob(parts[1]));
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

    return userId || '';
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
