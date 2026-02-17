import { Component } from '@angular/core';
import { CoreService } from 'src/app/services/core.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule , NgForm} from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MaterialModule } from 'src/app/material.module';
import { CommonModule } from '@angular/common';
import { AuthService } from 'src/app/services/auth.service';
@Component({
  selector: 'app-register',
  imports: [RouterModule, MaterialModule, FormsModule, ReactiveFormsModule , CommonModule],
  templateUrl: './register.component.html',
  standalone: true, 
})
export class RegisterComponent {

  name: string = '';
  password: string = '';
  email: string = '';
  constructor(private authService: AuthService, private settings: CoreService, private router: Router) {}

  onSubmit(form: NgForm) {
    if (form.valid) {
      this.authService.register({ name: this.name, email: this.email, password: this.password }).subscribe({
        next: (res) => {
          console.log('Registration successful', res);
          this.router.navigate(['/']);
        },
        error: (err) => {
          console.error('Registration failed', err);
        },
      });
    }
  }
  options = this.settings.getOptions();

}
