// src/posts/post.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsUUID,
  IsUrl,
} from 'class-validator';
import { User } from '../../users/user.entity';
import { PostLike } from './post-like.entity';
import { Comment } from './comment.entity';

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  @IsUUID()
  @IsNotEmpty()
  authorId: string;

  @ManyToOne(() => User, { nullable: false })
  @IsNotEmpty()
  author: User;

  @Column('text')
  @IsString()
  @IsNotEmpty()
  content: string;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsUrl()
  media: string;

  @OneToMany(() => PostLike, (postLike) => postLike.post, { cascade: true })
  likes: PostLike[];

  @OneToMany(() => Comment, (comment) => comment.post, { cascade: true })
  comments: Comment[];

  @CreateDateColumn()
  createdAt: Date;
}
