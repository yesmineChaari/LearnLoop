import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { User } from '../../users/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { LoginResponseDto } from '../../users/loginResponse.dto';
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) { }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  async register(user: User): Promise<User> {
    const { name, email, password } = user;
    const hashedPassword = await this.hashPassword(password);
    const newUser = this.userRepository.create({
      name,
      email,
      password: hashedPassword,
    });
    const savedUser = await this.userRepository.save(newUser);
    delete savedUser.password;
    return savedUser;
  }

  async login(
    email: string,
    password: string,
  ): Promise<LoginResponseDto | null> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (user && (await bcrypt.compare(password, user.password))) {
      const payload = { sub: user.id, name: user.name, email: user.email };
      return {
        access_token: this.jwtService.sign(payload),
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      };
    }
    return null;
  }
}