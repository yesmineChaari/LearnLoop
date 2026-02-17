import { IsString, IsUUID, IsOptional, IsArray } from 'class-validator';

export class CreateConversationDto {
  @IsOptional()
  @IsString()
  conversationName?: string;

  @IsArray()
  @IsUUID('4', { each: true })
  memberIds: string[];
}
