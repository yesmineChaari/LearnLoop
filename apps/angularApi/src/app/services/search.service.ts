import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { SkillDto } from './skills.service';

/**
 * Interface representing a user in search results
 * Skills are directly Skill[] from ManyToMany relation
 */
export interface SearchUserResult {
  id: string;
  name: string;
  email?: string;
  bio?: string;
  profileImage?: string;
  skillsToTeach: SkillDto[];  // Direct Skill array
  skillsToLearn: SkillDto[];  // Direct Skill array
  createdAt?: string;
}

/**
 * Interface for paginated search response
 */
export interface SearchResponse {
  users: SearchUserResult[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Interface for search parameters
 */
export interface SearchParams {
  name?: string;
  skillsToTeach?: string[];  // Skills user can teach (skills known)
  skillsToLearn?: string[];  // Skills user wants to learn
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'recent' | 'relevance';
}

/**
 * Connection status for a user
 */
export type ConnectionStatus = 
  | 'pending' 
  | 'accepted' 
  | 'declined' 
  | 'waiting-for-current-user-approval' 
  | 'nothing-sent';

/**
 * Search Service
 * 
 * Handles all search-related API calls including:
 * - Searching users by name and skills
 * - Pagination management
 * - Connection status checking
 * - Sending friend requests
 */
@Injectable({ providedIn: 'root' })
export class SearchService {
  private readonly apiUrl = 'http://localhost:3000/api';
  
  // Observable state for loading indicator
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Get authorization headers with JWT token
   */
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  /**
   * Search users with filters and pagination
   * 
   * @param params - Search parameters including name, skills, pagination
   * @returns Observable of paginated search results
   */
  searchUsers(params: SearchParams): Observable<SearchResponse> {
    this.loadingSubject.next(true);

    let httpParams = new HttpParams();
    
    if (params.name?.trim()) {
      httpParams = httpParams.set('name', params.name.trim());
    }
    
    if (params.skillsToTeach?.length) {
      httpParams = httpParams.set('skillsToTeach', params.skillsToTeach.join(','));
    }
    
    if (params.skillsToLearn?.length) {
      httpParams = httpParams.set('skillsToLearn', params.skillsToLearn.join(','));
    }
    
    if (params.page) {
      httpParams = httpParams.set('page', params.page.toString());
    }
    
    if (params.limit) {
      httpParams = httpParams.set('limit', params.limit.toString());
    }
    
    if (params.sortBy) {
      httpParams = httpParams.set('sortBy', params.sortBy);
    }

    return this.http.get<SearchResponse>(`${this.apiUrl}/users`, {
      headers: this.getHeaders(),
      params: httpParams
    }).pipe(
      tap(() => this.loadingSubject.next(false)),
      catchError(err => {
        console.error('Search error:', err);
        this.loadingSubject.next(false);
        return of({
          users: [],
          total: 0,
          page: params.page || 1,
          limit: params.limit || 10,
          totalPages: 0
        });
      })
    );
  }

  /**
   * Get the connection status between current user and target user
   * 
   * @param userId - Target user ID
   * @returns Observable of connection status
   */
  getConnectionStatus(userId: string): Observable<ConnectionStatus> {
    return this.http.get(`${this.apiUrl}/friend-requests/status/${userId}`, {
      headers: this.getHeaders(),
      responseType: 'text'
    }).pipe(
      map(status => status as ConnectionStatus),
      catchError(err => {
        console.error('Error getting connection status:', err);
        return of('nothing-sent' as ConnectionStatus);
      })
    );
  }

  /**
   * Send a friend/connection request to a user
   * 
   * @param userId - Target user ID to send request to
   * @returns Observable with success or error response
   */
  sendConnectionRequest(userId: string): Observable<{ success: boolean; error?: string }> {
    return this.http.post<any>(`${this.apiUrl}/friend-requests/send/${userId}`, {}, {
      headers: this.getHeaders()
    }).pipe(
      map(response => {
        if (response.error) {
          return { success: false, error: response.error };
        }
        return { success: true };
      }),
      catchError(err => {
        console.error('Error sending connection request:', err);
        return of({ success: false, error: err.message || 'Failed to send request' });
      })
    );
  }

  /**
   * Get multiple connection statuses in batch (for search results)
   * This is more efficient than calling getConnectionStatus for each user
   * 
   * @param userIds - Array of user IDs
   * @returns Observable of map from userId to status
   */
  getBatchConnectionStatuses(userIds: string[]): Observable<Map<string, ConnectionStatus>> {
    // For now, we'll make individual calls. This could be optimized with a batch endpoint
    const statusMap = new Map<string, ConnectionStatus>();
    
    if (userIds.length === 0) {
      return of(statusMap);
    }

    // Create an array of observables and combine them
    const requests = userIds.map(id => 
      this.getConnectionStatus(id).pipe(
        map(status => ({ id, status }))
      )
    );

    return new Observable(subscriber => {
      let completed = 0;
      requests.forEach(req => {
        req.subscribe({
          next: ({ id, status }) => {
            statusMap.set(id, status);
            completed++;
            if (completed === requests.length) {
              subscriber.next(statusMap);
              subscriber.complete();
            }
          },
          error: () => {
            completed++;
            if (completed === requests.length) {
              subscriber.next(statusMap);
              subscriber.complete();
            }
          }
        });
      });
    });
  }
}
