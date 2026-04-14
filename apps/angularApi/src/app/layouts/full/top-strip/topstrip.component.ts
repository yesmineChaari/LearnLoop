import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { ɵɵRouterLink } from "@angular/router/testing";
import { Observable, Subject, takeUntil } from 'rxjs';
import { NotificationService } from 'src/app/services/notification.service';

@Component({
  selector: 'app-topstrip',
  imports: [
    CommonModule,
    MatButtonModule,
    MatMenuModule,
    MatIconModule,
    MatBadgeModule,
    RouterLink,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    ɵɵRouterLink,
    MatInputModule
],
    

  templateUrl: './topstrip.component.html',
})
export class AppTopstripComponent implements OnInit {
  searchQuery = '';
  unreadCount$: Observable<number>;
  isNotificationBlinking: boolean = false;
  private destroy$ = new Subject<void>();

  constructor( private router: Router, private notificationService: NotificationService ) {}
  /**Make notification icon blink/pulse for 2 seconds*/
  private blinkNotificationIcon(): void {
    console.log('🔔 Blinking notification icon');
    this.isNotificationBlinking = true;
    
    // Stop blinking after 2 seconds
    setTimeout(() => {
      this.isNotificationBlinking = false;
      console.log('🔔 Stopped blinking');
    }, 2000);
  }
  ngOnInit(): void {
    // Listen for notification events
  this.notificationService.onNotification()
    .pipe(takeUntil(this.destroy$))
    .subscribe(() => {
      this.blinkNotificationIcon();
    });
  }

  onSearch() {
    if (this.searchQuery && this.searchQuery.trim()) {
      this.router.navigate(['/search'], { queryParams: { q: this.searchQuery.trim() } });
    }
  }
  ngOnDestroy() {
  this.destroy$.next();
  this.destroy$.complete();
  }
}
