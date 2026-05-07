import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { User } from './user';
import { MatActionList, MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatCard } from '@angular/material/card';

@Component({
  selector: 'sidebar',
  imports: [
    RouterLink,
    RouterLinkActive,
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
          <a routerLink="/artist" routerLinkActive="active-route" mat-list-item><span routerLinkActive="active-text">Artist</span></a>
          <a routerLink="/album-overview" routerLinkActive="active-route" mat-list-item><span routerLinkActive="active-text">Album</span></a>
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

    a {
      border-radius: 8px;
      margin-top: 8px;
    }

    .active-route {
      color: white;
      background-color: var(--mat-sys-secondary);
      transition: 0.3s;
    }

    .active-text {
      color: var(--mat-sys-on-primary);
      transition: 0.3s;
    }
  `
})
export class Sidebar {}
