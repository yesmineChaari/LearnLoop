import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatGateway } from './gateway/chat/chat.gateway';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { AuthModule } from '../auth/auth.module';
import { Conversation } from './entities/conversation.entity';
import { Message } from './entities/message.entity';
import { FriendRequestEntity } from '../friend-requests/friend-request.entity';


@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([
      Conversation,
      Message,
      FriendRequestEntity,
    ]),
  ],
  providers: [ChatGateway, ChatService],
  controllers: [ChatController],
})
export class ChatModule {}
