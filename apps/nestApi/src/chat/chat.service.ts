import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversation } from './entities/conversation.entity';
import { Message } from './entities/message.entity';
import { CreateMessageDto } from './dto/chat.dto';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Conversation)
    private conversationRepository: Repository<Conversation>,
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
  ) {}

  /**
   * Get conversation by friendRequestId with eager-loaded messages and friendRequest
   */
  async getConversationByFriendRequestId(friendRequestId: string): Promise<Conversation> {
    const conversation = await this.conversationRepository.findOne({
      where: { friendRequest: { id: friendRequestId } },
      relations: ['friendRequest', 'friendRequest.creator', 'friendRequest.receiver', 'messages', 'messages.sender'],
      order: { messages: { createdAt: 'ASC' } },
    });
    return conversation;
  }

  /**
   * Get conversation by two user IDs (creates one if it doesn't exist)
   */
  async getConversationByUserIds(userId1: string, userId2: string): Promise<Conversation | null> {
    const conversation = await this.conversationRepository
      .createQueryBuilder('conversation')
      .leftJoinAndSelect('conversation.friendRequest', 'friendRequest')
      .leftJoinAndSelect('friendRequest.creator', 'creator')
      .leftJoinAndSelect('friendRequest.receiver', 'receiver')
      .leftJoinAndSelect('conversation.messages', 'messages')
      .leftJoinAndSelect('messages.sender', 'sender')
      .where(
        '(friendRequest.creatorId = :userId1 AND friendRequest.receiverId = :userId2) OR (friendRequest.creatorId = :userId2 AND friendRequest.receiverId = :userId1)',
        { userId1, userId2 },
      )
      .orderBy('messages.createdAt', 'ASC')
      .getOne();

    return conversation || null;
  }

  /**
   * Get or create conversation by two user IDs
   */
  async getOrCreateConversationByUserIds(userId1: string, userId2: string): Promise<Conversation> {
    let conversation = await this.getConversationByUserIds(userId1, userId2);

    if (!conversation) {
      // Create a new conversation with a friend request
      const friendRequest = await this.conversationRepository.manager
        .getRepository('FriendRequestEntity')
        .findOne({
          where: [
            { creator: { id: userId1 }, receiver: { id: userId2 } },
            { creator: { id: userId2 }, receiver: { id: userId1 } },
          ],
        });

      if (friendRequest) {
        conversation = this.conversationRepository.create({
          friendRequest,
        });
        conversation = await this.conversationRepository.save(conversation);
        conversation.messages = [];
      }
    }

    return conversation;
  }

  /**
   * Get all messages for a conversation
   */
  async getConversationMessages(conversationId: string): Promise<Message[]> {
    return this.messageRepository.find({
      where: { conversation: { id: conversationId } },
      relations: ['sender'],
      order: { createdAt: 'ASC' },
    });
  }

  /**
   * Save a new message to the database
   */
  async saveMessage(createMessageDto: CreateMessageDto): Promise<Message> {
    const message = this.messageRepository.create({
      content: createMessageDto.content,
      sender: { id: createMessageDto.senderId },
      conversation: { id: createMessageDto.conversationId },
    });
    return this.messageRepository.save(message);
  }

  /**
   * Get conversation history (paginated if needed)
   */
  async getConversationHistory(
    conversationId: string,
    limit?: number,
    offset?: number,
  ): Promise<Conversation | { messages: Message[]; total: number }> {
    // If limit/offset provided, return paginated messages
    if (limit !== undefined && offset !== undefined) {
      const [messages, total] = await this.messageRepository.findAndCount({
        where: { conversation: { id: conversationId } },
        relations: ['sender'],
        order: { createdAt: 'DESC' },
        take: limit,
        skip: offset,
      });
      return {
        messages: messages.reverse(),
        total,
      };
    }

    // Otherwise return full conversation object
    return this.conversationRepository.findOne({
      where: { id: conversationId },
      relations: ['friendRequest', 'friendRequest.creator', 'friendRequest.receiver', 'messages', 'messages.sender'],
      order: { messages: { createdAt: 'ASC' } },
    });
  }

  /**
   * Get a message by ID with sender information
   */
  async getMessageWithSender(messageId: string): Promise<Message> {
    return this.messageRepository.findOne({
      where: { id: messageId },
      relations: ['sender'],
    });
  }

  /**
   * Get conversation by ID with both users (for message broadcasting)
   */
  async getConversationById(conversationId: string): Promise<Conversation> {
    return this.conversationRepository.findOne({
      where: { id: conversationId },
      relations: ['friendRequest', 'friendRequest.creator', 'friendRequest.receiver'],
    });
  }
}
