import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Skill } from '../skills/skills.entity';
import { FriendRequestEntity } from '../friend-requests/friend-request.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string; // hashed

  @Column({ type: 'text', nullable: true })
  bio?: string;

  @Column({ nullable: true })
  profileImage?: string; // URL

  @ManyToMany(() => Skill, { eager: true }) // eager loads the skills
  @JoinTable({
    name: 'user_skills_to_learn',
    joinColumn: { name: 'userId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'skillId', referencedColumnName: 'id' },
  })
  skillsToLearn: Skill[];

  @ManyToMany(() => Skill, { eager: true })
  @JoinTable({
    name: 'user_skills_to_teach',
    joinColumn: { name: 'userId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'skillId', referencedColumnName: 'id' },
  })
  skillsToTeach: Skill[];

  // Links to connection table
  @OneToMany(() => FriendRequestEntity, (friendRequestEntity) => friendRequestEntity.creator)
  sentFriendRequest: FriendRequestEntity[];

  @OneToMany(() => FriendRequestEntity, (friendRequestEntity) => friendRequestEntity.receiver)
  receivedFriendRequest: FriendRequestEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
