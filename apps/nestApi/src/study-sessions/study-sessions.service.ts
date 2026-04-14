import { Injectable, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { StudySession, StudySessionStatusEnum } from './study-session.entity';
import { User } from '../users/user.entity';
import { Skill } from '../skills/skills.entity';
import { CreateStudySessionDto } from './dto/create-study-session.dto';
import { Document } from './documents/document.entity';

@Injectable()
export class StudySessionsService {
    constructor(
        @InjectRepository(StudySession)
        private readonly sessionsRepo: Repository<StudySession>,
        @InjectRepository(Document)
        private readonly documentsRepo: Repository<Document>,
    ) { }

    async create(dto: CreateStudySessionDto, creatorId: string): Promise<StudySession> {

        // Friendship precondition enforced by EnsureFriendsGuard before controller

        const scheduled = new Date(dto.scheduledAt);
        if (isNaN(scheduled.getTime())) {
            throw new BadRequestException('Invalid scheduledAt date');
        }
        if (scheduled.getTime() < Date.now()) {
            throw new BadRequestException('Scheduled time must be in the future');
        }

        // URL validity is ensured by DTO validation (ValidationPipe)

        const session = this.sessionsRepo.create({
            title: dto.title,
            description: dto.description,
            status: StudySessionStatusEnum.PENDING,
            scheduledAt: scheduled,
            link: dto.link,
            // Set relations by id to avoid fetching full entities
            creator: { id: creatorId } as User,
            participant: { id: dto.participantId } as User,
            subjectTeach: { id: dto.subjectTeachId } as Skill,
            subjectLearn: { id: dto.subjectLearnId } as Skill,
        });

        return this.sessionsRepo.save(session);
    }

    async confirm(sessionId: string, actorUserId: string): Promise<StudySession> {
        const session = await this.sessionsRepo.findOne({
            where: { id: sessionId },
            relations: ['creator', 'participant'],
        });
        if (!session) throw new NotFoundException('Session not found');

        // Only the participant is allowed to confirm
        if (session.participant.id !== actorUserId) {
            throw new ForbiddenException('Only the participant may confirm this session');
        }

        // Friendship precondition enforced by EnsureFriendsGuard before controller

        session.status = StudySessionStatusEnum.CONFIRMED;
        return this.sessionsRepo.save(session);
    }

    async cancel(sessionId: string, actorUserId: string): Promise<StudySession> {
        const session = await this.sessionsRepo.findOne({
            where: { id: sessionId },
            relations: ['creator', 'participant'],
        });
        if (!session) throw new NotFoundException('Session not found');

        // Only participants in the session can cancel (creator or participant)
        if (session.creator.id !== actorUserId && session.participant.id !== actorUserId) {
            throw new ForbiddenException('Not authorized to cancel this session');
        }

        // Only confirmed sessions can be canceled per requirements
        if (session.status !== StudySessionStatusEnum.CONFIRMED) {
            throw new BadRequestException('Only confirmed sessions can be canceled');
        }

        session.status = StudySessionStatusEnum.CANCELED;
        return this.sessionsRepo.save(session);
    }

    // Scoped to a specific user to avoid leaking all sessions
    async listByStatus(userId: string, status: StudySessionStatusEnum): Promise<StudySession[]> {
        return this.sessionsRepo.find({
            where: [
                { status, creator: { id: userId } },
                { status, participant: { id: userId } },
            ],
            relations: ['subjectTeach', 'subjectLearn', 'creator', 'participant', 'documents'],
            order: { createdAt: 'DESC' },
        });
    }

    async listAllForUser(userId: string): Promise<StudySession[]> {
        // Return only active sessions (exclude canceled)
        return this.sessionsRepo.find({
            where: [
                { status: In([StudySessionStatusEnum.PENDING, StudySessionStatusEnum.CONFIRMED]), creator: { id: userId } },
                { status: In([StudySessionStatusEnum.PENDING, StudySessionStatusEnum.CONFIRMED]), participant: { id: userId } },
            ],
            relations: ['subjectTeach', 'subjectLearn', 'creator', 'participant', 'documents'],
            order: { createdAt: 'DESC' },
        });
    }


    async getById(id: string): Promise<StudySession | null> {
        return this.sessionsRepo.findOne({
            where: { id },
            relations: ['subjectTeach', 'subjectLearn', 'creator', 'participant', 'documents'],
        });
    }

    async attachDocument(sessionId: string, file: any, actorUserId?: string): Promise<Document> {
        const session = await this.sessionsRepo.findOne({
            where: { id: sessionId },
            relations: ['creator', 'participant'],
        });
        if (!session) throw new NotFoundException('Session not found');

        if (actorUserId && session.creator.id !== actorUserId && session.participant.id !== actorUserId) {
            throw new ForbiddenException('Not authorized to upload to this session');
        }

        const destination = (file as any).destination || 'apps/nestApi/uploads';
        const normalizedDest = String(destination).replace(/\\/g, '/');
        const path = `${normalizedDest}/${file.filename}`;

        const doc = this.documentsRepo.create({
            filename: file.filename,
            path,
            mimetype: file.mimetype,
            session,
        });
        return this.documentsRepo.save(doc);
    }

    async ensureCanAccessSession(sessionId: string, actorUserId: string): Promise<StudySession> {
        const session = await this.sessionsRepo.findOne({
            where: { id: sessionId },
            relations: ['creator', 'participant'],
        });
        if (!session) throw new NotFoundException('Session not found');
        if (session.creator.id !== actorUserId && session.participant.id !== actorUserId) {
            throw new ForbiddenException('Not authorized');
        }
        return session;
    }

    async getDocumentOrThrow(docId: string): Promise<Document> {
        const doc = await this.documentsRepo.findOne({ where: { id: docId }, relations: ['session'] });
        if (!doc) throw new NotFoundException('Document not found');
        return doc;
    }
}
