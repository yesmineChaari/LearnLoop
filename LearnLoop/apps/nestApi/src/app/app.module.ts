import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { FriendRequestsModule } from '../friend-requests/friend-requests.module';
import { SkillsModule } from '../skills/skills.module';
import { ChatModule } from '../chat/chat.module';
import { User } from '../users/user.entity';
import { Skill } from '../skills/skills.entity';
import { UserSkillToLearn } from '../users/user-skills-to-learn.entity';
import { UserSkillToTeach } from '../users/user-skills-to-teach.entity';
import { Post } from '../posts/entities/post.entity';
import { PostsModule } from '../posts/posts.module';
import { StudySessionsModule } from '../study-sessions/study-sessions.module';
import { StudySession } from '../study-sessions/study-session.entity';
import { Document } from '../study-sessions/documents/document.entity';
import { Conversation } from '../chat/entities/conversation.entity';
import { Message } from '../chat/entities/message.entity';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'apps/nestApi/.env',
    }),
    AuthModule,
    UsersModule,
    FriendRequestsModule,
    SkillsModule,
    PostsModule,
    StudySessionsModule,
    ChatModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      entities: [
        User,
        Skill,
        UserSkillToLearn,
        UserSkillToTeach,
        Post,
        Message,
        Conversation,
        StudySession,
        Document,
        Conversation,
        Message,
      ],

      autoLoadEntities: true,
      ssl: {
        rejectUnauthorized: false,
      },
      synchronize: true,
    }),
  ],
})
export class AppModule {}
