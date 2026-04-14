import {
  Controller,
  Get,
  UseGuards,
  Request,
  Post as Post,
  Delete,
  Body,
  Req,
  Param,
} from '@nestjs/common';
import { ValidationPipe, UsePipes } from '@nestjs/common';
import { JwtGuard } from '../../auth/guards/jwt.guard';
import { PostsService } from '../services/posts.service';
import { CreatePostDto } from '../dto/create-post.dto';
import { ParseUUIDPipe } from '@nestjs/common';
import { PostExistsPipe } from '../pipes/post-exists.pipe';

@Controller('posts')
@UseGuards(JwtGuard)
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get('feed')
  async getFriendsFeed(@Request() req) {
    const userId = req.user.id;
    const posts = await this.postsService.getFriendsFeed(userId);
    const safePosts = await this.toSafePosts(posts, userId);
    return { count: safePosts.length, posts: safePosts };
  }

  @Post()
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async createPost(@Request() req, @Body() dto: CreatePostDto) {
    const userId = req.user.id;
    const created = await this.postsService.createPost(userId, dto);

    return {
      id: created.id,
      content: created.content,
      media: created.media,
      likesCount: 0,
      isLikedByCurrentUser: false,
      createdAt: created.createdAt,
      author: {
        id: userId,
      },
    };
  }

  @Get('me')
  async getMyPosts(@Req() req: any) {
    const userId = req.user.id;
    const posts = await this.postsService.findByUser(userId);
    const safePosts = await this.toSafePosts(posts, userId);
    return { count: safePosts.length, posts: safePosts };
  }

  @Post(':id/like')
  async likePost(
    @Param('id', new ParseUUIDPipe({ version: '4' }), PostExistsPipe)
    postId: string,
    @Request() req,
  ) {
    const userId = req.user.id;
    const like = await this.postsService.likePost(postId, userId);
    return {
      message: 'Post liked successfully',
      like: {
        id: like.id,
        postId: like.postId,
        userId: like.userId,
        createdAt: like.createdAt,
      },
    };
  }

  @Delete(':id/like')
  async unlikePost(
    @Param('id', new ParseUUIDPipe({ version: '4' }), PostExistsPipe)
    postId: string,
    @Request() req,
  ) {
    const userId = req.user.id;
    await this.postsService.unlikePost(postId, userId);
    return { message: 'Post unliked successfully' };
  }

  @Delete(':id')
  async deletePost(
    @Param('id', new ParseUUIDPipe({ version: '4' }), PostExistsPipe)
    postId: string,
    @Request() req,
  ) {
    const userId = req.user.id;
    await this.postsService.deletePost(postId, userId);
    return { message: 'Post deleted successfully' };
  }

  @Get(':id/likes/count')
  async getPostLikesCount(
    @Param('id', new ParseUUIDPipe({ version: '4' }), PostExistsPipe)
    postId: string,
  ) {
    const count = await this.postsService.getPostLikesCount(postId);
    return { postId, likesCount: count };
  }

  @Get(':id/likes/status')
  async getPostLikeStatus(
    @Param('id', new ParseUUIDPipe({ version: '4' }), PostExistsPipe)
    postId: string,
    @Request() req,
  ) {
    const userId = req.user.id;
    const isLiked = await this.postsService.isPostLikedByUser(postId, userId);
    return { postId, userId, isLiked };
  }

  private async toSafePosts(posts: any[], currentUserId: string) {
    return Promise.all(
      posts.map(async (p) => ({
        id: p.id,
        content: p.content,
        media: p.media,
        likesCount: await this.postsService.getPostLikesCount(p.id),
        isLikedByCurrentUser: await this.postsService.isPostLikedByUser(
          p.id,
          currentUserId,
        ),
        createdAt: p.createdAt,
        author: {
          id: p.author?.id,
          name: p.author?.name,
          profileImage: p.author?.profileImage,
        },
      })),
    );
  }
}
