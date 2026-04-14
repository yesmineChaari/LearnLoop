import { Expose, Type, plainToInstance } from 'class-transformer';
import { StudySession } from '../study-session.entity';
import { Document } from '../documents/document.entity';

export class StudySessionUserDto {
    @Expose()
    id!: string;

    @Expose()
    name!: string;
}

export class StudySessionSkillDto {
    @Expose()
    id!: string;

    @Expose()
    name!: string;
}

export class StudySessionResponseDto {
    @Expose()
    id!: string;

    @Expose()
    title!: string;

    @Expose()
    description?: string;

    @Expose()
    scheduledAt!: Date;

    @Expose()
    status!: string;

    @Expose()
    link?: string;

    @Expose()
    @Type(() => StudySessionUserDto)
    creator!: StudySessionUserDto;

    @Expose()
    @Type(() => StudySessionUserDto)
    participant!: StudySessionUserDto;

    @Expose()
    @Type(() => StudySessionSkillDto)
    subjectTeach!: StudySessionSkillDto;

    @Expose()
    @Type(() => StudySessionSkillDto)
    subjectLearn!: StudySessionSkillDto;

    @Expose()
    createdAt!: Date;

    @Expose()
    updatedAt!: Date;

    @Expose()
    @Type(() => StudySessionDocumentDto)
    documents?: StudySessionDocumentDto[];
}

export class StudySessionDocumentDto {
    @Expose()
    id!: string;

    @Expose()
    filename!: string;
}

export function toStudySessionResponseDto(entity: StudySession): StudySessionResponseDto {
    // Build a lean plain object to avoid leaking fields
    const plain = {
        id: entity.id,
        title: entity.title,
        description: entity.description,
        scheduledAt: entity.scheduledAt,
        status: entity.status,
        link: entity.link,
        creator: entity.creator ? { id: entity.creator.id, name: entity.creator.name } : undefined,
        participant: entity.participant ? { id: entity.participant.id, name: entity.participant.name } : undefined,
        subjectTeach: entity.subjectTeach ? { id: entity.subjectTeach.id, name: entity.subjectTeach.name } : undefined,
        subjectLearn: entity.subjectLearn ? { id: entity.subjectLearn.id, name: entity.subjectLearn.name } : undefined,
        createdAt: entity.createdAt,
        updatedAt: entity.updatedAt,
        documents: Array.isArray(entity.documents)
            ? entity.documents.map((d: Document) => ({ id: d.id, filename: d.filename }))
            : undefined,
    };

    return plainToInstance(StudySessionResponseDto, plain, { excludeExtraneousValues: true });
}
