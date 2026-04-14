import {
  Component,
  EventEmitter,
  Input,
  Output,
  signal,
  afterNextRender,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TablerIconsModule } from 'angular-tabler-icons';
import { PostService, CommentResponseDto } from 'src/app/services/post-service';
import { Comment } from '../comment/comment';
import { CommentForm } from '../comment-form/comment-form';
import { RouterLink } from '@angular/router';

export interface PostData {
  id: string;
  author: {
    id: string;
    name: string;
    title: string;
    avatar: string;
  };
  timestamp: string;
  content: string;
  image?: string;
  likesCount: number;
  isLiked: boolean;
}

@Component({
  selector: 'app-post',
  imports: [CommonModule, TablerIconsModule, Comment, CommentForm, RouterLink],
  templateUrl: './post.html',
  styleUrl: './post.scss',
})
export class Post {
  @Input() post!: PostData;
  @Input() currentUserId!: string;
  @Input() currentUserName!: string;
  @Input() currentUserAvatar!: string;
  @Input() canDelete: boolean = false;
  @Output() postDeleted = new EventEmitter<string>();

  isLoadingLike = signal(false);
  isLoadingComments = signal(false);
  showComments = signal(false);
  comments = signal<CommentResponseDto[]>([]);
  commentCount = signal(0);
  isDeleting = signal(false);

  constructor(private postService: PostService) {
    afterNextRender(() => this.loadCommentCount());
  }

  likePost(): void {
    
    if (this.isLoadingLike()) return;
    this.isLoadingLike.set(true);

    if (this.post.isLiked) {
      this.postService.unlikePost(this.post.id).subscribe({
        next: () => {
          this.post.likesCount--;
          this.post.isLiked = false;
          this.isLoadingLike.set(false);
        },
        error: (err) => {
          console.error('Error unliking post:', err);
          this.isLoadingLike.set(false);
        },
      });
    } else {

      this.postService.likePost(this.post.id).subscribe({
        next: () => {
          this.post.likesCount++;
          this.post.isLiked = true;
          this.isLoadingLike.set(false);
        },
        error: (err) => {
          console.error('Error liking post:', err);
          this.isLoadingLike.set(false);
        },
      });
    }
  }

  loadCommentCount(): void {
    if (!this.post || !this.post.id) return;
    this.postService.getCommentCount(this.post.id).subscribe({
      next: (res) => {
        this.commentCount.set(res.commentCount);
      },
      error: (err) => {
        console.error('Error loading comment count:', err);
      },
    });
  }

  toggleComments(): void {
    if (this.showComments()) {
      this.showComments.set(false);
    } else {
      this.showComments.set(true);
      if (this.comments().length === 0) {
        this.loadComments();
      }
    }
  }

  loadComments(): void {
    if (this.isLoadingComments()) return;

    this.isLoadingComments.set(true);

    this.postService.getPostComments(this.post.id).subscribe({
      next: (res) => {
        this.comments.set(res.comments);
        this.isLoadingComments.set(false);
      },
      error: (err) => {
        console.error('Error loading comments:', err);
        this.isLoadingComments.set(false);
      },
    });
  }

  onCommentCreated(comment: CommentResponseDto): void {
    this.comments.update((list) => [comment, ...list]);
    this.commentCount.update((c) => c + 1);
  }

  onCommentDeleted(commentId: string): void {
    this.comments.update((list) => list.filter((c) => c.id !== commentId));
    this.commentCount.update((c) => Math.max(0, c - 1));
  }

  onCommentUpdated(comment: CommentResponseDto): void {
    this.comments.update((list) => {
      const index = list.findIndex((c) => c.id === comment.id);
      if (index > -1) {
        const copy = list.slice();
        copy[index] = comment;
        return copy;
      }
      return list;
    });
  }

  deletePost(): void {
    if (!this.canDelete || this.isDeleting()) return;
    this.isDeleting.set(true);
    this.postService.deletePost(this.post.id).subscribe({
      next: () => {
        this.isDeleting.set(false);
        this.postDeleted.emit(this.post.id);
      },
      error: (err) => {
        console.error('Error deleting post:', err);
        this.isDeleting.set(false);
      },
    });
  }
}
