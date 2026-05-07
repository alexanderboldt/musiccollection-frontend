import { Component} from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { User } from './user';
import { MatActionList, MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatCard } from '@angular/material/card';

@Component({
  selector: 'sidebar',
  imports: [
    RouterLink,
    FormsModule,
    User,
    MatActionList,
    MatListModule,
    MatIconModule,
    MatCard
  ],
  template: `
    <div id="sidebar">
      <mat-card appearance="filled">
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
  `,
  styles: `
    #sidebar mat-card {
      width: 350px;
      margin-right: 16px;
      padding: 16px;
    }

    h1 {
      color: var(--mat-sys-primary);
      text-align: center;
    }
  `
})
export class Sidebar {}
