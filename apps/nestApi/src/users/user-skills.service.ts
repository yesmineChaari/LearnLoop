import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserSkillToLearn } from './user-skills-to-learn.entity';
import { UserSkillToTeach } from './user-skills-to-teach.entity'; 

@Injectable()
export class UserSkillsService {
  constructor(
    @InjectRepository(UserSkillToLearn)
    private readonly toLearnRepo: Repository<UserSkillToLearn>,
    @InjectRepository(UserSkillToTeach)
    private readonly toTeachRepo: Repository<UserSkillToTeach>,
  ) {}

  // Get user's skills
  async getUserSkills(userId: string) {
    const skillsToLearn = await this.toLearnRepo.find({
      where: { userId },
      relations: ['skill'],
    });
    const skillsToTeach = await this.toTeachRepo.find({
      where: { userId },
      relations: ['skill'],
    });

    return {
      toLearn: skillsToLearn.map((s) => s.skill),
      toTeach: skillsToTeach.map((s) => s.skill),
    };
  }

  // Update skills
  async updateUserSkills(userId: string, toLearnIds: string[], toTeachIds: string[]) {
    
    // Clear old skills
    await this.toLearnRepo.delete({ userId });
    await this.toTeachRepo.delete({ userId });

    // Insert new ones
    const learnEntities = toLearnIds.map((skillId) =>
      this.toLearnRepo.create({ userId, skillId }),
    );
    const teachEntities = toTeachIds.map((skillId) =>
      this.toTeachRepo.create({ userId, skillId }),
    );

    await this.toLearnRepo.save(learnEntities);
    await this.toTeachRepo.save(teachEntities);

    return this.getUserSkills(userId);
  }
}
