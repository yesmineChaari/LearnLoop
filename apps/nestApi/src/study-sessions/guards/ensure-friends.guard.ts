import { CanActivate, ExecutionContext, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { FriendRequestsService } from '../../friend-requests/friend-requests.service';
import { StudySessionsService } from '../study-sessions.service';
import { from, of } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';

@Injectable()
export class EnsureFriendsGuard implements CanActivate {
    constructor(
        private readonly friendRequestsService: FriendRequestsService,
        private readonly studySessionsService: StudySessionsService,
    ) { }

    canActivate(context: ExecutionContext) {
        const req = context.switchToHttp().getRequest();
        const userId: string | undefined = req.user?.id;
        if (!userId) throw new ForbiddenException('Unauthorized');

        const participantId: string | undefined = req.body?.participantId;
        if (participantId) {
            return from(this.friendRequestsService.getFriendIds(userId)).pipe(
                map((friendIds) => {
                    if (!friendIds.includes(participantId)) {
                        throw new ForbiddenException('No connection between users');
                    }
                    return true;
                }),
            );
        }

        const sessionId: string | undefined = req.params?.id;
        if (sessionId) {
            return from(this.studySessionsService.getById(sessionId)).pipe(
                switchMap((session) => {
                    if (!session) throw new NotFoundException('Session not found');
                    return from(this.friendRequestsService.getFriendIds(userId)).pipe(
                        map((friendIds) => {
                            const otherUserId = session.creator?.id === userId ? session.participant?.id : session.creator?.id;
                            if (!otherUserId || !friendIds.includes(otherUserId)) {
                                throw new ForbiddenException('No connection between users');
                            }
                            return true;
                        }),
                    );
                }),
            );
        }

        return of(true);
    }
}
