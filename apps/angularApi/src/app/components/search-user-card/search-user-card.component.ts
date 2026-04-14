import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ConnectionStatus } from '../../services/search.service';

/**
 * Interface for user data displayed in the search card
 */
export interface SearchUserCardData {
  id: string;
  name: string;
  profileImage?: string;
  bio?: string;
  skillsKnown: string[];    // Array of skill names
  skillsLearning: string[]; // Array of skill names
}

/**
 * SearchUserCardComponent
 * 
 * A card component that displays user information in search results.
 * Features:
 * - User profile image and name
 * - Skills the user knows (can teach)
 * - Skills the user wants to learn
 * - Connection request button with status display
 * - Clickable to navigate to user profile
 * 
 * Usage:
 * <app-search-user-card
 *   [user]="userData"
 *   [connectionStatus]="'nothing-sent'"
 *   [isLoadingConnection]="false"
 *   (sendRequest)="onSendRequest($event)"
 *   (viewProfile)="onViewProfile($event)">
 * </app-search-user-card>
 */
@Component({
  selector: 'app-search-user-card',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatChipsModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './search-user-card.component.html',
  styleUrl: './search-user-card.component.scss'
})
export class SearchUserCardComponent {
  @Input() user!: SearchUserCardData;
  @Input() connectionStatus: ConnectionStatus = 'nothing-sent';
  @Input() isLoadingConnection = false;
  
  @Output() sendRequest = new EventEmitter<string>();
  @Output() viewProfile = new EventEmitter<string>();

  /**
   * Handle card click - navigate to profile
   */
  onCardClick(): void {
    this.viewProfile.emit(this.user.id);
  }

  /**
   * Handle send request button click
   */
  onSendRequestClick(): void {
    this.sendRequest.emit(this.user.id);
  }

  /**
   * Handle image load error - use fallback image
   */
  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = '/assets/images/profile/user-1.jpg';
  }
}
