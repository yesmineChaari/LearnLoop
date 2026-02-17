import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean {
    const token = localStorage.getItem('token');
    console.log('AuthGuard checking token:', token);

    if (!token) {
      this.router.navigate(['/authentication/login']);
      return false;
    }
    return true;
  }
}
