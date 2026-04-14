import { Controller, Get, UseGuards, Request, Post, Param, Put, Body } from '@nestjs/common';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { FriendRequestsService } from './friend-requests.service';
import { FriendDto } from './dto/friend.dto';
import { Observable } from 'rxjs';
import { FriendRequest, FriendRequestStatusEnum } from './friend-request.interface';
import { UserService } from '../users/user.service';
import { StatusChangeEvent } from '@angular/forms';
import { User } from '../users/user.entity';

@Controller('friend-requests')
export class FriendRequestsController {
  constructor(private readonly friendRequestsService: FriendRequestsService) { }

  @UseGuards(JwtGuard)
  @Post('send/:receiverId')
  sendFriendRequest(@Param('receiverId') receiverId, @Request() req,): Observable<FriendRequest | { error: string }> {
    return this.friendRequestsService.sendFriendRequest(receiverId, req.user);
  }

  @UseGuards(JwtGuard)
  @Get('status/:id')
  getFriendRequqestStatus(@Param('id') receiverId: string, @Request() req): Observable<FriendRequestStatusEnum> {
    return this.friendRequestsService.getFriendRequestSatuts(receiverId, req.user);
  }


  @UseGuards(JwtGuard)
  @Get('pending')
  getPendingRequests(@Request() req): Promise<User[]> {
    return this.friendRequestsService.getFriendRequests(req.user.id);
  }

  @UseGuards(JwtGuard)
  @Put('response/:UserId')
  respondToFriendRequest(
    @Param('UserId') userId: string,
    @Body('status') statusResponse: FriendRequestStatusEnum,
    @Request() req
  ): Observable<{ status: FriendRequestStatusEnum }> {
    return this.friendRequestsService.respondToFriendRequest(
      statusResponse,
      req.user.id,
      userId,

    );
  }

  @UseGuards(JwtGuard)
  @Get('friends')
  getFriends(@Request() req): Promise<User[]> {
    return this.friendRequestsService.getFriends(req.user.id);
  }
}
