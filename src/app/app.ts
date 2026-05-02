import { Component, signal, inject } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { AsyncPipe } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import Keycloak from 'keycloak-js';
import { Observable } from 'rxjs';
import { Api } from './api';
import { MatCard, MatCardActions, MatCardContent, MatCardHeader, MatCardTitle } from '@angular/material/card';
import { MatButton} from '@angular/material/button';
import { MatFormField, MatLabel, MatInput } from '@angular/material/input';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MatIcon, AsyncPipe, MatCard, MatCardHeader, MatCardContent, MatCardActions, MatButton, MatCardTitle, MatFormField, MatLabel, MatInput, FormsModule],
  template: `
    <div id="content">
      <mat-card id="cardUser" appearance="outlined">
        <mat-icon>account_circle</mat-icon>
        <p>{{ username() }}</p>
        <button (click)="logout()" matButton>LOGOUT</button>
      </mat-card>

      <h1>Music Collection</h1>

      <mat-card id="cardCreateArtist" appearance="outlined">
        <h2>Create an artist</h2>
        <form>
          <mat-form-field>
            <mat-label>Artist</mat-label>
            <input matInput type="text" [(ngModel)]="inputCreateArtist" name="inputCreateArtist">
          </mat-form-field>
          <button type="button" (click)="createArtist(inputCreateArtist)" [disabled]="inputCreateArtist.length == 0" matButton="filled">CREATE</button>
        </form>
      </mat-card>

      <div id="artistContent">
        @for (artist of artists(); track artist.id) {
          <mat-card appearance="filled">
            <mat-card-content>
              @if (artist.filename == null) {
                <img src="placeholder.svg">
              } @else {
                <img [src]="downloadArtistImage(artist.id) | async">
              }
            </mat-card-content>
            <mat-card-header>
              <mat-card-title>{{ artist.name }}</mat-card-title>
            </mat-card-header>
            <mat-card-actions>
              <button (click)="deleteArtist(artist.id)" matButton>DELETE</button>
            </mat-card-actions>
          </mat-card>
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

  inputCreateArtist = ''

  private readonly keycloak = inject(Keycloak);
  private readonly http = inject(HttpClient);

  private api = new Api(this.http, this.keycloak);

  ngOnInit() {
    this.api.loadUsername(username => this.username.set(username));
    this.readAllArtist()
  }

  createArtist(name: string) {
    this.api.createArtist(name).subscribe(data => {
      this.inputCreateArtist = ''
      this.readAllArtist();
    })
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
