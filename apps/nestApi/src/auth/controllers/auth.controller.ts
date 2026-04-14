import { Controller, Post } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { User } from '../../users/user.entity';
import { UnauthorizedException } from '@nestjs/common';
import { LoginResponseDto } from '../../users/loginResponse.dto';
import { Body } from '@nestjs/common';
import { UseGuards } from '@nestjs/common';
import { JwtGuard } from '../guards/jwt.guard';
import { Get } from '@nestjs/common';
import { Req } from '@nestjs/common';
import { Put } from '@nestjs/common';
import { UpdateUserDto } from '../../users/updateUser.dto';
import { UserService } from '../../users/user.service';
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('register')
    async register(@Body() user: User): Promise<User> {
        return this.authService.register(user);
    }

@Post('login')
async login(@Body() user: User): Promise<LoginResponseDto> {
    const result = await this.authService.login(user.email, user.password);
    if (!result) {
        throw new UnauthorizedException('Invalid credentials');
    }
    return result; 
}
}