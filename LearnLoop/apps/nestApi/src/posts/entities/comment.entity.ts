import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { Post } from './post.entity';
import { User } from '../../users/user.entity';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

@Entity('comments')
export class Comment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  @IsString()
  @IsNotEmpty()
  content: string;

  @Column('uuid')
  @IsUUID()
  @IsNotEmpty()
  postId: string;

  @Column('uuid')
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @ManyToOne(() => Post, (post) => post.comments, { onDelete: 'CASCADE' })
  post: Post;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @CreateDateColumn()
  createdAt: Date;
}
