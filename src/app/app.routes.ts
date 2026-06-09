import { Routes } from '@angular/router';
import { Home } from './components/home/home'
import { Instruction } from './components/instruction/instruction';
import { LayoutComponent } from './components/layout-component/layout-component';
import { Game } from './components/game/game';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', component: Home }, // Default child
      { path: 'how-to-play', component: Instruction },
      { path: 'humanvsbot', component: Game },
      { path: '**', redirectTo: '' }
    ]
  }
];
