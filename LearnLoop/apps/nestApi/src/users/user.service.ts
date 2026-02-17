import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { User } from './user.entity';
import { UpdateUserDto } from './updateUser.dto';

import { SearchUsersDto, SearchSortBy } from './searchUsers.dto';

import { HttpException, HttpStatus } from '@nestjs/common';
import { FriendRequestEntity } from '../friend-requests/friend-request.entity';
import { map, switchMap } from 'rxjs/operators';
import { from, Observable, of } from 'rxjs';
import { FriendRequest, FriendRequestStatusEnum } from '../friend-requests/friend-request.interface';

@Injectable()
export class UserService {

    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(FriendRequestEntity)
        private readonly friendRequestRepository: Repository<FriendRequestEntity>,
    ){}

    findUserById(id: string): Observable<User>{
        return from (
            this.userRepository.findOne({where :{id}}), 
        ).pipe(
            map((user: User)=> {
                if (!user){
                    throw new HttpException('User not found', HttpStatus.NOT_FOUND)
                }
                delete user.password;
                return user;

            }),
        )
    }



  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }
    delete user.password;
    return user;
  }

  async searchUsers(dto: SearchUsersDto): Promise<{ 
    users: User[]; 
    total: number; 
    page: number; 
    limit: number; 
    totalPages: number;
  }> {
    const { 
      name, 
      skillsToLearn, 
      skillsToTeach, 
      page = 1, 
      limit = 10, 
      sortBy = SearchSortBy.NAME,
      excludeUserId 
    } = dto;

    const query = this.userRepository.createQueryBuilder('user')
      .leftJoinAndSelect('user.skillsToLearn', 'learnSkills')
      .leftJoinAndSelect('user.skillsToTeach', 'teachSkills');

    // Exclude current user from search results
    if (excludeUserId) {
      query.andWhere('user.id != :excludeUserId', { excludeUserId });
    }

    // Search by name (case-insensitive, partial match)
    if (name && name.trim()) {
      query.andWhere('LOWER(user.name) LIKE LOWER(:name)', { name: `%${name.trim()}%` });
    }

    // Filter by skills to learn (user is looking to learn these skills)
    if (skillsToLearn && skillsToLearn.length > 0) {
      query.andWhere('learnSkills.id IN (:...skillsToLearn)', { skillsToLearn });
    }

    // Filter by skills to teach (user can teach these skills)
    if (skillsToTeach && skillsToTeach.length > 0) {
      query.andWhere('teachSkills.id IN (:...skillsToTeach)', { skillsToTeach });
    }

    // Apply sorting
    switch (sortBy) {
      case SearchSortBy.RECENT:
        query.orderBy('user.createdAt', 'DESC');
        break;
      case SearchSortBy.NAME:
      default:
        query.orderBy('user.name', 'ASC');
        break;
    }

    // Get total count before pagination
    const total = await query.getCount();
    const totalPages = Math.ceil(total / limit);

    // Apply pagination
    query.skip((page - 1) * limit).take(limit);

    const users = await query.getMany();
    
    // Remove password from results and map skills properly
    const sanitizedUsers = users.map(u => {
      if (u.password) delete u.password;
      return u;
    });

    return { 
      users: sanitizedUsers, 
      total, 
      page, 
      limit, 
      totalPages 
    };
  }


  async update(id: string, dto: UpdateUserDto): Promise<User> {
    // Only update scalar fields (not skillsToLearn/skillsToTeach)
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    if (dto.name !== undefined) user.name = dto.name;
    if (dto.bio !== undefined) user.bio = dto.bio;
    if (dto.profileImage !== undefined) user.profileImage = dto.profileImage;
    // Do NOT update skillsToLearn/skillsToTeach here
    await this.userRepository.save(user);
    delete user.password;
    return user;
  }

  getFriends(currentUser: User): Observable<User[]> {
    return from(
      this.friendRequestRepository.find({
        where: [
          { creator: currentUser, status: FriendRequestStatusEnum.ACCEPTED },
          { receiver: currentUser, status: FriendRequestStatusEnum.ACCEPTED },
        ],
        relations: ['creator', 'receiver'],
      }),
    ).pipe(
      switchMap((friends: FriendRequest[]) => {
        if (friends.length === 0) {
          return of([]);
        }

        const userIds: string[] = friends.map((friend: FriendRequest) =>
          friend.creator.id === currentUser.id ? friend.receiver.id : friend.creator.id
        );

        return from(
          this.userRepository.find({
            where: { id: In(userIds) },
          })
        );
      }),
    );
  }
}




