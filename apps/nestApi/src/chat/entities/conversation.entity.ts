// conversation.entity.ts
import { Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany, OneToOne, JoinColumn } from 'typeorm';
import { Message } from './message.entity'; // Verify this path is correct
import { FriendRequestEntity } from '../../friend-requests/friend-request.entity';

@Entity('conversations')
export class Conversation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => FriendRequestEntity, (fr) => fr.conversation, { eager: true })
  @JoinColumn({ name: 'friendRequestId' })
  friendRequest: FriendRequestEntity;

  // FIX: Ensure the arrow function points to Message and references message.conversation
  @OneToMany(() => Message, (message) => message.conversation, {
    cascade: true,
  })
  messages: Message[];

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}