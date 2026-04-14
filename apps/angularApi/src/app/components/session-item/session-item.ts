import { Component, EventEmitter, Output, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../material.module';
import { StudySessionResponseDto } from '../../services/study-sessions-api.service';

export type SessionItemMode = 'invited' | 'created';

@Component({
    selector: 'app-session-item',
    standalone: true,
    imports: [CommonModule, MaterialModule],
    templateUrl: './session-item.html',
    styleUrl: './session-item.scss',
})
export class SessionItemComponent {
    session = input.required<StudySessionResponseDto>();
    mode = input<SessionItemMode>('invited');

    // Control display of actions and their disabled state
    canConfirm = input<boolean>(false);
    canCancel = input<boolean>(false);
    confirming = input<boolean>(false);
    cancelling = input<boolean>(false);

    @Output() confirmClick = new EventEmitter<void>();
    @Output() cancelClick = new EventEmitter<void>();
    @Output() downloadDocument = new EventEmitter<{ id: string; filename: string }>();

    get icon(): string {
        return this.mode() === 'invited' ? 'mail' : 'calendar';
    }

    get counterpartLabel(): string {
        return this.mode() === 'invited' ? 'From' : 'With';
    }

    get counterpartName(): string | undefined {
        const s = this.session();
        return this.mode() === 'invited' ? s.creator?.name : s.participant?.name;
    }

    onConfirm(): void {
        if (!this.canConfirm() || this.confirming()) return;
        this.confirmClick.emit();
    }

    onCancel(): void {
        if (!this.canCancel() || this.cancelling()) return;
        this.cancelClick.emit();
    }

    onDownload(d: { id: string; filename: string }): void {
        this.downloadDocument.emit(d);
    }
}
