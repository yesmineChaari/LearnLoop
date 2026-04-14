import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SkillsService } from 'src/app/services/skills.service';
import { UserService } from 'src/app/services/user.service';
import { PostService, FeedPostDto } from 'src/app/services/post-service';
import { SkillDto } from 'src/app/models/skilldto.model';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

import { Post } from 'src/app/components/post/post';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  selector: 'app-profile',
  standalone: true,
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    Post,
    MatCheckboxModule,
  ],
})
export class ProfileComponent {
  user: any;
  draftUser: any;
  isEditing = false;
  skills: SkillDto[] = [];
  skillsToTeach: string[] = [];
  skillsToLearn: string[] = [];
  newSkill: string = '';
  posts: any[] = [];
  isEditingSkills = false;
  originalSkillsToTeach: string[] = [];
  originalSkillsToLearn: string[] = [];

  currentUserId!: string;
  currentUserName!: string;
  currentUserAvatar!: string;

  constructor(
    private userService: UserService,
    private postsService: PostService,
    private router: Router,
    private skillsService: SkillsService,
  ) {}

  ngOnInit() {
    this.loadUser();
    this.loadPosts();
    this.loadSkills();
  }

  loadUser() {
    this.userService.getProfile().subscribe({
      next: (u) => {
        this.user = u;
        this.draftUser = { ...u };
        this.skillsToTeach = u.skillsToTeach?.map((s) => s.id) || [];
        this.skillsToLearn = u.skillsToLearn?.map((s) => s.id) || [];
        this.currentUserId = u.id;
        this.currentUserName = u.name;
        this.currentUserAvatar =
          u.profileImage || 'assets/images/profile/default-avatar.png';
      },
      error: () => this.logout(),
    });
  }

  loadPosts(): void {
    this.postsService.getMyPosts().subscribe({
      next: (res) => {
        this.posts = res.map((p) => ({
          id: p.id,
          author: {
            name: p.author?.name || 'Unknown',
            title: '',
            avatar: p.author?.profileImage || 'assets/images/profile/image.png',
          },
          timestamp: new Date(p.createdAt).toLocaleString(),
          content: p.content,
          image: p.media || undefined,
          likesCount: p.likesCount ?? 0,
          isLiked: p.isLikedByCurrentUser ?? false,
        }));
      },
      error: (err) => console.error(err),
    });
  }

  removePost(postId: string): void {
    this.posts = this.posts.filter((p) => p.id !== postId);
  }

  edit() {
    this.isEditing = true;
    this.draftUser = { ...this.user };
  }

  cancel() {
    this.isEditing = false;
  }

  save() {
    this.userService.updateProfile(this.draftUser).subscribe({
      next: (updated) => {
        this.user = updated;
        this.isEditing = false;
      },
    });
  }

  logout() {
    localStorage.removeItem('token');
    this.router.navigate(['/authentication/login']);
  }

  loadSkills() {
    this.skillsService.getSkills().subscribe({
      next: (skills) => (this.skills = skills),
    });
  }

  toggleSkillToTeach(skillId: string) {
    const index = this.skillsToTeach.indexOf(skillId);
    if (index > -1) this.skillsToTeach.splice(index, 1);
    else this.skillsToTeach.push(skillId);
  }

  toggleSkillToLearn(skillId: string) {
    const index = this.skillsToLearn.indexOf(skillId);
    if (index > -1) this.skillsToLearn.splice(index, 1);
    else this.skillsToLearn.push(skillId);
  }
  addNewSkill() {
    if (!this.newSkill.trim()) return;
    this.skillsService.createSkill(this.newSkill).subscribe({
      next: (s: SkillDto) => {
        this.skills.push(s);
        this.newSkill = '';
      },
    });
  }
  saveSkills() {
    if (!this.user) return;

    const payload = {
      toLearn: this.skillsToLearn,
      toTeach: this.skillsToTeach,
    };
    console.log('Payload for updateSkills:', payload);
    this.userService.updateSkills(payload).subscribe({
      next: () => {
        this.loadUser(); // Reload user to get correct structure
        this.isEditingSkills = false;
        console.log('Skills updated successfully');
      },
      error: (err) => {
        console.error('Failed to update skills', err);
      },
    });
  }
  startEditingSkills() {
    this.isEditingSkills = true;

    // Backup current selections in case user cancels
    this.originalSkillsToTeach = [...this.skillsToTeach];
    this.originalSkillsToLearn = [...this.skillsToLearn];
  }
  cancelEditingSkills() {
    this.isEditingSkills = false;
    this.skillsToTeach = [...this.originalSkillsToTeach];
    this.skillsToLearn = [...this.originalSkillsToLearn];
  }
  get skillsToTeachNames(): string[] {
    return this.skillsToTeach.map(
      (id) => this.skills.find((s) => s.id === id)?.name || 'Unknown',
    );
  }

  get skillsToLearnNames(): string[] {
    return this.skillsToLearn.map(
      (id) => this.skills.find((s) => s.id === id)?.name || 'Unknown',
    );
  }
}
