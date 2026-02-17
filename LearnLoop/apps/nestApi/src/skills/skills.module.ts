import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Skill } from './skills.entity';
import { SkillsService } from './skills.service';
import { SkillsController } from './skills.controller';

@Module({
    imports: [TypeOrmModule.forFeature([Skill])],
    providers: [SkillsService],
    controllers: [SkillsController],
    exports: [SkillsService],
})
export class SkillsModule { }
