import { IsNotEmpty, IsOptional, IsString, MaxLength, IsUrl, IsUUID, IsDateString } from 'class-validator';

export class CreateStudySessionDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(200)
    title: string;

    @IsString()
    @IsOptional()
    @MaxLength(2000)
    description?: string;

    // ISO date-time string; converted to Date server-side
    @IsNotEmpty()
    @IsDateString()
    scheduledAt: string;

    @IsOptional()
    @IsUrl({ protocols: ['http', 'https'] }, { message: 'Link must be a valid http(s) URL' })
    link?: string;

    @IsUUID()
    @IsNotEmpty()
    participantId: string;

    @IsUUID()
    @IsNotEmpty()
    subjectTeachId: string;

    @IsUUID()
    @IsNotEmpty()
    subjectLearnId: string;
}
