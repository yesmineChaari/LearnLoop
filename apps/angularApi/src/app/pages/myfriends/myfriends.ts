import { Component } from '@angular/core';
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
import { Observable, Subscription, tap } from 'rxjs';
import { MaterialModule } from 'src/app/material.module';
import { FriendRequestService } from 'src/app/services/friend-request-service';
import { FriendRequestStatusEnum, UserDTO } from 'src/app/services/other-users';

@Component({
  selector: 'app-myfriends',
  imports: [MaterialModule, MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatTooltipModule, MatCardModule, MatInputModule, MatCheckboxModule,MatIconModule, MaterialModule,RouterLink, MatListItemAvatar, MatButtonModule],
  templateUrl: './myfriends.html',
  styleUrl: './myfriends.scss',
})
export class Myfriends {
  friendsList : UserDTO[];
  listSubscription$: Subscription;
  constructor(private route:ActivatedRoute, private friendRequestsService: FriendRequestService ){}
  
  ngOnInit(){
    this.listSubscription$ = this.getFriendsList().pipe(
      tap((list: UserDTO[])=> {
        this.friendsList = list;
      })
    ).subscribe();
  }

  
  
  

  getFriendsList(): Observable<UserDTO[]>{
    return this.friendRequestsService.getMyFriends();
  }
}
