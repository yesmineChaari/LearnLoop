// src/users/user-skills-to-learn.entity.ts
import { Entity, PrimaryColumn, ManyToOne } from 'typeorm';
import { User } from './user.entity';
import { Skill } from '../skills/skills.entity';

@Entity('user_skills_to_learn')
export class UserSkillToLearn {
  @PrimaryColumn('uuid')
  userId: string;

  @PrimaryColumn('uuid')
  skillId: string;

  @ManyToOne(() => User, (user) => user.skillsToLearn)
  user: User;

  @ManyToOne(() => Skill)
  skill: Skill;
}
