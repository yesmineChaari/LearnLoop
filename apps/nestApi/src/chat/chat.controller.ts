import { Controller, Get, Param, UseGuards, NotFoundException } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtGuard } from '../auth/guards/jwt.guard';

@Controller('chat')
@UseGuards(JwtGuard)
export class ChatController {
  constructor(private chatService: ChatService) {}

  /**
   * Get or create conversation between two users
   * FIXED: Always creates conversation if it doesn't exist, never returns null ID
   */
  @Get('conversation/users/:userId1/:userId2')
  async getConversationByUserIds(
    @Param('userId1') userId1: string,
    @Param('userId2') userId2: string,
  ) {
    // Use getOrCreateConversationByUserIds to ensure conversation always exists
    const conversation = await this.chatService.getOrCreateConversationByUserIds(userId1, userId2);
    
    if (!conversation) {
      throw new NotFoundException('Unable to create or retrieve conversation');
    }

    return {
      id: conversation.id,
      messages: (conversation.messages || []).map((msg: any) => ({
        id: msg.id,
        content: msg.content,
        senderId: msg.sender?.id,
        sender: msg.sender ? {
          id: msg.sender.id,
          name: msg.sender.name,
          email: msg.sender.email,
          profileImage: msg.sender.profileImage,
        } : null,
        createdAt: msg.createdAt,
        files: msg.files || [],
      })),
      friendRequest: conversation.friendRequest,
    };
  }
}
