import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { FriendRequestDTO, FriendRequestStatusEnum, UserDTO } from './other-users';
import { FriendRequests } from '../pages/friend-requests/friend-requests';

@Injectable({
  providedIn: 'root',
})
export class FriendRequestService {
  private apiUrl = 'http://localhost:3000/api';
  private httpOptions: {headers: HttpHeaders} = {
    headers: new HttpHeaders({ 'content-Type':'application/json'}), 
  };


  constructor(private http: HttpClient){}

  getListPendingRequest(): Observable<UserDTO[]>{
    return this.http.get<UserDTO[]>(`${this.apiUrl}/friend-requests/pending`);
  }

  getMyFriends(): Observable<UserDTO[]>{
    return this.http.get<UserDTO[]>(`${this.apiUrl}/friend-requests/friends`);
  }

  respondFriendRequest(id: string,statusResponse: FriendRequestStatusEnum.ACCEPTED | FriendRequestStatusEnum.DECLINED ): Observable<FriendRequestDTO | {error : string}>{
    return this.http.put<FriendRequestDTO>(`${this.apiUrl}/friend-requests/response/${id}`, {"status":statusResponse}, this.httpOptions);
  }

  getUserFromConnection(id:string): Observable<UserDTO>{
    return this.http.get<FriendRequestDTO>(`${this.apiUrl}/user/${id}`);
  }
}
