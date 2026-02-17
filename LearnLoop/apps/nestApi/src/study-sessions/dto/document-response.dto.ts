import { Expose, plainToInstance } from 'class-transformer';
import { Document } from '../documents/document.entity';

export class DocumentResponseDto {
    @Expose()
    id!: string;

    @Expose()
    filename!: string;
}

export function toDocumentResponseDto(entity: Document): DocumentResponseDto {
    const plain = {
        id: entity.id,
        filename: entity.filename,
    };
    return plainToInstance(DocumentResponseDto, plain, { excludeExtraneousValues: true });
}
