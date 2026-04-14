import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { SkillsService } from './skills.service';

@Controller('skills')
@UseGuards(JwtGuard)
export class SkillsController {
    constructor(private readonly skillsService: SkillsService) { }

    @Get()
    async list() {
        return this.skillsService.listAll();
    }

    @Post()
    async create(@Body('name') name: string) {
        return this.skillsService.create(name);
    }

    @Post('seed')
    async seed() {
        return this.skillsService.seedDefaults();
    }
}
