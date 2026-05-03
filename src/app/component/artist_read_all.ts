import { Component, signal, inject, input } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { AsyncPipe } from '@angular/common';
import Keycloak from 'keycloak-js';
import { Observable } from 'rxjs';
import { MatCard, MatCardActions, MatCardContent, MatCardHeader, MatCardTitle } from '@angular/material/card';
import { MatButton} from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { Api } from '../api';

@Component({
  selector: 'artist-read-all',
  imports: [
    MatButton,
    MatCard,
    FormsModule,
    AsyncPipe,
    MatCardActions,
    MatCardContent,
    MatCardHeader,
    MatCardTitle
  ],
  template: `
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
  `,
  styles: `
    #artistContent {
      margin-top: 8px;
      display: grid;
      grid-template-columns: repeat(4, 350px);
      grid-gap: 16px;
    }

    mat-card-content {
      width: 100%;
      height: 250px;
    }

    img {
      width: 90%;
      height: 100%;
      object-fit: cover;
      border-radius: 8px;
    }
  `
})
export class ArtistReadAll {
  reloadArtists = input<boolean>()

  protected artists = signal<Artist[]>([]);

  imageUrlMap = new Map<number, Observable<string>>();

  private readonly keycloak = inject(Keycloak);
  private readonly http = inject(HttpClient);

  private api = new Api(this.http, this.keycloak);

  ngOnInit() {
    this.readAllArtist()
  }

  ngOnChanges() {
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
}
