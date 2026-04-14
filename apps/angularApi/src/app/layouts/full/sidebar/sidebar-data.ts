import { NavItem } from './nav-item/nav-item';

export const navItems: NavItem[] = [
  { navCap: 'Main Menu' },
  {
    displayName: 'Feed',
    iconName: 'rss',
    route: '/feed',
    bgcolor: 'success',
  },
  {
    displayName: 'Search Users',
    iconName: 'search',
    route: '/search',
    bgcolor: 'accent',
  },

  {
    displayName: 'Create Session',
    iconName: 'calendar-plus',
    route: '/create-session',
    bgcolor: 'primary',
  },

  {
  displayName: 'My Sessions',
  iconName: 'calendar-time',
  route: '/sessions',
  bgcolor: 'secondary',
  },

  {
    displayName: 'My Connections',
    iconName: 'friends',
    route: '/my-friends',
    bgcolor: 'secondary',
  },

  {
    displayName: 'My Friend Requests',
    iconName: 'users',
    route: '/friend-request',
    bgcolor: 'secondary',
  },

  {
    displayName: 'Logout',
    iconName: 'logout',
    bgcolor: 'secondary',
    route: '/authentication/login',
    
  },
  
];
