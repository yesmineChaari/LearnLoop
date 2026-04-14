import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FriendRequestEntity } from './friend-request.entity';
import { FriendRequestsService } from './friend-requests.service';
import { FriendRequestsController } from './friend-requests.controller';
import { UserService } from '../users/user.service';
import { UsersModule } from '../users/users.module';
import { Conversation } from '../chat/entities/conversation.entity';
import { Message } from '../chat/entities/message.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FriendRequestEntity, Conversation, Message]), UsersModule],
  providers: [FriendRequestsService],
  controllers: [FriendRequestsController],
  exports: [FriendRequestsService],
})
export class FriendRequestsModule {}
