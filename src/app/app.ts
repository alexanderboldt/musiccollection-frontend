import { Component, signal, inject } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { RouterOutlet } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import Keycloak from 'keycloak-js';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MatIcon],
  template: `
    <div style="display: flex; flex-direction: column; align-items: center; margin: 50px">
      <mat-icon style="transform: scale(2);">account_circle</mat-icon>
      <p style="font-size: 16px">{{ username() }}</p>
      <button (click)="logout()" style="margin-bottom: 32px;">LOGOUT</button>

      <h1>Music Collection</h1>

      <div style="display: grid; grid-template-columns: 200px 200px 200px;">
        @for (artist of artists(); track artist.id) {
          <div style="display: flex; flex-direction: column; align-items: center; padding: 16px">
            <mat-icon style="transform: scale(2); margin-top: 16px;">account_circle</mat-icon>
            <h2>{{ artist.name }}</h2>
          </div>
        }
      </div>
    </div>
  `,
  styleUrl: './app.css'
})
export class App {
  protected username = signal("");
  protected artists = signal<Artist[]>([]);

  private readonly keycloak = inject(Keycloak);
  private readonly http = inject(HttpClient);

  ngOnInit() {
    this.keycloak.loadUserProfile().then(profile => {
      this.username.set(`${profile.firstName} ${profile.lastName}`);
    });

    this.http.get<Array<Artist>>(
      'http://localhost:4000/api/v1/artists',
      { headers: { 'Access-Control-Allow-Origin': '*', 'Content-type': 'application/json', 'Authorization': `Bearer ${this.keycloak.token}` }
      }).subscribe(data => { this.artists.set(data) });
  }

  logout() {
    this.keycloak.logout({ redirectUri: window.location.origin });
  }
}

class Artist {
  id: number = 0
  name: string = ''
}
