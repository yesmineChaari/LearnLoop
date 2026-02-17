import { Controller, UseGuards, Get, Req } from '@nestjs/common';
import { JwtGuard } from '../guards/jwt.guard';
import { UserService } from '../../users/user.service';
import { PostsService } from '../../posts/services/posts.service';

@Controller('profile')
export class ProfileController {
  constructor(
    private postsService: PostsService,
    private usersService: UserService,
  ) {}

  @UseGuards(JwtGuard)
  @Get()
  async getProfile(@Req() req) {
    // req.user is populated by JwtGuard
    const userId = req.user.id;
    return this.usersService.findById(userId);
  }

  @UseGuards(JwtGuard)
  @Get('me')
  getMyPosts(@Req() req) {
    return this.postsService.findByUser(req.user.id);
  }
}
