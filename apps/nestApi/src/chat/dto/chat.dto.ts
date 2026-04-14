import { IsString, IsNotEmpty, IsUUID } from 'class-validator';
import { User } from '../../users/user.entity';

export class CreateMessageDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsUUID()
  @IsNotEmpty()
  conversationId: string;

  @IsUUID()
  @IsNotEmpty()
  senderId: string;
}

export class MessageDto {
  id: string;
  content: string;
  sender: User;
  conversationId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Removed CreateConversationDto - conversations are auto-created when friend request accepted

export class ConversationDto {
  id: string;
  user1: User; // friend request creator
  user2: User; // friend request receiver
  messages: MessageDto[];
  createdAt: Date;
  updatedAt: Date;
}

// Internal DTO for when creating conversation on friend request acceptance
export class CreateConversationFromFriendRequestDto {
  @IsUUID()
  @IsNotEmpty()
  friendRequestId: string;
}

