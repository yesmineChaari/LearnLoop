import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

// Angular Material Modules
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

// Components and Services
import { SearchUserCardComponent, SearchUserCardData } from 'src/app/components/search-user-card/search-user-card.component';
import { SearchService, SearchParams, SearchUserResult, ConnectionStatus } from 'src/app/services/search.service';
import { SkillsService, SkillDto } from 'src/app/services/skills.service';

/**
 * SearchComponent
 * 
 * Main search page component that allows users to:
 * - Search for other users by name
 * - Filter by skills known (can teach)
 * - Filter by skills wanting to learn
 * - Paginate through results
 * - Send connection requests
 * - Navigate to user profiles
 * 
 * Features:
 * - Debounced search input (300ms)
 * - Multi-select skill filters
 * - Real-time connection status updates
 * - Responsive design
 * - Loading states and empty states
 */
@Component({
  selector: 'app-search',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
    MatCardModule,
    MatSnackBarModule,
    SearchUserCardComponent
  ],
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit, OnDestroy {
  // Search state
  searchQuery = '';
  users: SearchUserCardData[] = [];
  allSkills: SkillDto[] = [];
  
  // Filter state - now supports multiple selections
  selectedSkillsToTeach: string[] = [];  // Skills known / can teach
  selectedSkillsToLearn: string[] = [];   // Skills wanting to learn
  
  // Pagination state
  currentPage = 1;
  pageSize = 10;
  totalUsers = 0;
  totalPages = 0;
  pageSizeOptions = [5, 10, 25, 50];
  
  // Loading states
  isLoading = false;
  isInitialLoad = true;
  
  // Connection statuses map (userId -> status)
  connectionStatuses = new Map<string, ConnectionStatus>();
  loadingConnections = new Set<string>();
  
  // RxJS subjects
  private searchSubject$ = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private searchService: SearchService,
    private skillsService: SkillsService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    // Setup debounced search
    this.searchSubject$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(query => {
      this.searchQuery = query;
      this.currentPage = 1; // Reset to first page on new search
      this.executeSearch();
    });

    // Load available skills for filters
    this.loadSkills();

    // Check for query params from URL
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe(params => {
      if (params['q']) {
        this.searchQuery = params['q'];
      }
      if (params['skillsToTeach']) {
        this.selectedSkillsToTeach = params['skillsToTeach'].split(',');
      }
      if (params['skillsToLearn']) {
        this.selectedSkillsToLearn = params['skillsToLearn'].split(',');
      }
      if (params['page']) {
        this.currentPage = parseInt(params['page'], 10);
      }
      
      // Execute initial search
      this.executeSearch();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Load all available skills for filter dropdowns
   */
  private loadSkills(): void {
    this.skillsService.getSkills().pipe(takeUntil(this.destroy$)).subscribe(skills => {
      this.allSkills = skills;
    });
  }

  /**
   * Handle search input changes with debouncing
   */
  onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchSubject$.next(value);
  }

  /**
   * Handle skill filter changes for "skills to teach" (skills known)
   */
  onSkillsToTeachChange(skillIds: string[]): void {
    this.selectedSkillsToTeach = skillIds;
    this.currentPage = 1;
    this.executeSearch();
  }

  /**
   * Handle skill filter changes for "skills to learn"
   */
  onSkillsToLearnChange(skillIds: string[]): void {
    this.selectedSkillsToLearn = skillIds;
    this.currentPage = 1;
    this.executeSearch();
  }

  /**
   * Handle pagination changes
   */
  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.executeSearch();
  }

  /**
   * Clear all filters and reset search
   */
  clearFilters(): void {
    this.searchQuery = '';
    this.selectedSkillsToTeach = [];
    this.selectedSkillsToLearn = [];
    this.currentPage = 1;
    this.executeSearch();
    
    // Update URL
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {}
    });
  }

  /**
   * Execute the search API call
   */
  private executeSearch(): void {
    this.isLoading = true;

    const params: SearchParams = {
      name: this.searchQuery.trim() || undefined,
      skillsToTeach: this.selectedSkillsToTeach.length > 0 ? this.selectedSkillsToTeach : undefined,
      skillsToLearn: this.selectedSkillsToLearn.length > 0 ? this.selectedSkillsToLearn : undefined,
      page: this.currentPage,
      limit: this.pageSize,
      sortBy: 'name'
    };

    // Update URL with search params
    this.updateUrlParams(params);

    this.searchService.searchUsers(params).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response) => {
        // Map API response to card data format
        this.users = response.users.map(user => this.mapUserToCardData(user));
        this.totalUsers = response.total;
        this.totalPages = response.totalPages;
        this.isLoading = false;
        this.isInitialLoad = false;

        // Fetch connection statuses for all users
        this.fetchConnectionStatuses();
      },
      error: (err) => {
        console.error('Search error:', err);
        this.users = [];
        this.isLoading = false;
        this.isInitialLoad = false;
        this.snackBar.open('Failed to search users. Please try again.', 'Close', {
          duration: 3000
        });
      }
    });
  }

  /**
   * Map API user response to card data format
   */
  private mapUserToCardData(user: SearchUserResult): SearchUserCardData {
    return {
      id: user.id,
      name: user.name,
      profileImage: user.profileImage,
      bio: user.bio,
      // Skills are directly Skill[] (ManyToMany relation)
      skillsKnown: (user.skillsToTeach || []).map(s => s.name || 'Unknown'),
      skillsLearning: (user.skillsToLearn || []).map(s => s.name || 'Unknown')
    };
  }

  /**
   * Fetch connection statuses for all displayed users
   */
  private fetchConnectionStatuses(): void {
    const userIds = this.users.map(u => u.id);
    
    this.searchService.getBatchConnectionStatuses(userIds).pipe(takeUntil(this.destroy$)).subscribe(statuses => {
      this.connectionStatuses = statuses;
    });
  }

  /**
   * Get connection status for a specific user
   */
  getConnectionStatus(userId: string): ConnectionStatus {
    return this.connectionStatuses.get(userId) || 'nothing-sent';
  }

  /**
   * Check if connection request is loading for a user
   */
  isConnectionLoading(userId: string): boolean {
    return this.loadingConnections.has(userId);
  }

  /**
   * Handle send connection request from card
   */
  onSendRequest(userId: string): void {
    this.loadingConnections.add(userId);

    this.searchService.sendConnectionRequest(userId).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response) => {
        this.loadingConnections.delete(userId);
        
        if (response.success) {
          // Update local status
          this.connectionStatuses.set(userId, 'pending');
          this.snackBar.open('Connection request sent!', 'Close', {
            duration: 3000,
            panelClass: 'success-snackbar'
          });
        } else {
          this.snackBar.open(response.error || 'Failed to send request', 'Close', {
            duration: 3000,
            panelClass: 'error-snackbar'
          });
        }
      },
      error: (err) => {
        this.loadingConnections.delete(userId);
        this.snackBar.open('Failed to send request. Please try again.', 'Close', {
          duration: 3000
        });
      }
    });
  }

  /**
   * Handle view profile click from card
   */
  onViewProfile(userId: string): void {
    this.router.navigate(['/users', userId]);
  }

  /**
   * Update URL query parameters to reflect current search state
   */
  private updateUrlParams(params: SearchParams): void {
    const queryParams: any = {};
    
    if (params.name) {
      queryParams.q = params.name;
    }
    if (params.skillsToTeach?.length) {
      queryParams.skillsToTeach = params.skillsToTeach.join(',');
    }
    if (params.skillsToLearn?.length) {
      queryParams.skillsToLearn = params.skillsToLearn.join(',');
    }
    if (params.page && params.page > 1) {
      queryParams.page = params.page;
    }

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }

  /**
   * Check if any filters are active
   */
  get hasActiveFilters(): boolean {
    return this.searchQuery.trim().length > 0 || 
           this.selectedSkillsToTeach.length > 0 || 
           this.selectedSkillsToLearn.length > 0;
  }

  /**
   * Get skill name by ID for display
   */
  getSkillName(skillId: string): string {
    const skill = this.allSkills.find(s => s.id === skillId);
    return skill?.name || 'Unknown';
  }

  /**
   * Clear the search query and trigger new search
   */
  clearSearchQuery(): void {
    this.searchQuery = '';
    this.currentPage = 1;
    this.executeSearch();
  }

  /**
   * Remove a specific skill from the "skills to teach" filter
   */
  removeSkillToTeach(skillId: string): void {
    this.selectedSkillsToTeach = this.selectedSkillsToTeach.filter(s => s !== skillId);
    this.currentPage = 1;
    this.executeSearch();
  }

  /**
   * Remove a specific skill from the "skills to learn" filter
   */
  removeSkillToLearn(skillId: string): void {
    this.selectedSkillsToLearn = this.selectedSkillsToLearn.filter(s => s !== skillId);
    this.currentPage = 1;
    this.executeSearch();
  }
}
