import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TablerIconsModule } from 'angular-tabler-icons';
import { PostService, CommentResponseDto } from 'src/app/services/post-service';

@Component({
  selector: 'app-comment-form',
  imports: [CommonModule, FormsModule, TablerIconsModule],
  templateUrl: './comment-form.html',
  styleUrl: './comment-form.scss',
})
export class CommentForm {
  @Input() postId!: string;
  @Input() userAvatar?: string;
  @Input() userName?: string;
  @Output() commentCreated = new EventEmitter<CommentResponseDto>();

  commentContent = '';
  isSubmitting = false;

  constructor(private postService: PostService) {}

  submitComment(): void {
    if (!this.commentContent.trim()) {
      return;
    }

    this.isSubmitting = true;

    this.postService
      .createComment(this.postId, this.commentContent)
      .subscribe({
        next: (res) => {
          this.commentCreated.emit(res.comment);
          this.commentContent = '';
          this.isSubmitting = false;
        },
        error: (err) => {
          console.error('Failed to create comment:', err);
          this.isSubmitting = false;
          alert('Failed to post comment. Please try again.');
        },
      });
  }
}
