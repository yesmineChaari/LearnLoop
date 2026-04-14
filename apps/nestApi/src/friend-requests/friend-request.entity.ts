import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToOne,
} from 'typeorm';
import { User } from '../users/user.entity';
import { FriendRequestStatusEnum } from './friend-request.interface';
import { Conversation } from '../chat/entities/conversation.entity';

@Entity('Connections')
export class FriendRequestEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.sentFriendRequest)
  creator: User;
  
  @ManyToOne(() => User, (user) => user.receivedFriendRequest)
  receiver: User;

  @Column({
    type: 'enum',
    enum: FriendRequestStatusEnum,
    default: FriendRequestStatusEnum.PENDING
  })
  status: FriendRequestStatusEnum;

  // Corrected: Linked to the Conversation entity's 'friendRequest' property
  @OneToOne(() => Conversation, (conversation) => conversation.friendRequest, { 
    nullable: true, 
    cascade: true 
  })
  conversation?: Conversation;
}