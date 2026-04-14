import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { SkillDto } from '../models/skilldto.model';


export interface UserDTO {
  id?: string;
  name?: string;
  email?: string;
  password?: string;
  bio?: string;
  profileImage?: string;
  skillsToTeach?: SkillDto[];
  skillsToLearn?: SkillDto[];
}

export enum FriendRequestStatusEnum {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  DECLINED = 'declined',
  WAITING_TO_BE_ACCEPTED = 'waiting-for-current-user-approval',
  NOTHING_SENT = 'nothing-sent',
}

export interface FriendRequestDTO {
  id: string;
  creatorId: string;
  receiverId: string;
  status: FriendRequestStatusEnum;
}

@Injectable({
  providedIn: 'root',
})
export class OtherUsersService {
  getListPendingRequest(userId: string): any {
    throw new Error('Method not implemented.');
  }

  private apiUrl = 'http://localhost:3000/api';
  private httpOptions: { headers: HttpHeaders } = {
    headers: new HttpHeaders({ 'content-Type': 'application/json' }),
  };

  constructor(private http: HttpClient) {}

  getConnectionUser(id: string): Observable<UserDTO> {
    return this.http.get<UserDTO>(`${this.apiUrl}/users/${id}`);
  }

  getConnectionStatus(id: string): Observable<FriendRequestStatusEnum> {
    return this.http.get(`${this.apiUrl}/friend-requests/status/${id}`, {
      responseType: 'text',
    }) as Observable<FriendRequestStatusEnum>;
  }

  addConnection(id: string): Observable<FriendRequestDTO | { error: string }> {
    return this.http.post<FriendRequestDTO | { error: string }>(
      `${this.apiUrl}/friend-requests/send/${id}`,
      {},
      this.httpOptions,
    );
  }
}
