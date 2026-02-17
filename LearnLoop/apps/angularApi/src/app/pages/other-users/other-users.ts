import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, map, Observable, Subscription, switchMap, take, tap } from 'rxjs';
import { Post } from 'src/app/components/post/post';
import { User } from 'src/app/models/user.model';
import { FriendRequestDTO, FriendRequestStatusEnum, OtherUsersService, UserDTO } from 'src/app/services/other-users';
import { SkillDto } from 'src/app/services/skills.service';


@Component({
  selector: 'app-other-users',
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
  providers: [OtherUsersService],
  templateUrl: './other-users.html',
  styleUrl: './other-users.scss',
})
export class OtherUsers implements OnInit, OnDestroy {
  friendRequestStatusEnum = FriendRequestStatusEnum; 

  user: UserDTO; 
  friendRequestStatus: FriendRequestStatusEnum;
  friendRequestStatusSubscription$: Subscription; 
  userSubscription$: Subscription;
  posts: any[] = [];
  userService: any;
  skillsToTeach: any[]= [];
  skillsToLearn: any[]= [];
  currentUserId: any;
  currentUserName: any;
  currentUserAvatar: any;
  skillsService: any;
  skills: any[]= [];
  postsService: any;
  
  constructor(private route: ActivatedRoute, private otherUserService: OtherUsersService, private router:Router){}

  ngOnInit(){
    this.getUserIdFromUrl().pipe(
    switchMap(userId => {
      // Fetch both status and user details at the same time
      return forkJoin({
        status: this.otherUserService.getConnectionStatus(userId),
        user: this.otherUserService.getConnectionUser(userId)
      });
    }),
    tap(({ status, user }) => {
      this.friendRequestStatus = status;
      this.user = user;
      console.log('Status loaded:', this.friendRequestStatus);
    })
  ).subscribe();
    this.loadUser();
    this.loadPosts();
    this.loadSkills();
  }

  private getUserIdFromUrl(): Observable<string>{
    return this.route.params.pipe(
      map(params => params['id'])
    );
  }

  loadUser() {
    this.userService.getProfile().subscribe({
      next: (u:UserDTO) => {
        this.skillsToTeach = u.skillsToTeach?.map((s) => s.id) || [];
        this.skillsToLearn = u.skillsToLearn?.map((s) => s.id) || [];
        this.currentUserAvatar =
          u.profileImage || 'assets/images/profile/default-avatar.png';
      },
      error: () => this.logout(),
    });
  }

  loadSkills() {
    this.skillsService.getSkills().subscribe({
      next: (skills: any) => (this.skills = skills),
    });
  }

  loadPosts(): void {
    this.postsService.getMyPosts().subscribe({
      next: (res: any[]) => {
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
      error: (err: any) => console.error(err),
    });
  }


  logout() {
    localStorage.removeItem('token');
    this.router.navigate(['/authentication/login']);
  }


  get skillsToTeachNames(): string[] {
    return this.skillsToTeach.map(
      (id: any) => this.skills.find((s: { id: any; }) => s.id === id)?.name || 'Unknown',
    );
  }

  get skillsToLearnNames(): string[] {
    return this.skillsToLearn.map(
      (id: any) => this.skills.find((s: { id: any; }) => s.id === id)?.name || 'Unknown',
    );
  }

  





  addUser(): Subscription {
    this.friendRequestStatus= this.friendRequestStatusEnum.PENDING; 
    return this.getUserIdFromUrl().pipe(
      switchMap((userId: string)=>{
        return this.otherUserService.addConnection(userId);
      })
    ).pipe(take(1)).subscribe(); 
  }

  getUser(): Observable<UserDTO>{
    return this.getUserIdFromUrl().pipe(
      switchMap((userId:string)=> {
        return this.otherUserService.getConnectionUser(userId);
      })
    )
  }

  ngOnDestroy(): void {
    this.userSubscription$.unsubscribe();
    this.friendRequestStatusSubscription$.unsubscribe(); 
  }

  getFriendRequestStatus(): Observable<FriendRequestStatusEnum> {
    return this.getUserIdFromUrl().pipe(
      switchMap((userId: string)=> {
        return this.otherUserService.getConnectionStatus(userId); 
      })
    )
  }

}
