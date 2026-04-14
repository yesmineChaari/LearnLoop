import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../material.module';
import { SessionItemComponent } from '../session-item/session-item';
import { StudySessionsApiService, StudySessionResponseDto } from '../../services/study-sessions-api.service';
import { AuthService } from '../../services/auth.service';

type StatusFilter = 'pending' | 'confirmed' | 'all';

@Component({
    selector: 'app-sessions-list',
    standalone: true,
    imports: [CommonModule, MaterialModule, SessionItemComponent],
    templateUrl: './sessions-list.html',
    styleUrl: './sessions-list.scss',
})
export class SessionsList implements OnInit {
    status = signal<StatusFilter>('pending');
    loading = signal(false);
    error = signal('');
    sessions = signal<StudySessionResponseDto[]>([]);
    me = signal<string | null>(null);
    confirming = signal<Record<string, boolean>>({});
    cancelling = signal<Record<string, boolean>>({});

    invitedSessions = computed(() => {
        const meId = this.me();
        if (!meId) return [] as StudySessionResponseDto[];
        const list = this.sessions();
        const byCreatedDesc = (a: StudySessionResponseDto, b: StudySessionResponseDto) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        return list.filter((s) => s.participant?.id === meId).sort(byCreatedDesc);
    });

    createdSessions = computed(() => {
        const meId = this.me();
        if (!meId) return [] as StudySessionResponseDto[];
        const list = this.sessions();
        const byCreatedDesc = (a: StudySessionResponseDto, b: StudySessionResponseDto) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        return list.filter((s) => s.creator?.id === meId).sort(byCreatedDesc);
    });

    constructor(private api: StudySessionsApiService, private auth: AuthService) { }

    ngOnInit(): void {
        this.me.set(this.auth.getUserId());
        this.load();
    }

    setFilter(status: StatusFilter): void {
        if (this.status() === status) return;
        this.status.set(status);
        this.load();
    }

    load(): void {
        this.loading.set(true);
        this.error.set('');
        this.api.listSessions(this.status()).subscribe({
            next: (list) => {
                this.sessions.set(list);
                this.loading.set(false);
            },
            error: (err) => {
                console.error('Failed to load sessions', err);
                this.error.set(err?.error?.message || 'Failed to load sessions');
                this.loading.set(false);
            },
        });
    }

    canConfirm(s: StudySessionResponseDto): boolean {
        const meId = this.me();
        return s.status === 'pending' && !!meId && s.participant?.id === meId;
    }

    confirm(s: StudySessionResponseDto): void {
        const confirming = this.confirming();
        if (!this.canConfirm(s) || confirming[s.id]) return;
        this.confirming.update((m) => ({ ...m, [s.id]: true }));
        this.api.confirmSession(s.id).subscribe({
            next: (updated) => {
                this.sessions.update((list) => {
                    const idx = list.findIndex((x) => x.id === s.id);
                    if (idx >= 0) {
                        const copy = list.slice();
                        copy[idx] = updated;
                        return copy;
                    }
                    return list;
                });
                this.confirming.update((m) => ({ ...m, [s.id]: false }));
            },
            error: (err) => {
                console.error('Confirm failed', err);
                this.error.set(err?.error?.message || 'Failed to confirm session');
                this.confirming.update((m) => ({ ...m, [s.id]: false }));
            },
        });
    }

    canCancel(s: StudySessionResponseDto): boolean {
        const meId = this.me();
        if (s.status !== 'confirmed' || !meId) return false;
        return s.creator?.id === meId || s.participant?.id === meId;
    }

    cancel(s: StudySessionResponseDto): void {
        const cancelling = this.cancelling();
        if (!this.canCancel(s) || cancelling[s.id]) return;
        this.cancelling.update((m) => ({ ...m, [s.id]: true }));
        this.api.cancelSession(s.id).subscribe({
            next: (updated) => {
                this.sessions.update((list) => {
                    const copy = list.slice();
                    const idx = copy.findIndex((x) => x.id === s.id);
                    if (idx >= 0) copy[idx] = updated;
                    return copy.filter((x) => x.id !== s.id || x.status !== 'canceled');
                });
                this.cancelling.update((m) => ({ ...m, [s.id]: false }));
            },
            error: (err) => {
                console.error('Cancel failed', err);
                this.error.set(err?.error?.message || 'Failed to cancel session');
                this.cancelling.update((m) => ({ ...m, [s.id]: false }));
            },
        });
    }

    downloadUrl(sessionId: string, docId: string): string {
        return this.api.getDocumentDownloadUrl(sessionId, docId);
    }

    downloadDoc(s: StudySessionResponseDto, d: { id: string; filename: string }): void {
        this.api.downloadDocumentBlob(s.id, d.id).subscribe({
            next: (blob) => {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = d.filename || 'document.pdf';
                a.click();
                URL.revokeObjectURL(url);
            },
            error: (err) => {
                console.error('Download failed', err);
                this.error.set(err?.error?.message || 'Failed to download document');
            },
        });
    }
}
