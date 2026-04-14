import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TablerIconsModule } from 'angular-tabler-icons';
import { PostData } from '../post/post';
import { PostService } from 'src/app/services/post-service';

@Component({
  selector: 'app-create-post',
  imports: [CommonModule, FormsModule, TablerIconsModule],
  templateUrl: './create-post.html',
  styleUrl: './create-post.scss',
})
export class CreatePost {
  @Output() postCreated = new EventEmitter<PostData>();

  postContent: string = '';
  postImage: string = '';
  isFormOpen: boolean = false;

  currentUser = {
    id: '',
    name: 'You',
    avatar: 'assets/images/profile/image.png',
    title: 'User',
  };

  isSubmitting = false;

  constructor(private postService: PostService) {
    this.loadCurrentUser();
  }

  loadCurrentUser(): void {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        this.currentUser = {
          id: user.id || '',
          name: user.name || 'You',
          avatar: user.profileImage || 'assets/images/profile/image.png',
          title: 'User',
        };
      } catch (e) {
        console.error('Failed to parse user from localStorage', e);
      }
    }
  }

  openForm(): void {
    this.isFormOpen = true;
  }

  closeForm(): void {
    this.isFormOpen = false;
    this.resetForm();
  }

  submitPost(): void {
    if (!this.postContent.trim()) {
      alert('Please write something before posting!');
      return;
    }

    this.isSubmitting = true;
    this.postService
      .createPost({ content: this.postContent, media: this.postImage || null })
      .subscribe({
        next: (res) => {
          const newPost: PostData = {
            id: res.id,
            author: {
              id: this.currentUser.id,
              name: this.currentUser.name,
              title: this.currentUser.title,
              avatar: this.currentUser.avatar,
            },
            timestamp: res.createdAt
              ? new Date(res.createdAt).toLocaleString()
              : 'just now',
            content: res.content,
            image: res.media || undefined,
            likesCount: res.likesCount ?? 0,
            isLiked: res.isLikedByCurrentUser ?? false,
          };
          this.postCreated.emit(newPost);
          this.resetForm();
          this.closeForm();
        },
        error: () => {
          alert('Failed to create post. Please try again.');
        },
        complete: () => {
          this.isSubmitting = false;
        },
      });
  }

  private resetForm(): void {
    this.postContent = '';
    this.postImage = '';
  }
}
