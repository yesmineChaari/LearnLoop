import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface FeedPostDto {
  id: string;
  content: string;
  media?: string | null;
  likesCount: number;
  isLikedByCurrentUser: boolean;
  createdAt: string;
  author: {
    id: string;
    name: string;
    email: string;
    profileImage?: string | null;
  };
}

export interface FeedResponseDto {
  count: number;
  posts: FeedPostDto[];
}

export interface LikeResponseDto {
  message: string;
  like: {
    id: string;
    postId: string;
    userId: string;
    createdAt: string;
  };
}

export interface CommentResponseDto {
  id: string;
  content: string;
  postId: string;
  userId: string;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
    profileImage?: string | null;
  };
}

export interface CommentListResponseDto {
  count: number;
  comments: CommentResponseDto[];
}

@Injectable({
  providedIn: 'root',
})
export class PostService {
  private apiUrl = 'http://localhost:3000/api/posts';

  constructor(private http: HttpClient) {}

  getMyPosts(): Observable<FeedPostDto[]> {
    const token = localStorage.getItem('token');
    const headers = token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : new HttpHeaders();
    return this.http
      .get<FeedResponseDto>(`${this.apiUrl}/me`, { headers })
      .pipe(
        map((res) => res.posts),
      );
  }

  getFriendsFeed(): Observable<FeedResponseDto> {
    const token = localStorage.getItem('token');
    const headers = token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : new HttpHeaders();

    return this.http
      .get<FeedResponseDto>(`${this.apiUrl}/feed`, { headers })
      .pipe(
        catchError((err) => {
          console.error('Failed to load feed', err);
          return of({ count: 0, posts: [] });
        }),
      );
  }

  createPost(body: {
    content: string;
    media?: string | null;
  }): Observable<FeedPostDto> {
    const token = localStorage.getItem('token');
    const headers = token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : new HttpHeaders();

    return this.http
      .post<FeedPostDto>(`${this.apiUrl}`, body, { headers })
      .pipe(
        catchError((err) => {
          console.error('Failed to create post', err);
          throw err;
        }),
      );
  }

  likePost(postId: string): Observable<LikeResponseDto> {
    const token = localStorage.getItem('token');
    const headers = token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : new HttpHeaders();

    return this.http
      .post<LikeResponseDto>(`${this.apiUrl}/${postId}/like`, {}, { headers })
      .pipe(
        catchError((err) => {
          console.error('Failed to like post', err);
          throw err;
        }),
      );
  }

  unlikePost(postId: string): Observable<{ message: string }> {
    const token = localStorage.getItem('token');
    const headers = token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : new HttpHeaders();

    return this.http
      .delete<{ message: string }>(`${this.apiUrl}/${postId}/like`, { headers })
      .pipe(
        catchError((err) => {
          console.error('Failed to unlike post', err);
          throw err;
        }),
      );
  }

  deletePost(postId: string): Observable<{ message: string }> {
    const token = localStorage.getItem('token');
    const headers = token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : new HttpHeaders();

    return this.http
      .delete<{ message: string }>(`${this.apiUrl}/${postId}`, { headers })
      .pipe(
        catchError((err) => {
          console.error('Failed to delete post', err);
          throw err;
        }),
      );
  }

  getPostLikeStatus(postId: string): Observable<{
    postId: string;
    userId: string;
    isLiked: boolean;
  }> {
    const token = localStorage.getItem('token');
    const headers = token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : new HttpHeaders();

    return this.http
      .get<{
        postId: string;
        userId: string;
        isLiked: boolean;
      }>(`${this.apiUrl}/${postId}/likes/status`, { headers })
      .pipe(
        catchError((err) => {
          console.error('Failed to get post like status', err);
          return of({ postId, userId: '', isLiked: false });
        }),
      );
  }

  createComment(
    postId: string,
    content: string,
  ): Observable<{ message: string; comment: CommentResponseDto }> {
    const token = localStorage.getItem('token');
    const headers = token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : new HttpHeaders();

    return this.http
      .post<{
        message: string;
        comment: CommentResponseDto;
      }>(`${this.apiUrl}/${postId}/comments`, { content }, { headers })
      .pipe(
        catchError((err) => {
          console.error('Failed to create comment', err);
          throw err;
        }),
      );
  }

  getPostComments(postId: string): Observable<CommentListResponseDto> {
    return this.http
      .get<CommentListResponseDto>(`${this.apiUrl}/${postId}/comments`)
      .pipe(
        catchError((err) => {
          console.error('Failed to load comments', err);
          return of({ count: 0, comments: [] });
        }),
      );
  }

  deleteComment(commentId: string): Observable<{ message: string }> {
    const token = localStorage.getItem('token');
    const headers = token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : new HttpHeaders();

    return this.http
      .delete<{
        message: string;
      }>(`${this.apiUrl}/comments/${commentId}`, { headers })
      .pipe(
        catchError((err) => {
          console.error('Failed to delete comment', err);
          throw err;
        }),
      );
  }

  updateComment(
    commentId: string,
    content: string,
  ): Observable<{ message: string; comment: CommentResponseDto }> {
    const token = localStorage.getItem('token');
    const headers = token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : new HttpHeaders();

    return this.http
      .patch<{
        message: string;
        comment: CommentResponseDto;
      }>(
        `${this.apiUrl}/comments/${commentId}`,
        { content },
        { headers },
      )
      .pipe(
        catchError((err) => {
          console.error('Failed to update comment', err);
          throw err;
        }),
      );
  }

  getCommentCount(postId: string): Observable<{
    postId: string;
    commentCount: number;
  }> {
    return this.http
      .get<{
        postId: string;
        commentCount: number;
      }>(`${this.apiUrl}/${postId}/comments/count`)
      .pipe(
        catchError((err) => {
          console.error('Failed to get comment count', err);
          return of({ postId, commentCount: 0 });
        }),
      );
  }
}
