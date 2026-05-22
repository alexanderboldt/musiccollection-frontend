import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from './component/sidebar';
import { MatCard } from '@angular/material/card';
import { ThemeService } from './util/theme.service';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    MatCard,
    Sidebar
  ],
  template: `
    <div id="app">
      <sidebar />
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

    #content {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 16px;
    }
  `
})
export class App implements OnInit {
  private readonly themeService = inject(ThemeService);

  ngOnInit(): void {
    this.themeService.initTheme();
  }
}
