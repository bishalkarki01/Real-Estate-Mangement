import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';

export interface FontApiResponse {
  _id: string;
  fonts: string[];
}

export interface GameResponse {
  view: string[];
  remaining: number;
  status: 'victory' | 'loss' | 'unfinished';
  correct?: boolean;
  guesses: string;
  font?: string; 
}

export interface ColorDataItem {
  _id?: string;
  wordBackground?: string;
  textBackground?: string;
  guessBackground?: string;
}

export interface MetaDefault {
  font: string;
  level: string;
  colors: {
    wordBackground: string;
    guessBackground: string;
    textBackground: string;
  };
}

interface DefaultSettings {
  level: any; 
  font: string;
}

export interface MetaDataResponse {
  colors: ColorDataItem[];
  levels: string[];
  defaults: DefaultSettings;
}

export interface Game {
  colors: ColorDataItem;
  font: string;
  guesses: string;
  id: string;
  level: string;
  remaining: number;
  status: 'unfinished' | 'loss' | 'victory';
  target?: string;
  timestamp: number;
  timeToComplete?: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<any> {
    const url = '/api/v2/login';
    const body = { email, password };
    return this.http.post(url, body);
  }

  logout() {
    return this.http.post('/api/v2/logout', {});
  }

  getFonts(): Observable<string[]> {
    return this.http.get<FontApiResponse[]>('/api/v2/meta/fonts').pipe(
      map((response) => response.length > 0 ? response[0].fonts : [])
    );
  }

  getMetaData(): Observable<MetaDataResponse> {
    return this.http.get<MetaDataResponse>('/api/v2/meta');
  }
 
  saveMetaDefault(metaDefault: MetaDefault): Observable<any> {
    return this.http.put(`/api/v2/defaults`, metaDefault);
  } 

  createGame(level: string, font: string, colors: ColorDataItem): Observable<Game | Error> {
    const headers = new HttpHeaders().set('X-font', font);
    const body = {
      colors: {
        wordBackground: colors.wordBackground,
        guessBackground: colors.guessBackground,
        textBackground: colors.textBackground
      }
    };
    return this.http.post<Game>('/api/v2/games', body, { 
      headers,
      params: { level }, withCredentials: true 
    });
  }

  getGameDetails(gameId: string): Observable<any> {
    return this.http.get<any>(`/api/v2/game/${gameId}`); 
  }
  
  getGamesByUserId(): Observable<any> {
    return this.http.get(`/api/v2/games`, { withCredentials: true });
  }
}
