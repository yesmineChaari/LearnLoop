import { Get, Module, UseGuards } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UserService } from './user.service';
import { UsersController } from './controllers/users.controller';
import { UserSkillsService } from './user-skills.service';
import { UserSkillsController } from './controllers/user-skills.controller';
import { UserSkillToLearn } from './user-skills-to-learn.entity';
import { UserSkillToTeach } from './user-skills-to-teach.entity';
import { SkillsModule } from '../skills/skills.module';
import { FriendRequestEntity } from '../friend-requests/friend-request.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      FriendRequestEntity,
      UserSkillToLearn,
      UserSkillToTeach,
    ]),
    SkillsModule,
  ],
  exports: [UserService],
  providers: [UserService, UserSkillsService],
  controllers: [UsersController, UserSkillsController],
})
export class UsersModule {}
