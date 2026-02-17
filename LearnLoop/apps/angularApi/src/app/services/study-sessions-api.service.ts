import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CreateStudySessionPayload {
    title: string;
    description?: string;
    scheduledAt: string; // ISO string
    link?: string;
    participantId: string;
    subjectTeachId: string;
    subjectLearnId: string;
}

export interface StudySessionResponseDto {
    id: string;
    title: string;
    description?: string;
    scheduledAt: string;
    status: string;
    link?: string;
    creator: { id: string; name: string };
    participant: { id: string; name: string };
    subjectTeach: { id: string; name: string };
    subjectLearn: { id: string; name: string };
    createdAt: string;
    updatedAt: string;
    documents?: { id: string; filename: string }[];
}

export interface DocumentResponseDto {
    id: string;
    filename: string;
}

@Injectable({ providedIn: 'root' })
export class StudySessionsApiService {
    private apiUrl = 'http://localhost:3000/api/study-sessions';

    constructor(private http: HttpClient) { }

    listSessions(status?: 'pending' | 'confirmed' | 'all'): Observable<StudySessionResponseDto[]> {
        const token = localStorage.getItem('token');
        const headers = token
            ? new HttpHeaders({ Authorization: `Bearer ${token}` })
            : new HttpHeaders();

        const url = status ? `${this.apiUrl}?status=${encodeURIComponent(status)}` : this.apiUrl;
        return this.http.get<StudySessionResponseDto[]>(url, { headers });
    }

    createSession(body: CreateStudySessionPayload): Observable<StudySessionResponseDto> {
        const token = localStorage.getItem('token');
        const headers = token
            ? new HttpHeaders({ Authorization: `Bearer ${token}` })
            : new HttpHeaders();

        return this.http.post<StudySessionResponseDto>(`${this.apiUrl}`, body, { headers });
    }

    uploadDocument(sessionId: string, file: File): Observable<DocumentResponseDto> {
        const token = localStorage.getItem('token');
        const headers = token
            ? new HttpHeaders({ Authorization: `Bearer ${token}` })
            : new HttpHeaders();

        const form = new FormData();
        form.append('file', file);
        return this.http.post<DocumentResponseDto>(`${this.apiUrl}/${sessionId}/upload`, form, { headers });
    }

    confirmSession(id: string): Observable<StudySessionResponseDto> {
        const token = localStorage.getItem('token');
        const headers = token
            ? new HttpHeaders({ Authorization: `Bearer ${token}` })
            : new HttpHeaders();

        return this.http.patch<StudySessionResponseDto>(`${this.apiUrl}/${id}/confirm`, {}, { headers });
    }

    cancelSession(id: string): Observable<StudySessionResponseDto> {
        const token = localStorage.getItem('token');
        const headers = token
            ? new HttpHeaders({ Authorization: `Bearer ${token}` })
            : new HttpHeaders();

        return this.http.patch<StudySessionResponseDto>(`${this.apiUrl}/${id}/cancel`, {}, { headers });
    }

    getDocumentDownloadUrl(sessionId: string, docId: string): string {
        return `${this.apiUrl}/${sessionId}/documents/${docId}/download`;
    }

    downloadDocumentBlob(sessionId: string, docId: string): Observable<Blob> {
        const token = localStorage.getItem('token');
        const headers = token
            ? new HttpHeaders({ Authorization: `Bearer ${token}` })
            : new HttpHeaders();
        return this.http.get(`${this.apiUrl}/${sessionId}/documents/${docId}/download`, {
            headers,
            responseType: 'blob' as 'json',
        }) as unknown as Observable<Blob>;
    }
}
