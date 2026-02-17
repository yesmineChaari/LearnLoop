import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from '../../chat.service';
import { CreateMessageDto } from '../../dto/chat.dto';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private userSockets: Map<string, string> = new Map(); // userId -> socketId

  constructor(private chatService: ChatService) {}

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    // Remove user from map
    for (const [userId, socketId] of this.userSockets.entries()) {
      if (socketId === client.id) {
        this.userSockets.delete(userId);
      }
    }
  }

  /**
   * Register user socket connection
   */
  @SubscribeMessage('registerUser')
  handleRegisterUser(client: Socket, data: { userId: string }) {
    this.userSockets.set(data.userId, client.id);
    console.log(`User ${data.userId} registered with socket ${client.id}`);
  }

  /**
   * Join a conversation room (user only receives real-time messages after joining)
   * FIXED: No longer sends conversationLoaded - history is loaded via HTTP
   */
  @SubscribeMessage('joinConversation')
  async handleJoinConversation(
    client: Socket,
    data: { conversationId: string; friendRequestId?: string; userId: string },
  ) {
    const roomId = `conversation-${data.conversationId}`;
    client.join(roomId);

    try {
      console.log(
        `User ${data.userId} joined conversation ${data.conversationId}`,
      );
      
      // Acknowledge successful join
      client.emit('conversationJoined', {
        conversationId: data.conversationId,
        message: 'Successfully joined conversation',
      });
    } catch (error) {
      console.error('Error joining conversation:', error);
      client.emit('error', { message: 'Failed to join conversation' });
    }
  }

  /**
   * FIXED: Leave a conversation room to prevent message leaks
   */
  @SubscribeMessage('leaveConversation')
  handleLeaveConversation(
    client: Socket,
    data: { conversationId: string; userId: string },
  ) {
    const roomId = `conversation-${data.conversationId}`;
    client.leave(roomId);
    console.log(
      `User ${data.userId} left conversation ${data.conversationId}`,
    );
  }

  /**
   * Send a message to the conversation
   * FIXED: Includes message ID for deduplication
   */
  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    client: Socket,
    data: {
      conversationId: string;
      content: string;
      senderId: string;
    },
  ) {
    try {
      const createMessageDto: CreateMessageDto = {
        conversationId: data.conversationId,
        content: data.content,
        senderId: data.senderId,
      };

      const savedMessage = await this.chatService.saveMessage(createMessageDto);

      // Populate sender info using ChatService
      const message = await this.chatService.getMessageWithSender(savedMessage.id);

      // Get the conversation to find both users
      const conversation = await this.chatService.getConversationById(data.conversationId);
      const creatorId = conversation?.friendRequest?.creator?.id;
      const receiverId = conversation?.friendRequest?.receiver?.id;
      const otherUserId = creatorId === data.senderId ? receiverId : creatorId;

      const messageData = {
        id: message.id,
        content: message.content,
        senderId: message.sender.id,
        senderName: message.sender.name,
        conversationId: data.conversationId,
        createdAt: message.createdAt,
        files: message.content || [],
      };

      // FIXED: Send to BOTH users globally (not just room members)
      // This ensures notifications work even if user hasn't joined the room yet
      const roomId = `conversation-${data.conversationId}`;
      this.server.to(roomId).emit('newMessage', messageData);

      // Also send directly to the other user if they're not in the room
      const otherUserSocketId = this.userSockets.get(otherUserId);
      if (otherUserSocketId && otherUserSocketId !== conversation?.friendRequest?.creator?.id) {
        this.server.to(otherUserSocketId).emit('newMessage', messageData);
      }

      console.log(`Message saved in conversation ${data.conversationId}`);
    } catch (error) {
      console.error('Error saving message:', error);
      client.emit('error', { message: 'Failed to send message' });
    }
  }

  /**
   * Load conversation history (pagination)
   */
  @SubscribeMessage('loadHistory')
  async handleLoadHistory(
    client: Socket,
    data: { conversationId: string; limit?: number; offset?: number },
  ) {
    try {
      const result = await this.chatService.getConversationHistory(
        data.conversationId,
        data.limit || 50,
        data.offset || 0,
      );

      // Check if result has messages property (paginated response)
      const messages = (result as any).messages || (result as any).messages || [];
      const total = (result as any).total || messages.length;

      client.emit('historyLoaded', {
        messages,
        total,
        offset: data.offset || 0,
      });
    } catch (error) {
      console.error('Error loading history:', error);
      client.emit('error', { message: 'Failed to load history' });
    }
  }
}
