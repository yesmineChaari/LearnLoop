import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface ConnectionUserDto {
    id: string;
    name: string;
}

@Injectable({ providedIn: 'root' })
export class ConnectionsService {
    private apiUrl = 'http://localhost:3000/api/friend-requests/friends';

    constructor(private http: HttpClient) { }

    getAcceptedUsers(): Observable<ConnectionUserDto[]> {
        const token = localStorage.getItem('token');
        const headers = token
            ? new HttpHeaders({ Authorization: `Bearer ${token}` })
            : new HttpHeaders();

        return this.http.get<Array<{ id: string; name: string }>>(`${this.apiUrl}`, { headers }).pipe(
            catchError((err) => {
                console.error('Failed to load connections', err);
                return of([]);
            })
        );
    }
}
