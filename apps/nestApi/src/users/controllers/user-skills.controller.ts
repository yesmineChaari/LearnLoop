import { Body, Controller, Get, Post, Put, Req, UseGuards } from '@nestjs/common';
import { JwtGuard } from '../../auth/guards/jwt.guard';
import { UserSkillsService } from '../user-skills.service';
import { SkillsService } from '../../skills/skills.service';
import { BadRequestException } from '@nestjs/common';
import { isUUID } from 'class-validator';
import { use } from 'passport';
@Controller('users/skills')
@UseGuards(JwtGuard)
export class UserSkillsController {
  constructor(
    private readonly userSkillsService: UserSkillsService,
    private readonly skillsService: SkillsService,
  ) {}

  @Get()
  async getUserSkills(@Req() req) {
    return this.userSkillsService.getUserSkills(req.user['sub']);
  }
@UseGuards(JwtGuard)
  @Put()
  async updateUserSkills(
    @Req() req,
    @Body() body: { toLearn: string[]; toTeach: string[] },
  ) {
     console.log('req.user', req.user);
      const userId = req.user?.id;
  if (!userId || !isUUID(userId)) {
    throw new BadRequestException('Invalid user ID');
  }
    return this.userSkillsService.updateUserSkills(
      req.user['id'],
      body.toLearn,
      body.toTeach,
    );
  }

  // Optional: allow adding a new skill
  @Post('add')
  async addSkill(@Body('name') name: string) {
    return this.skillsService.create(name);
  }
}
