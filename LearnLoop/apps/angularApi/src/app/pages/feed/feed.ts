import { Component, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Post, PostData } from '../../components/post/post';
import { CreatePost } from '../../components/create-post/create-post';
import { PostService } from 'src/app/services/post-service';

@Component({
  selector: 'app-feed',
  imports: [CommonModule, Post, CreatePost],
  templateUrl: './feed.html',
  styleUrl: './feed.scss',
})
export class Feed {
  posts = signal<PostData[]>([]);
  user = signal<{ id: string; name: string; avatar: string }>({
    id: '',
    name: '',
    avatar: '',
  });
  private postService = inject(PostService);
  constructor() {
    effect(() => {
      this.loadCurrentUser();
      this.loadPosts();
    });
  }
  loadCurrentUser(): void {
    const userStr = localStorage.getItem('user');
    console.log('Loading current user from localStorage:', userStr);
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        this.user.set({
          id: user.id,
          name: user.name,
          avatar: user.profileImage || '',
        });
        console.log('Current user loaded:', {
          id: this.user().id,
          name: this.user().name,
          avatar: this.user().avatar,
        });
      } catch (e) {
        console.error('Failed to parse user from localStorage', e);
      }
    } else {
      console.warn(
        'No user data found in localStorage. User may need to log in again.',
      );
    }
  }

  loadPosts(): void {
    this.postService.getFriendsFeed().subscribe((res) => {
      const mapped = res.posts.map((p) => ({
        id: p.id,
        author: {
          id: p.author.id,
          name: p.author.name ,
          title: '',
          avatar: p.author?.profileImage || 'assets/images/profile/image.png',
        },
        timestamp: new Date(p.createdAt).toLocaleString(),
        content: p.content,
        image: p.media || undefined,
        likesCount: p.likesCount ?? 0,
        isLiked: p.isLikedByCurrentUser ?? false,
      }));
      this.posts.set(mapped);
    });
  }

  onPostCreated(newPost: PostData): void {
    this.posts.update((arr) => [newPost, ...arr]);
  }
}
