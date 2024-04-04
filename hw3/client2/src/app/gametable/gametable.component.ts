import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

interface GameLevel {
  id: string;
  level: string;
  phrase: string[];
  remaining: number;
  answer: string;
  status: string;
  wordBackground: string;
  textBackground: string;
  font: string;
  fontStyle: string;
}

@Component({
  selector: 'app-gametable',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './gametable.component.html',
  styleUrls: ['./gametable.component.css']
})
export class GametableComponent implements OnInit {
  games: any[] = [];
  wordBackground: string = '';
  textBackground: string = '';
  fontStyle: string = '';
  gameLevels: GameLevel[] = [];

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.getGames();
  }

  getGames(): void {
    this.authService.getGamesByUserId().subscribe({
      next: (data) => {
        this.gameLevels = data.map((game: any) => {
          const phrase = game.view && typeof game.view === 'string' ? game.view.split('') : [];
          return {
            id: game._id || game.id,
            level: game.level || '',
            phrase: phrase,
            font: game.font,
            remaining: game.remaining || 0,
            answer: game.target || '',
            status: game.status || 'unfinished',
            wordBackground: game.colors.wordBackground || '',
            textBackground: game.colors.textBackground || '',
            fontStyle: game.fontStyle || '',
          };
        });
      },
      error: (error) => {
        console.error('There was an error!', error);
      }
    });
  }

  openGame(gameId: string): void {
    if (!gameId) {
      console.error('Game ID is undefined');
      return;
    }
    this.router.navigate(['/game', gameId]);
  }
}
