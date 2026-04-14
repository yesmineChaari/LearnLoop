import { Component, OnInit, ElementRef, ViewChild, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, FormGroupDirective } from '@angular/forms';
import { MaterialModule } from '../../material.module';
import { SkillsService, SkillDto } from '../../services/skills.service';
import { ConnectionsService, ConnectionUserDto } from '../../services/connections.service';
import { StudySessionsApiService } from '../../services/study-sessions-api.service';

@Component({
    selector: 'app-create-session',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, MaterialModule],
    templateUrl: './create-session.html',
    styleUrl: './create-session.scss',
})
export class CreateSession implements OnInit {
    @ViewChild('fileInput') fileInput?: ElementRef<HTMLInputElement>;
    @ViewChild(FormGroupDirective) formGroupDir?: FormGroupDirective;
    form!: FormGroup;
    skills = signal<SkillDto[]>([]);
    connections = signal<ConnectionUserDto[]>([]);
    isSubmitting = signal(false);
    errorMessage = signal('');
    successMessage = signal('');
    hours: number[] = Array.from({ length: 24 }, (_, i) => i);
    minutes: number[] = Array.from({ length: 12 }, (_, i) => i * 5);
    selectedFile = signal<File | null>(null);
    minDate = new Date();

    constructor(
        private fb: FormBuilder,
        private skillsService: SkillsService,
        private connectionsService: ConnectionsService,
        private sessionsApi: StudySessionsApiService,
    ) { }

    ngOnInit(): void {
        this.form = this.fb.group({
            title: ['', [Validators.required, Validators.maxLength(200)]],
            description: [''],
            scheduledDate: ['', [Validators.required]],
            scheduledHour: [null, [Validators.required]],
            scheduledMinute: [0, [Validators.required]],
            link: ['', [this.urlValidator]],
            participantId: ['', [Validators.required]],
            subjectTeachId: ['', [Validators.required]],
            subjectLearnId: ['', [Validators.required]],
        }, { validators: [this.noPastDateTime.bind(this)] });

        this.loadSkills();
        this.loadConnections();
    }

    // Disallow selecting a past datetime
    private noPastDateTime(group: FormGroup) {
        const d = group.get('scheduledDate')?.value;
        const h = group.get('scheduledHour')?.value;
        const m = group.get('scheduledMinute')?.value;
        if (!d || h === null || h === undefined || m === null || m === undefined) {
            return null;
        }
        const date: Date = d instanceof Date ? new Date(d) : new Date(d);
        date.setHours(Number(h));
        date.setMinutes(Number(m));
        date.setSeconds(0);
        date.setMilliseconds(0);
        if (date.getTime() < Date.now()) {
            return { pastDateTime: true };
        }
        return null;
    }

    // Filter available hours based on selected date (no past hours today)
    get validHours(): number[] {
        const d = this.form?.value?.scheduledDate;
        if (!d) return this.hours;
        const selected: Date = d instanceof Date ? new Date(d) : new Date(d);
        const now = new Date();
        if (selected.toDateString() !== now.toDateString()) {
            return this.hours;
        }
        const currentHour = now.getHours();
        return this.hours.filter((h) => h >= currentHour);
    }

    // Filter available minutes based on selected date and hour (5-min steps)
    get validMinutes(): number[] {
        const d = this.form?.value?.scheduledDate;
        const h = this.form?.value?.scheduledHour;
        if (!d || h === null || h === undefined) return this.minutes;
        const selected: Date = d instanceof Date ? new Date(d) : new Date(d);
        const now = new Date();
        if (selected.toDateString() !== now.toDateString()) {
            return this.minutes;
        }
        const currentHour = now.getHours();
        if (h > currentHour) {
            return this.minutes;
        }
        if (h < currentHour) {
            // Shouldn't happen due to validHours, but keep safe
            return [];
        }
        const currentMinute = now.getMinutes();
        const minAllowed = Math.ceil(currentMinute / 5) * 5;
        return this.minutes.filter((m) => m >= minAllowed);
    }

    loadSkills(): void {
        this.skillsService.getSkills().subscribe((skills) => this.skills.set(skills));
    }

    loadConnections(): void {
        this.connectionsService.getAcceptedUsers().subscribe((users) => this.connections.set(users));
    }

    onFileSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0] || null;
        this.selectedFile.set(file);
    }

    clearSelectedFile(): void {
        this.selectedFile.set(null);
        if (this.fileInput?.nativeElement) {
            this.fileInput.nativeElement.value = '';
        }
    }

    private resetFormVisual(): void {
        // Reset the directive to clear the submitted flag and touch states
        this.formGroupDir?.resetForm({
            title: '',
            description: '',
            scheduledDate: '',
            scheduledHour: null,
            scheduledMinute: 0,
            link: '',
            participantId: '',
            subjectTeachId: '',
            subjectLearnId: '',
        });
        // Ensure File input is cleared
        this.clearSelectedFile();
    }

    // Optional URL validator: only http/https allowed
    urlValidator = (control: AbstractControl) => {
        const val = String(control.value || '').trim();
        if (!val) return null; // optional
        try {
            const u = new URL(val);
            if (u.protocol === 'http:' || u.protocol === 'https:') {
                return null;
            }
        } catch (_) {
            // fallthrough to error
        }
        return { invalidUrl: true };
    };

    submit(): void {
        if (this.form.invalid || this.isSubmitting()) {
            this.form.markAllAsTouched();
            return;
        }
        this.errorMessage.set('');
        this.successMessage.set('');
        this.isSubmitting.set(true);

        const value = this.form.value;
        // Compose scheduledAt from date + hour + minute
        const date: Date = value.scheduledDate instanceof Date
            ? new Date(value.scheduledDate)
            : new Date(value.scheduledDate);
        date.setHours(Number(value.scheduledHour ?? 0));
        date.setMinutes(Number(value.scheduledMinute ?? 0));
        date.setSeconds(0);
        date.setMilliseconds(0);
        const scheduledIso = date.toISOString();

        this.sessionsApi
            .createSession({
                title: value.title,
                description: value.description || undefined,
                scheduledAt: scheduledIso,
                link: value.link || undefined,
                participantId: value.participantId,
                subjectTeachId: value.subjectTeachId,
                subjectLearnId: value.subjectLearnId,
            })
            .subscribe({
                next: (created) => {
                    const file = this.selectedFile();
                    if (file) {
                        this.sessionsApi.uploadDocument(created.id, file).subscribe({
                            next: () => {
                                this.successMessage.set('Session and document uploaded successfully');
                                this.resetFormVisual();
                                this.isSubmitting.set(false);
                            },
                            error: (err) => {
                                console.error('Upload document failed', err);
                                this.errorMessage.set(err?.error?.message || 'Document upload failed');
                                this.isSubmitting.set(false);
                            },
                        });
                    } else {
                        this.successMessage.set('Study session created successfully');
                        this.resetFormVisual();
                        this.isSubmitting.set(false);
                    }
                },
                error: (err) => {
                    console.error('Create session failed', err);
                    this.errorMessage.set(err?.error?.message || 'Failed to create session');
                    this.isSubmitting.set(false);
                },
            });
    }
}
