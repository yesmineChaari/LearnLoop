import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { StudySession } from '../study-session.entity';

@Entity('documents')
export class Document {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    filename: string;

    @Column()
    path: string;

    @Column()
    mimetype: string;

    @ManyToOne(() => StudySession, (session) => session.documents, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'session_id' })
    session: StudySession;
}
