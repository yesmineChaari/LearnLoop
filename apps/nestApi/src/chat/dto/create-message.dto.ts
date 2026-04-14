import { IsString, IsUUID, IsOptional, IsArray } from 'class-validator';

export class CreateMessageDto {
  @IsString()
  text: string;

  @IsUUID()
  conversationId: string;

  @IsUUID()
  senderId: string;

  @IsOptional()
  @IsArray()
  fileUrls?: string[];
}
