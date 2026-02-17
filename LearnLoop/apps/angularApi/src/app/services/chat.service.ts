import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable, Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { User } from '../models/user.model';
import { environment } from 'src/env/env';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private socket: Socket | null = null;
  private newMessageSubject = new Subject<any>();
  private errorSubject = new Subject<any>();

  constructor(private http: HttpClient) {
    this.initializeSocket();
  }

  private initializeSocket(): void {
    try {
      this.socket = io('http://localhost:3000/chat', {
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
        transports: ['websocket', 'polling'],
        withCredentials: true,
      });

      this.socket.on('connect', () => {
        console.log('✓ Connected to chat server:', this.socket?.id);
        // Register the current user
        const userId = localStorage.getItem('userId');
        if (userId) {
          this.socket?.emit('registerUser', { userId });
        }
      });

      this.socket.on('disconnect', () => {
        console.log('✗ Disconnected from chat server');
      });

      this.socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        this.errorSubject.next({ message: 'Connection failed: ' + error });
      });

      // FIXED: Removed conversationLoaded listener to prevent race conditions
      // History is now loaded via HTTP only

      this.socket.on('newMessage', (data) => {
        this.newMessageSubject.next(data);
      });

      this.socket.on('error', (error) => {
        this.errorSubject.next(error);
      });
    } catch (error) {
      console.error('Failed to initialize socket:', error);
      this.errorSubject.next({ message: 'Failed to initialize socket' });
    }
  }

  /**
   * Get conversation by two user IDs from backend (HTTP source of truth)
   */
  getConversationByUserIds(userId1: string, userId2: string): Observable<any> {
    return this.http.get<any>(
      `${environment.baseApiUrl}/chat/conversation/users/${userId1}/${userId2}`,
    );
  }

  /**
   * Join a conversation room and setup for real-time updates
   */
  joinConversation(conversationId: string, userId: string) {
    if (!this.socket) {
      console.error('Socket not initialized');
      this.errorSubject.next({ message: 'Socket not initialized' });
      return;
    }

    if (!conversationId) {
      console.warn('Cannot join conversation - no conversation ID');
      return;
    }

    console.log('Joining conversation via socket:', conversationId);
    this.socket.emit('joinConversation', {
      conversationId,
      userId,
    });
  }

  /**
   * FIXED: Leave a conversation room to prevent message leaks
   */
  leaveConversation(conversationId: string, userId: string) {
    if (!this.socket) {
      console.warn('Socket not initialized, cannot leave conversation');
      return;
    }

    if (!conversationId) {
      return;
    }

    console.log('Leaving conversation via socket:', conversationId);
    this.socket.emit('leaveConversation', {
      conversationId,
      userId,
    });
  }

  /**
   * Send a message
   */
  sendMessage(
    conversationId: string,
    content: string,
    senderId: string,
    fileReferences: any[] = [],
  ) {
    if (!this.socket) {
      console.error('Socket not initialized');
      this.errorSubject.next({ message: 'Socket not initialized' });
      return;
    }

    if (!conversationId) {
      console.error('Cannot send message - no conversation ID');
      this.errorSubject.next({ message: 'No conversation selected' });
      return;
    }

    console.log('Sending message to conversation:', conversationId);
    this.socket.emit('sendMessage', {
      conversationId,
      content,
      senderId,
      files: fileReferences || [],
    });
  }

  /**
   * Load conversation history (pagination)
   */
  loadHistory(conversationId: string, limit: number = 50, offset: number = 0) {
    if (!this.socket) {
      console.error('Socket not initialized');
      return;
    }
    
    this.socket.emit('loadHistory', { conversationId, limit, offset });
  }

  /**
   * Observable for new message event (real-time)
   */
  onNewMessage(): Observable<any> {
    return this.newMessageSubject.asObservable();
  }

  /**
   * Observable for error event
   */
  onError(): Observable<any> {
    return this.errorSubject.asObservable();
  }

  /**
   * Get friends list
   */
  getFriends(): Observable<User[]> {
    return this.http.get<User[]>(`${environment.baseApiUrl}/users/friends/my`);
  }

  /**
   * Upload files to server and get file references
   * TODO: Implement this when file upload endpoint is ready
   */
  uploadFiles(files: File[]): Observable<any> {
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append(`files`, file);
    });

    return this.http.post<any>(
      `${environment.baseApiUrl}/chat/upload-files`,
      formData,
    );
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}

