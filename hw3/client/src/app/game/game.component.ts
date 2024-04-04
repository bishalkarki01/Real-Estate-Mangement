import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService, GameResponse } from '../auth.service';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit {
  remainingGuesses: number = 0;
  currentGuess: string = '';
  currentWordArray: string[] = [];
  incorrectGuessesArray: string[] = [];
  colors: { wordBackground: string, textBackground: string, guessBackground: string } = {
    wordBackground: '',
    textBackground: '',
    guessBackground: ''
  };
  target: string = '';
  gameId: string = '';
  status: string = '';
  view: string = '';
  letters: string[] = [];
  fontStyle: string = '';
  userGuess: string = '';
  gameStatus: string = '';
  gameDetails: any = {};
  canGuess: boolean = true;
  victoryGif = '../../assets/images/winner.gif';
  lossGif = '../../assets/images/cry.gif';
  currentGif: string = '';

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit() {
    const gameId = this.route.snapshot.paramMap.get('gameId');
    if (gameId) {
      this.authService.getGameDetails(gameId).subscribe({
        next: (details) => {
          this.gameDetails = details;
        },
        error: (error) => console.error('Failed to fetch game details:', error)
      });
      this.initializeGameData();
    }
    this.route.params.subscribe(params => {
      this.gameId = params['id'];
      this.initializeGameData();
    });
  }

  initializeGameData() {
    if (this.gameId) {
      this.authService.getGameDetails(this.gameId).subscribe(game => {
        console.log('Game Data:', game);
        this.remainingGuesses = game.remainingGuesses;
        this.currentWordArray = game.view && game.view.length > 0 ? game.view.split('') : Array.from({ length: game.target.length }, () => '_');
        this.incorrectGuessesArray = game.guesses ? game.guesses.split('').filter((g: string) => !game.view.includes(g)) : [];
        this.colors = game.colors;
        this.target = game.target;
        this.remainingGuesses = game.remaining;
        this.userGuess = game.guess;
        this.fontStyle = game.font;
        this.status = game.status;
        if (this.status === 'victory') {
          this.gameStatus = 'Congratulations! You have guessed the word!';
          this.canGuess = false;
          this.currentGif = this.victoryGif;
        } else if (this.status === 'loss') {
          this.gameStatus = 'Unfortunately, you have run out of guesses.';
          this.canGuess = false;
          this.currentGif = this.lossGif;
        }
        console.log('status check', this.status);
      }, error => {
        console.error('Error fetching game details:', error);
      });
    }
  }

  getBoxLetter(index: number): string {
    if (index < this.currentWordArray.length) {
      return this.currentWordArray[index] || '_';
    }
    return '';
  }

  makeGuess(): void {
    if (this.status === 'victory' || this.status === 'loss') {
      alert('The game is over. Please start a new game.');
      return;
    }
    if (this.remainingGuesses <= 0) {
      alert('No remaining guesses. You cannot make a guess.');
      return;
    }
    if (!this.userGuess.match(/^[a-zA-Z]$/)) {
      alert('Please enter a single alphabetic letter.');
      return;
    }
    this.incorrectGuessesArray.push(this.userGuess);
    this.http.post<GameResponse>(`/api/v2/games/${this.gameId}/guesses?guess=${this.userGuess}`, {}, { withCredentials: true, observe: 'response' }).subscribe({
      next: (response) => {
        const responseData = response.body;
        if (!responseData) return;
        this.remainingGuesses = responseData.remaining;
        for (let i = 0; i < this.target.length; i++) {
          if (responseData.view[i] !== '_') {
            this.currentWordArray[i] = responseData.view[i];
          }
        }
        if (responseData.status === 'victory') {
          this.gameStatus = 'Congratulations! You have guessed the word!';
          this.canGuess = false;
          this.currentGif = this.victoryGif;
        } else if (responseData.status === 'loss') {
          this.gameStatus = 'Unfortunately, you have run out of guesses.';
          this.canGuess = false;
          this.currentGif = this.lossGif;
        }
        this.userGuess = '';
      },
      error: (error) => {
        console.error('Error making a guess:', error);
        this.userGuess = '';
      }
    });
  }

  updateGameStatus(responseData: GameResponse): void {
    if (responseData.status === 'victory') {
      this.gameStatus = 'Congratulations! You have guessed the word!';
    } else if (responseData.status === 'loss') {
      this.gameStatus = 'Unfortunately, you have run out of guesses.';
    }
  }

  exitGame() {
    this.router.navigate(['/gamelist']);
  }
}
