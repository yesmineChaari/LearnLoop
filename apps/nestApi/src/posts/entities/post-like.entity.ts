import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  Unique,
} from 'typeorm';
import { Post } from './post.entity';
import { User } from '../../users/user.entity';
import { IsNotEmpty, IsUUID } from 'class-validator';

@Entity('post_likes')
@Unique('UQ_post_user_like', ['post', 'user'])
export class PostLike {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  @IsUUID()
  @IsNotEmpty()
  postId: string;

  @Column('uuid')
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @ManyToOne(() => Post, (post) => post.likes, { onDelete: 'CASCADE' })
  post: Post;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @CreateDateColumn()
  createdAt: Date;
}
