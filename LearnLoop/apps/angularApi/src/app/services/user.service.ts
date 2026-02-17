import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from '../models/user.model';
import { HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UserService {
  private apiUrl = 'http://localhost:3000/api/users';

  constructor(private http: HttpClient) {}

  getProfile() {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<User>(`${this.apiUrl}/me`, { headers });
  }
  updateProfile(data: Partial<User>) {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.put<User>(`${this.apiUrl}/me`, data, { headers });
  }
  updateSkills(payload: { toTeach: string[]; toLearn: string[] }): Observable<User> {
    const token = localStorage.getItem('token') || '';
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;

    // PUT to /users/skills (make sure backend endpoint exists)
    return this.http.put<User>(`${this.apiUrl}/skills`, payload, { headers });
  }
  searchUsers(params: any) {
    // GET /users with query params (name, skillsToTeach, skillsToLearn, etc.)
    return this.http.get<any>(this.apiUrl, { params });
  }
  logout() {
    localStorage.removeItem('token');
    window.location.href = '/authentication/login';
  }
}