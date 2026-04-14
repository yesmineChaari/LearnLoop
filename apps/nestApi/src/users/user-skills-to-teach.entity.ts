// src/users/user-skills-to-teach.entity.ts
import { Entity, PrimaryColumn, ManyToOne } from 'typeorm';
import { User } from './user.entity';
import { Skill } from '../skills/skills.entity';

@Entity('user_skills_to_teach')
export class UserSkillToTeach {
  @PrimaryColumn('uuid')
  userId: string;

  @PrimaryColumn('uuid')
  skillId: string;

  @ManyToOne(() => User, (user) => user.skillsToTeach)
  user: User;

  @ManyToOne(() => Skill)
  skill: Skill;
}
