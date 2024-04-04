import { isPlatformBrowser } from '@angular/common';
import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { GametableComponent } from "../gametable/gametable.component";
import { NewgameComponent } from '../newgame/newgame.component';

@Component({
  selector: 'app-gamelist',
  standalone: true,
  templateUrl: './gamelist.component.html',
  styleUrls: ['./gamelist.component.css'],
  imports: [NewgameComponent, GametableComponent],
  providers: [NewgameComponent]
})
export class GamelistComponent {
  errorMessage: string | undefined;
  userEmail: string | null = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object,
    private newgamecomponent: NewgameComponent
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.userEmail = sessionStorage.getItem('userEmail');
    }
    console.log("Initialized with userEmail:", this.userEmail);
  }
  
  logout() {
    this.authService.logout().subscribe({
      next: (response) => {
        this.router.navigate(['/login']);
      },
      error: (error) => {
        // Handle logout error
      }
    });
  }
}
