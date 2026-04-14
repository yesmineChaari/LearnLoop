import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { PostLike } from './entities/post-like.entity';
import { Comment } from './entities/comment.entity';
import { PostsService } from './services/posts.service';
import { PostsController } from './controllers/posts.controller';
import { CommentsService } from './services/comments.service';
import { CommentsController } from './controllers/comments.controller';
import { FriendRequestsModule } from '../friend-requests/friend-requests.module';
import { PostExistsPipe } from './pipes/post-exists.pipe';
import { CommentExistsPipe } from './pipes/comment-exists.pipe';

@Module({
  imports: [
    TypeOrmModule.forFeature([Post, PostLike, Comment]),
    FriendRequestsModule,
  ],
  providers: [PostsService, CommentsService, PostExistsPipe, CommentExistsPipe],
  controllers: [PostsController, CommentsController],
  exports: [PostsService],
})
export class PostsModule {}
