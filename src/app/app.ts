import { Component, signal, inject } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { AsyncPipe } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import Keycloak from 'keycloak-js';
import { Observable } from 'rxjs';
import { Api } from './api';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MatIcon, AsyncPipe],
  template: `
    <div style="display: flex; flex-direction: column; align-items: center; margin: 50px">
      <mat-icon style="transform: scale(2);">account_circle</mat-icon>
      <p style="font-size: 16px">{{ username() }}</p>
      <button (click)="logout()" style="margin-bottom: 32px;">LOGOUT</button>

      <h1>Music Collection</h1>
      <div id="artistContent">
        @for (artist of artists(); track artist.id) {
          <div class="artistTile">
            @if (artist.filename == null) {
              <mat-icon style="transform: scale(2); margin-top: 16px;">account_circle</mat-icon>
            } @else {
              <img [src]="downloadArtistImage(artist.id) | async" style="height: 100%; width: 100%; object-fit: cover; border-radius: 8px;">
            }
            <h2>{{ artist.name }}</h2>
            <button (click)="deleteArtist(artist.id)">
              <mat-icon>delete_outline</mat-icon>
            </button>
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

  imageUrlMap = new Map<number, Observable<string>>();

  private readonly keycloak = inject(Keycloak);
  private readonly http = inject(HttpClient);

  private api = new Api(this.http, this.keycloak);

  ngOnInit() {
    this.api.loadUsername(username => this.username.set(username));
    this.readAllArtist()
  }

  readAllArtist() {
    this.api.readAllArtist().subscribe(data => this.artists.set(data))
  }

  deleteArtist(id: number) {
    this.api.deleteArtist(id).subscribe(() => this.readAllArtist());
  }

  downloadArtistImage(id: number): Observable<string> {
    if (!this.imageUrlMap.has(id)) {
      this.imageUrlMap.set(id, this.api.downloadArtistImage(id));
    }
    return this.imageUrlMap.get(id)!;
  }

  logout() {
    this.api.logout();
  }
}
