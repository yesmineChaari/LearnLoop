import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudySession } from './study-session.entity';
import { StudySessionsService } from './study-sessions.service';
import { Document } from './documents/document.entity';
import { StudySessionsController } from './study-sessions.controller';
import { FriendRequestsModule } from '../friend-requests/friend-requests.module';
import { EnsureFriendsGuard } from './guards/ensure-friends.guard';

@Module({
  imports: [TypeOrmModule.forFeature([StudySession, Document]), FriendRequestsModule],
  controllers: [StudySessionsController],
  providers: [StudySessionsService, EnsureFriendsGuard],
  exports: [StudySessionsService],
})
export class StudySessionsModule { }
