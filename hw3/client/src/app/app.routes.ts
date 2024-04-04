import { Routes } from '@angular/router';
import { GameComponent } from './game/game.component';
import { GamelistComponent } from './gamelist/gamelist.component';
import { LoginComponent } from './login/login.component';
import { NewgameComponent } from './newgame/newgame.component';

export const routes: Routes = [
    {path:'',redirectTo:'/login',pathMatch:'full'},
    {path : 'login', component : LoginComponent },
    {path:'gamelist',component:GamelistComponent},
    {path:'newgame',component:NewgameComponent},
    {path:'gamelist',component:GamelistComponent},
    {path:'game',component:GameComponent},
    { path: 'game/:id', component: GameComponent },

  ];