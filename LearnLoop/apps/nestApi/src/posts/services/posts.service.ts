import {
  Injectable,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from '../entities/post.entity';
import { PostLike } from '../entities/post-like.entity';
import { FriendRequestsService } from '../../friend-requests/friend-requests.service';
import { CreatePostDto } from '../dto/create-post.dto';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(PostLike)
    private readonly postLikeRepository: Repository<PostLike>,
    private readonly friendRequestsService: FriendRequestsService,
  ) {}

  async createPost(userId: string, dto: CreatePostDto): Promise<Post> {
    const post = this.postRepository.create({
      authorId: userId,
      content: dto.content,
      media: dto.media ?? null,
    });
    return this.postRepository.save(post);
  }
  async getFriendsFeed(userId: string): Promise<Post[]> {
    const friendIds = await this.friendRequestsService.getFriendIds(userId);
    if (!friendIds.length) return [];
    return this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .where('post.authorId IN (:...friendIds)', { friendIds })
      .orderBy('post.createdAt', 'DESC')
      .select([
        'post.id',
        'post.content',
        'post.media',
        'post.createdAt',
        'author.id',
        'author.name',
        'author.profileImage',
      ])
      .getMany();
  }

  async findByUser(userId: string): Promise<Post[]> {
    try {
      return this.postRepository
        .createQueryBuilder('post')
        .leftJoinAndSelect('post.author', 'author')
        .where('post.authorId = :userId', { userId })
        .orderBy('post.createdAt', 'DESC')
        .select([
          'post.id',
          'post.content',
          'post.media',
          'post.createdAt',
          'author.id',
          'author.name',
          'author.email',
          'author.profileImage',
        ])
        .getMany();
    } catch (error) {
      console.error('Error fetching posts by user:', error);
      throw error;
    }
  }

  async likePost(postId: string, userId: string): Promise<PostLike> {
    const existingLike = await this.postLikeRepository.findOne({
      where: { postId, userId },
    });
    if (existingLike) {
      throw new BadRequestException('User has already liked this post');
    }
    const postLike = this.postLikeRepository.create({
      postId,
      userId,
    });
    return this.postLikeRepository.save(postLike);
  }
  async unlikePost(postId: string, userId: string): Promise<void> {
    const postLike = await this.postLikeRepository.findOne({
      where: { postId, userId },
    });
    if (!postLike) {
      throw new BadRequestException('User has not liked this post');
    }
    await this.postLikeRepository.remove(postLike);
  }
  async isPostLikedByUser(postId: string, userId: string): Promise<boolean> {
    const like = await this.postLikeRepository.findOne({
      where: { postId, userId },
    });
    return !!like;
  }

  async getPostLikesCount(postId: string): Promise<number> {
    return this.postLikeRepository.count({
      where: { postId },
    });
  }

  async deletePost(postId: string, userId: string): Promise<void> {
    const result = await this.postRepository.delete({
      id: postId,
      authorId: userId,
    });
    if (!result.affected) {
      throw new ForbiddenException('You can only delete your own posts');
    }
  }
}
