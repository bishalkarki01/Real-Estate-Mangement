import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { GamelistComponent } from '../gamelist/gamelist.component';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [CommonModule, FormsModule, GamelistComponent, HttpClientModule],
  providers: [AuthService, HttpClient],
})
export class LoginComponent {
  user = { email: '', password: '' };
  errorMessage: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  submitLoginForm() {
    this.authService.login(this.user.email, this.user.password).subscribe({
      next: (response: { 
        userId: string, 
        userEmail: string, 
        metaDefault: {
          font: string,
          level: string,
          colors: {
            wordBackground: string,
            guessBackground: string,
            textBackground: string,
          }
        }
      }) => {
        console.log('Login successful', response);
        const { email: userEmail, _id: userId } = response as any; // Fixed destructuring assignment
        sessionStorage.setItem('userId', userId);
        sessionStorage.setItem('userEmail', userEmail);
        this.router.navigate(['/gamelist']);
      },
      error: (error) => {
        this.errorMessage = 'Invalid Email and Password';
        console.error('Login error', error);
      }
    });
  }
}
