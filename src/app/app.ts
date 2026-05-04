import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { User } from './component/user';
import { MatListModule, MatActionList } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatCard } from '@angular/material/card';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    RouterLink,
    FormsModule,
    User,
    MatActionList,
    MatListModule,
    MatIconModule,
    MatCard
  ],
  template: `
    <div id="app">
      <div id="sidebar">
        <mat-card appearance="outlined">
          <h1>Music Collection</h1>
          <mat-divider />
          <user />
          <mat-divider />

          <mat-action-list>
            <a routerLink="/artist" mat-list-item>Artist</a>
            <a routerLink="/album-overview" mat-list-item>Album</a>
          </mat-action-list>
        </mat-card>
      </div>

      <mat-card id="content" appearance="outlined">
        <router-outlet />
      </mat-card>
    </div>

  `,
  styles: `
    #app {
      display: flex;
      flex-direction: row;
      padding: 16px;
    }

    #sidebar mat-card {
      width: 350px;
      margin-right: 16px;
      padding: 16px;
    }

    h1 {
      color: var(--mat-sys-primary);
      text-align: center;
    }

    #content {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 16px;
    }
  `
})
export class App {}
