import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Skill } from '../skills/skills.entity';
import { User } from '../users/user.entity';
import { Document } from './documents/document.entity';

export enum StudySessionStatusEnum {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELED = 'canceled',
}

@Entity('study_sessions')
export class StudySession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Skill, { nullable: false })
  @JoinColumn({ name: 'subjectTeachId' })
  subjectTeach: Skill;

  @ManyToOne(() => Skill, { nullable: false })
  @JoinColumn({ name: 'subjectLearnId' })
  subjectLearn: Skill;

  @Column({
    type: 'enum',
    enum: StudySessionStatusEnum,
    enumName: 'study_sessions_status_enum',
    default: StudySessionStatusEnum.PENDING,
  })
  status: StudySessionStatusEnum;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  @Column({ type: 'varchar', nullable: false })
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  // Relations to users
  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'creatorid' })
  creator: User;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'participantid' })
  participant: User;

  @Column({ name: 'scheduledat', type: 'timestamp' })
  scheduledAt: Date;

  @Column({ type: 'varchar', nullable: false })
  link: string;

  // Attached documents
  @OneToMany(() => Document, (doc) => doc.session, { cascade: true })
  documents: Document[];
}
