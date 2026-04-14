import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from '../entities/comment.entity';
import { Post } from '../entities/post.entity';
import { CreateCommentDto } from '../dto/create-comment.dto';
import { CommentResponseDto } from '../dto/comment-response.dto';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
  ) {}
  async createComment(
    postId: string,
    userId: string,
    dto: CreateCommentDto,
  ): Promise<CommentResponseDto> {
    const comment = this.commentRepository.create({
      postId,
      userId,
      content: dto.content,
    });
    const saved = await this.commentRepository.save(comment);
    return this.getCommentWithUser(saved.id);
  }

  async getPostComments(postId: string): Promise<CommentResponseDto[]> {
    return this.commentRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.user', 'user')
      .where('comment.postId = :postId', { postId })
      .orderBy('comment.createdAt', 'DESC')
      .select([
        'comment.id',
        'comment.content',
        'comment.postId',
        'comment.userId',
        'comment.createdAt',
        'user.id',
        'user.name',
        'user.profileImage',
      ])
      .getMany()
      .then((comments) => comments.map((c) => this.toDto(c)));
  }

  async deleteComment(commentId: string, userId: string): Promise<void> {
    const comment = await this.commentRepository.findOneOrFail({
      where: { id: commentId },
    });

    if (comment.userId !== userId) {
      throw new BadRequestException('You can only delete your own comments');
    }

    await this.commentRepository.remove(comment);
  }

  async updateComment(
    commentId: string,
    userId: string,
    dto: CreateCommentDto,
  ): Promise<CommentResponseDto> {
    const comment = await this.commentRepository.findOneOrFail({
      where: { id: commentId },
    });

    if (comment.userId !== userId) {
      throw new BadRequestException('You can only update your own comments');
    }

    comment.content = dto.content;
    await this.commentRepository.save(comment);

    return this.getCommentWithUser(commentId);
  }

  async getCommentCount(postId: string): Promise<number> {
    if (!postId) {
      throw new BadRequestException('Invalid post ID');
    }

    return this.commentRepository.count({ where: { postId } });
  }

  private async getCommentWithUser(
    commentId: string,
  ): Promise<CommentResponseDto> {
    const comment = await this.commentRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.user', 'user')
      .where('comment.id = :id', { id: commentId })
      .select([
        'comment.id',
        'comment.content',
        'comment.postId',
        'comment.userId',
        'comment.createdAt',
        'user.id',
        'user.name',
        'user.profileImage',
      ])
      .getOne();

    if (!comment) {
      throw new NotFoundException(`Comment with id ${commentId} not found`);
    }

    return this.toDto(comment);
  }

  private toDto(c: Comment): CommentResponseDto {
    return {
      id: c.id,
      content: c.content,
      postId: c.postId,
      userId: c.userId,
      createdAt: c.createdAt,
      user: c.user
        ? {
            id: c.user.id,
            name: c.user.name,
            profileImage: c.user.profileImage,
          }
        : undefined,
    };
  }
}
