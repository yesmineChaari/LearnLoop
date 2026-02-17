import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Skill } from './skills.entity';

@Injectable()
export class SkillsService {
    constructor(
        @InjectRepository(Skill)
        private readonly skillsRepo: Repository<Skill>,
    ) { }

    async listAll(): Promise<Array<{ id: string; name: string }>> {
        const skills = await this.skillsRepo.find({ select: ['id', 'name'] });
        return skills.map((s) => ({ id: s.id, name: s.name }));
    }

    async create(name: string): Promise<{ id: string; name: string }> {
        const skill = this.skillsRepo.create({ name });
        const saved = await this.skillsRepo.save(skill);
        return { id: saved.id, name: saved.name };
    }

    async seedDefaults(): Promise<Array<{ id: string; name: string }>> {
        const existing = await this.skillsRepo.count();
        if (existing > 0) {
            return this.listAll();
        }
        const defaults = [
            'Mathematics',
            'Physics',
            'Chemistry',
            'Biology',
            'Computer Science',
            'History',
            'Literature',
            'Art',
            'Music',
            'Economics',
        ];
        const entities = defaults.map((name) => this.skillsRepo.create({ name }));
        await this.skillsRepo.save(entities);
        return this.listAll();
    }
}
