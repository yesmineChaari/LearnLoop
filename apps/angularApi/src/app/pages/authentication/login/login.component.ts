import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { MaterialModule } from 'src/app/material.module';
import { FormsModule, NgForm } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login',
  imports: [
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    MaterialModule,
  ],
  templateUrl: './login.component.html',
  standalone: true,
})
export class LoginComponent {
  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}
  email: string = '';
  password: string = '';

  onSubmit(form: NgForm) {
    this.authService
      .login({ email: this.email, password: this.password })
      .subscribe({
        next: (res) => {
          localStorage.setItem('token', res.access_token);
          localStorage.setItem('user', JSON.stringify(res.user));
          localStorage.setItem('userId', res.user.id); // Explicitly save userId for chat component
          this.router.navigate(['/feed']);
        },
        error: (err) => {
          console.error('Login failed', err);
        },
      });
  }
}
