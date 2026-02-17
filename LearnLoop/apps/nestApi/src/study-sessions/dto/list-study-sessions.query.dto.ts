import { IsOptional, IsIn } from 'class-validator';
import { Transform } from 'class-transformer';
import { StudySessionStatusEnum } from '../study-session.entity';

export class ListStudySessionsQueryDto {
    @IsOptional()
    @Transform(({ value }) => (value === undefined || value === null ? undefined : String(value).toLowerCase()))
    @IsIn([...Object.values(StudySessionStatusEnum), 'all'])
    status?: StudySessionStatusEnum | 'all';
}
