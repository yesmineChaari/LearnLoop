import { Routes } from '@angular/router';
import { BlankComponent } from './layouts/blank/blank.component';
import { FullComponent } from './layouts/full/full.component';
import { Feed } from './pages/feed/feed';
import { ProfileComponent } from './pages/profile/profile.component';
import { AuthGuard } from './guards/auth.guard';
import { OtherUsers } from './pages/other-users/other-users';
import { Chat } from './components/chat/chat';
import { FriendRequests } from './pages/friend-requests/friend-requests';
import { CreateSession } from './components/create-session/create-session';
import { SessionsList } from './components/sessions-list/sessions-list';
import { Myfriends } from './pages/myfriends/myfriends';
import { SearchComponent } from './pages/search/search.component';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'authentication/login',
  },
  {
    path: '',
    component: FullComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'feed',
      },
      {
        path: 'profile',
        component: ProfileComponent,
      },
      {
        path: 'create-session',
        component: CreateSession,
      },
      {
        path: 'sessions',
        component: SessionsList,
      },
      {
        path: 'search',
        component: SearchComponent,
      },
      {
        path: 'feed',
        component: Feed,
      },
      {
        path: 'users/:id',
        component: OtherUsers,
      },
      {
        path: 'chat/connections',
        component: Chat,
      },
      {
        path: 'friend-request',
        component: FriendRequests,
      },
      {
        path: 'my-friends',
        component: Myfriends,
      },
    ],
  },
  {
    path: '',
    component: BlankComponent,
    children: [
      {
        path: 'authentication',
        loadChildren: () =>
          import('./pages/authentication/authentication.routes').then(
            (m) => m.AuthenticationRoutes,
          ),
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'authentication/login',
  },
];
