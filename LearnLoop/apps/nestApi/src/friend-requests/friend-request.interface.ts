import { User } from '../users/user.entity';



export enum FriendRequestStatusEnum {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  DECLINED = 'declined',
  WAITING_TO_BE_ACCEPTED= "waiting-for-current-user-approval", 
  NOTHING_SENT = "nothing-sent",
}

export interface FriendRequest {
  id?: string;
  creator?: User;
  receiver?: User;
  status?: FriendRequestStatusEnum;
}
