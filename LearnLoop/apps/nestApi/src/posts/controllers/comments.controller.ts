import {
  Controller,
  Get,
  Post as Post,
  Delete,
  Patch,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtGuard } from '../../auth/guards/jwt.guard';
import { CommentsService } from '../services/comments.service';
import { CreateCommentDto } from '../dto/create-comment.dto';
import { CommentResponseDto } from '../dto/comment-response.dto';
import { ParseUUIDPipe } from '@nestjs/common';
import { PostExistsPipe } from '../pipes/post-exists.pipe';
import { CommentExistsPipe } from '../pipes/comment-exists.pipe';

@Controller('posts')
@UseGuards(JwtGuard)
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post(':postId/comments')
  async createComment(
    @Param('postId', new ParseUUIDPipe({ version: '4' }), PostExistsPipe)
    postId: string,
    @Request() req,
    @Body() dto: CreateCommentDto,
  ): Promise<{ message: string; comment: CommentResponseDto }> {
    const userId = req.user.id;
    const comment = await this.commentsService.createComment(
      postId,
      userId,
      dto,
    );

    return {
      message: 'Comment created successfully',
      comment,
    };
  }

  @Get(':postId/comments')
  async getPostComments(
    @Param('postId', new ParseUUIDPipe({ version: '4' }), PostExistsPipe)
    postId: string,
  ): Promise<{ count: number; comments: CommentResponseDto[] }> {
    const comments = await this.commentsService.getPostComments(postId);
    return {
      count: comments.length,
      comments,
    };
  }

  @Delete('comments/:id')
  async deleteComment(
    @Param('id', new ParseUUIDPipe({ version: '4' }), CommentExistsPipe)
    commentId: string,
    @Request() req,
  ): Promise<{ message: string }> {
    const userId = req.user.id;
    await this.commentsService.deleteComment(commentId, userId);

    return { message: 'Comment deleted successfully' };
  }

  @Patch('comments/:id')
  async updateComment(
    @Param('id', new ParseUUIDPipe({ version: '4' }), CommentExistsPipe)
    commentId: string,
    @Request() req,
    @Body() dto: CreateCommentDto,
  ): Promise<{ message: string; comment: CommentResponseDto }> {
    const userId = req.user.id;
    const comment = await this.commentsService.updateComment(
      commentId,
      userId,
      dto,
    );

    return {
      message: 'Comment updated successfully',
      comment,
    };
  }

  @Get(':postId/comments/count')
  async getCommentCount(
    @Param('postId', new ParseUUIDPipe({ version: '4' }), PostExistsPipe)
    postId: string,
  ): Promise<{ postId: string; commentCount: number }> {
    const count = await this.commentsService.getCommentCount(postId);
    return { postId, commentCount: count };
  }
}
