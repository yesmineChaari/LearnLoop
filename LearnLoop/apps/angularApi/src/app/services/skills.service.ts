import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface SkillDto {
    id: string;
    name: string;
}

@Injectable({ providedIn: 'root' })
export class SkillsService {
    private apiUrl = 'http://localhost:3000/api/skills';

    constructor(private http: HttpClient) { }

    getSkills(): Observable<SkillDto[]> {
        const token = localStorage.getItem('token');
        const headers = token
            ? new HttpHeaders({ Authorization: `Bearer ${token}` })
            : new HttpHeaders();

        return this.http.get<SkillDto[]>(`${this.apiUrl}`, { headers }).pipe(
            catchError((err) => {
                console.error('Failed to load skills', err);
                return of([]);
            })
        );
    }

    createSkill(name: string): Observable<SkillDto> {
  const token = localStorage.getItem('token');
  const headers = token
    ? new HttpHeaders({ Authorization: `Bearer ${token}` })
    : new HttpHeaders();

  return this.http.post<SkillDto>(`${this.apiUrl}`, { name }, { headers }).pipe(
    catchError((err) => {
      console.error('Failed to create skill', err);
      throw err;
    }),
  );
}

}
