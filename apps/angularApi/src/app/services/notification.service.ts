import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

export interface MessageNotification {
  senderName: string;
  content: string;
  timestamp: Date;
  conversationId: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  // Observable for sidebar icon to listen to
  private notificationTrigger$ = new Subject<void>();
  
  constructor(private snackBar: MatSnackBar) {}

  /**
   * Show a toast notification for a new message
   */
  showMessageNotification(notification: MessageNotification): void {
    const message = `${notification.senderName}: ${this.truncateMessage(notification.content)}`;
    const time = this.formatTime(notification.timestamp);
    
    this.snackBar.open(
      `${message} • ${time}`,
      '',
      {
        duration: 3000, // 3 seconds (1 second is too short to read)
        horizontalPosition: 'right',
        verticalPosition: 'top',
        panelClass: ['message-notification']
      }
    );
    
    // Trigger sidebar icon blink
    this.triggerIconBlink();
  }

  /**
   * Trigger sidebar icon to blink
   */
  private triggerIconBlink(): void {
    this.notificationTrigger$.next();
  }

  /**
   * Observable for components to subscribe to notification events
   */
  onNotification(): Observable<void> {
    return this.notificationTrigger$.asObservable();
  }

  /**
   * Truncate long messages for notification preview
   */
  private truncateMessage(content: string, maxLength: number = 50): string {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  }

  /**
   * Format timestamp for notification
   */
  private formatTime(timestamp: Date): string {
    const now = new Date();
    const diff = now.getTime() - new Date(timestamp).getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    
    if (seconds < 60) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    
    return new Date(timestamp).toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit' 
    });
  }
}