import { Component, inject, signal} from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { User } from './user';
import { MatActionList, MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatCard } from '@angular/material/card';
import { NAVIGATION } from '../navigation/navigation';
import { MatButton } from '@angular/material/button';
import { ThemeService } from '../util/theme.service';

@Component({
  selector: 'sidebar',
  imports: [
    RouterLink,
    RouterLinkActive,
    FormsModule,
    User,
    MatActionList,
    MatButton,
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

        <button matButton id="buttonTheme" (click)="toggleTheme()">
          @if (isLightMode()) {
            Enable Dark Mode
          } @else {
            Enable Light Mode
          }

          <mat-icon>
            @if (isLightMode()) {
              dark_mode
            } @else {
              light_mode
            }
          </mat-icon>
        </button>

        <mat-divider />

        <mat-action-list>
          <a routerLink="{{ NAVIGATION.ARTIST.ROUTES.BASE }}" routerLinkActive="active-route" mat-list-item><span routerLinkActive="active-text">{{ NAVIGATION.ARTIST.TITLE }}</span></a>
          <a routerLink="{{ NAVIGATION.ALBUM.ROUTES.BASE }}" routerLinkActive="active-route" mat-list-item><span routerLinkActive="active-text">{{ NAVIGATION.ALBUM.TITLE }}</span></a>
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

    #buttonTheme {
      border-radius: 0;
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
export class Sidebar {
  protected readonly NAVIGATION = NAVIGATION;

  private readonly themeService = inject(ThemeService);

  protected isLightMode = signal(this.themeService.isLight());

  toggleTheme() {
    this.themeService.toggle();
    this.isLightMode.set(this.themeService.isLight());
  }
}
