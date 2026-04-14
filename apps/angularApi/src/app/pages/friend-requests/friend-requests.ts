import { DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListItemAvatar } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { map, Observable, Subscription, switchMap, tap } from 'rxjs';
import { MaterialModule } from 'src/app/material.module';
import { FriendRequestService } from 'src/app/services/friend-request-service';
import {  FriendRequestDTO, FriendRequestStatusEnum, OtherUsersService, UserDTO } from 'src/app/services/other-users';

@Component({
  selector: 'app-friend-requests',
  imports: [MaterialModule, MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatTooltipModule, MatCardModule, MatInputModule, MatCheckboxModule,MatIconModule, MaterialModule,RouterLink, MatListItemAvatar, MatButtonModule],
  providers: [OtherUsersService, FriendRequestService],
  templateUrl: './friend-requests.html',
  styleUrl: './friend-requests.scss',
})
export class FriendRequests {


  pendingRequestList : UserDTO[];
  listSubscription$: Subscription;
  constructor(private route:ActivatedRoute, private friendRequestsService: FriendRequestService ){}
  
  ngOnInit(){
    this.listSubscription$ = this.getPendingConnectionList().pipe(
      tap((list: UserDTO[])=> {
        this.pendingRequestList = list;
      })
    ).subscribe();
  }

  acceptRequest(id:string){
    return this.friendRequestsService.respondFriendRequest(id, FriendRequestStatusEnum.ACCEPTED).pipe(
      switchMap(()=> this.getPendingConnectionList()), 
      tap((list: UserDTO[])=> {
        this.pendingRequestList = list; 
      })
    ).subscribe();
  }
  
  declineRequest(id: string){
    return this.friendRequestsService.respondFriendRequest(id, FriendRequestStatusEnum.DECLINED).subscribe({
      next: () => {
        // success! Remove from list
        this.pendingRequestList = this.pendingRequestList.filter(user => user.id !== id);
      }});
  }
  

  getPendingConnectionList(): Observable<UserDTO[]>{
    return this.friendRequestsService.getListPendingRequest();
  }





}
