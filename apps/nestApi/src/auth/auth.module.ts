import { Module } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { AuthController } from './controllers/auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/user.entity'
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './guards/jwt.strategy';
import { JwtGuard } from './guards/jwt.guard';
import { FriendRequestEntity } from '../friend-requests/friend-request.entity';
import { UsersModule } from '../users/users.module';
import { PostsModule } from '../posts/posts.module';
import{ ProfileController } from './controllers/profile.controller';
import { Skill } from '../skills/skills.entity';
@Module({
  imports: [JwtModule.register({
    secret: process.env.JWT_SECRET, signOptions: { expiresIn: '1h' } }),
    TypeOrmModule.forFeature([User, Skill ,FriendRequestEntity])
    , UsersModule, PostsModule],
  providers: [AuthService, JwtStrategy, JwtGuard],
  controllers: [AuthController, ProfileController]
})
export class AuthModule {}
