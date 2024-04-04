import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { GameComponent } from '../game/game.component';

@Component({
  selector: 'app-newgame',
  standalone: true,
  templateUrl: './newgame.component.html',
  styleUrls: ['./newgame.component.css'],
  imports: [FormsModule, CommonModule, GameComponent]
})
export class NewgameComponent implements OnInit {
  fonts: string[] = [];
  levels: any[] = [];
  colors = {
    wordBackground: '',
    guessBackground: '',
    textBackground: ''
  };
  selectedLevel: any;
  selectedFont: any;
  userId: string | null = '';

  constructor(private authService: AuthService, private router: Router, @Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit(): void {
    this.loadFonts();
    if (isPlatformBrowser(this.platformId)) {
      this.metaData();
      this.userId = sessionStorage.getItem('userId');
      this.selectedFont = sessionStorage.getItem('font');
    }
  }

  loadFonts(): void {
    this.authService.getFonts().subscribe((fetchedFonts: string[]) => {
      this.fonts = fetchedFonts;
    });
  }
  
  metaData(): void {
    this.authService.getMetaData().subscribe({
      next: (data: any) => {
        const settings = data.default ? data.default : data;
        this.selectedFont = settings.font;
        this.levels = data.levels;
        this.selectedLevel = this.levels.find(level => level.name === settings.level?.name);

        if (settings.colors) {
          this.colors.wordBackground = settings.colors.wordBackground;
          this.colors.textBackground = settings.colors.textBackground;
          this.colors.guessBackground = settings.colors.guessBackground;
        }
      },
      error: (error) => {
        console.error('Error fetching metadata:', error);
      }
    });
  }
  
  setTheme(): void {
    const metaDefault = {
      font: this.selectedFont,
      level: this.selectedLevel,
      colors: this.colors
    };
    const userId = sessionStorage.getItem('userId'); 

    if (userId === null) {
      console.error('User ID is null');
      return;
    }
    this.authService.saveMetaDefault(metaDefault).subscribe(
      (response) => {
        console.log('MetaDefault saved successfully:', response);
      },
      (error) => {
        console.error('Error saving MetaDefault:', error);
      }
    );
  }

  newGame() {
    if (!this.selectedLevel || !this.selectedFont) {
      console.error('Level or Font not selected');
      return; 
    }

    const userId = sessionStorage.getItem('userId'); 

    if (userId === null) {
      console.error('User ID is null');
      return;
    }
    this.authService.createGame(this.selectedLevel?.name, this.selectedFont, this.colors).subscribe({
      next: (response) => {
        if ('_id' in response) { 
          console.log('Game created:', response);
          this.router.navigate(['/game', response._id]);
        } else {
          console.error('Error:', response);
        }
      },
      error: (error) => {
        console.error('Error creating game:', error);
      }
    });
  }
}
