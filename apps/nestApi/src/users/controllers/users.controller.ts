import {
  Controller,
  Get,
  Put,
  Body,
  Req,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { UserService } from '../user.service';
import { Request } from 'express';
import { User } from '../user.entity';
import { JwtGuard } from '../../auth/guards/jwt.guard';
import { Param } from '@nestjs/common';
import { Observable } from 'rxjs';
import { UpdateUserDto } from '../updateUser.dto';

import { Query } from '@nestjs/common';
import { SearchUsersDto, SearchSortBy } from '../searchUsers.dto';

@Controller('users')
export class UsersController {
  constructor(private userService: UserService) {}

  @UseGuards(JwtGuard)
  @Get('me')
  getProfile(@Req() req: Request) {
    console.log('REQ.USER ===>', req.user);

    return this.userService.findById(req.user['id']);
  }

  @UseGuards(JwtGuard)
  @Put('me')
  async updateProfile(@Req() req: Request, @Body() data: UpdateUserDto) {
    try {
      return await this.userService.update(req.user['id'], data);
    } catch (err) {
      console.error('Update profile error:', err);
      throw err;
    }
  }
  @UseGuards(JwtGuard)
  @Get('friends/my')
  getFriends(@Req() req): Observable<User[]> {
    return this.userService.getFriends(req.user);
  }

  @UseGuards(JwtGuard)
  @Get(':userId')
  findUserById(
    @Param('userId', new ParseUUIDPipe({ version: '4' })) userId: string,
  ): Observable<User> {
    return this.userService.findUserById(userId);
  }

  @UseGuards(JwtGuard)
  @Get('')
  async searchUsers(@Query() query: SearchUsersDto, @Req() req: Request) {
    const dto: SearchUsersDto = {
      ...query,
      name: query.name?.trim() || undefined,
      skillsToLearn: query.skillsToLearn
        ? Array.isArray(query.skillsToLearn)
          ? query.skillsToLearn
          : String(query.skillsToLearn).split(',').filter(s => s.trim())
        : undefined,
      skillsToTeach: query.skillsToTeach
        ? Array.isArray(query.skillsToTeach)
          ? query.skillsToTeach
          : String(query.skillsToTeach).split(',').filter(s => s.trim())
        : undefined,
      page: query.page ? Number(query.page) : 1,
      limit: query.limit ? Number(query.limit) : 10,
      sortBy: query.sortBy || SearchSortBy.NAME,
      excludeUserId: req.user['id'], // Exclude current user from search
    };
    return this.userService.searchUsers(dto);
  }
}
