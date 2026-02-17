import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FriendRequestEntity } from './friend-request.entity';
import { FriendRequest, FriendRequestStatusEnum } from './friend-request.interface';
import { User } from '../users/user.entity';
import { from, map, Observable, of, switchMap } from 'rxjs';
import { UserService } from '../users/user.service';

@Injectable()
export class FriendRequestsService {
  constructor(
    @InjectRepository(FriendRequestEntity)
    private friendRequestRepository: Repository<FriendRequestEntity>,
    private userService: UserService
  ) {}


  // services for the friend request 
  hasRequestBeenSentOrReceived(
  creator: User,
  receiver: User,
  ): Observable<boolean> {
    return from(
      this.friendRequestRepository.findOne({
        where: [
                {creator: {id: receiver.id},
                receiver: {id: creator.id}}, 
                {creator: {id: creator.id}, receiver: {id: receiver.id}}
              ], 
      }),
    ).pipe(
      switchMap((friendRequest: FriendRequest) => {
        if (!friendRequest) return of(false);
        return of(true);
      }),
    );
  }
  
  sendFriendRequest(receiverId:string , creator:User): Observable<FriendRequest | {error : string}>
  {
    if (receiverId === creator.id){
        return of({error : 'It is not possible to send a friend request to yourself!' });
    }
    return this.userService.findUserById(receiverId).pipe(
      switchMap((receiver: User)=> {
        return this.hasRequestBeenSentOrReceived(creator, receiver).pipe(
      switchMap((hasRequestBeenSentOrReceived: Boolean) => {
        if (hasRequestBeenSentOrReceived) 
          return of({error : 'A friend Request has already been sent!'});
        let friendRequest: FriendRequest = {
          creator, 
          receiver, 
          status: FriendRequestStatusEnum.PENDING, 
        };
        return from(this.friendRequestRepository.save(friendRequest));

      }))

      })
    );
  }

  getFriendRequestSatuts(receiverId: string, currentUser: User): Observable<FriendRequestStatusEnum> {
  return this.userService.findUserById(receiverId).pipe(
    switchMap((receiver: User) => {
      return from(this.friendRequestRepository.findOne({
        where: [
          { creator: { id: receiver.id }, receiver: { id: currentUser.id } },
          { creator: { id: currentUser.id }, receiver: { id: receiver.id } }
        ],
        relations: ['creator', 'receiver'],
      }));
    }),
    switchMap((friendrequest: FriendRequest) => {
      // 1. If no request exists at all
      if (!friendrequest) {
        return of("nothing-sent" as FriendRequestStatusEnum);
      }

      // 2. PRIORITY: If it is already accepted, it doesn't matter who sent it
      if (friendrequest.status === 'accepted') {
        return of("accepted" as FriendRequestStatusEnum);
      }

      // 3. If it's NOT accepted yet, then we check who is waiting for whom
      if (friendrequest.receiver.id === currentUser.id) {
        return of("waiting-for-current-user-approval" as FriendRequestStatusEnum);
      }

      // 4. Otherwise, return the status (likely 'pending' for the creator)
      return of(friendrequest.status as FriendRequestStatusEnum);
    })
  );
}
async getFriendRequests(userId: string): Promise<User[]> {
    // Find all accepted connections where user is either creator or receiver
    const pendingConnections = await this.friendRequestRepository
      .createQueryBuilder('connection')
      .leftJoinAndSelect('connection.creator', 'creator')
      .leftJoinAndSelect('connection.receiver', 'receiver')
      .where("connection.status = 'pending'")
      .andWhere(
        '(connection.receiverId = :userId)',
        { userId },
      )
      .getMany();

    // Extract the friend (the other user in each connection)
    const requests = pendingConnections.map((connection) => {
      return connection.creator.id === userId
        ? connection.receiver
        : connection.creator;
    });

    return requests;
  }


/*
  getFriendRequests(
    currentUser: User,
  ): Observable<User[]> {
    return from(
      this.friendRequestRepository.find({
        where: [{ receiver: currentUser , status: FriendRequestStatusEnum.PENDING}],
        relations: ['receiver', 'creator'],
      }),
    ).pipe(
      switchMap((friendrequest: FriendRequest) => {
        return this.userService.findUserById(friendrequest.creator.id);
      })
    );
  }

*/
  getFriendRequestUserByreceiver(receiverId: string, creatorId: string): Observable<FriendRequest> {
    return from(
      this.friendRequestRepository.findOne({
        where: [{ creator: {id: creatorId}, receiver: {id: receiverId}}],
      }),
  );
  }




  respondToFriendRequest(
    statusResponse: FriendRequestStatusEnum,
    receiverId: string,
    creatorId: string,
  ): Observable<{status: FriendRequestStatusEnum}> {
    return this.getFriendRequestUserByreceiver(receiverId, creatorId).pipe(
      switchMap((friendRequest: FriendRequest) => {
        return from(
          this.friendRequestRepository.save({
            ...friendRequest,
            status: statusResponse,
          }),
        ).pipe(map(request => ({status: request.status})));
      }),
    );
  }


















  /*************************************** */

  /**
   * Get all accepted friend connections for a user
   * Returns array of User objects (friends)
   */
  async getFriends(userId: string): Promise<User[]> {
    // Find all accepted connections where user is either creator or receiver
    const acceptedConnections = await this.friendRequestRepository
      .createQueryBuilder('connection')
      .leftJoinAndSelect('connection.creator', 'creator')
      .leftJoinAndSelect('connection.receiver', 'receiver')
      .where("connection.status = 'accepted'")
      .andWhere(
        '(connection.creatorId = :userId OR connection.receiverId = :userId)',
        { userId },
      )
      .getMany();

    // Extract the friend (the other user in each connection)
    const friends = acceptedConnections.map((connection) => {
      return connection.creator.id === userId
        ? connection.receiver
        : connection.creator;
    });

    return friends;
  }

  
  /**
   * Get friend IDs only (useful for queries)
   */
  async getFriendIds(userId: string): Promise<string[]> {
    const friends = await this.getFriends(userId);
    return friends.map((friend) => friend.id);
  }
}
