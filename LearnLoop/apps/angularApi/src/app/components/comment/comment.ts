import {
  Component,
  Input,
  Output,
  EventEmitter,
  signal,
  afterNextRender,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TablerIconsModule } from 'angular-tabler-icons';
import { RouterLink } from '@angular/router';
import { PostService, CommentResponseDto } from 'src/app/services/post-service';

@Component({
  selector: 'app-comment',
  imports: [CommonModule, FormsModule, TablerIconsModule, RouterLink],
  templateUrl: './comment.html',
  styleUrl: './comment.scss',
})
export class Comment {
  @Input() comment!: CommentResponseDto;
  @Input() currentUserId!: string;
  @Output() commentDeleted = new EventEmitter<string>();
  @Output() commentUpdated = new EventEmitter<CommentResponseDto>();

  isEditing = signal(false);
  editContent = signal('');
  isDeleting = signal(false);
  isUpdating = signal(false);

  constructor(private postService: PostService) {
    afterNextRender(() => {
      if (this.comment && this.comment.content) {
        this.editContent.set(this.comment.content);
      }
    });
  }

  toggleEdit(): void {
    if (this.isEditing()) {
      this.editContent.set(this.comment.content);
    }
    this.isEditing.update((v) => !v);
  }

  saveEdit(): void {
    const content = this.editContent();
    if (!content.trim()) {
      return;
    }

    this.isUpdating.set(true);

    this.postService.updateComment(this.comment.id, content).subscribe({
      next: (res) => {
        this.comment = res.comment;
        this.editContent.set(res.comment.content);
        this.isEditing.set(false);
        this.isUpdating.set(false);
        this.commentUpdated.emit(res.comment);
      },
      error: (err) => {
        console.error('Failed to update comment:', err);
        this.isUpdating.set(false);
        alert('Failed to update comment');
      },
    });
  }

  deleteComment(): void {
    if (!confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    this.isDeleting.set(true);

    this.postService.deleteComment(this.comment.id).subscribe({
      next: () => {
        this.isDeleting.set(false);
        this.commentDeleted.emit(this.comment.id);
      },
      error: (err) => {
        console.error('Failed to delete comment:', err);
        this.isDeleting.set(false);
        alert('Failed to delete comment');
      },
    });
  }

  getTimestamp(): string {
    return new Date(this.comment.createdAt).toLocaleString();
  }

  isAuthor(): boolean {
    return this.currentUserId === this.comment.userId;
  }
}
