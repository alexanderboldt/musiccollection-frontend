import { Component, signal, inject } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { RouterOutlet } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import Keycloak from 'keycloak-js';
import {AsyncPipe, NgOptimizedImage} from '@angular/common';
import {map, Observable} from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MatIcon, NgOptimizedImage, AsyncPipe],
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
              <p hidden="hidden">{{done()}}</p>
              <!-- <img [src]="downloadArtistImage(artist.id)" style="width: 100%; border-radius: 8px;">
              <img [src]="imageDisplay" style="width: 100%; border-radius: 8px;">-->
              <img [src]="getImage$(artist.id) | async" style="height: 100%; width: 100%; object-fit: cover; border-radius: 8px;">

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

  done = signal(false)
  imageDisplay: string | ArrayBuffer | null = null
  imageUrlMap = new Map<number, Observable<string>>();

  private readonly keycloak = inject(Keycloak);
  private readonly http = inject(HttpClient);

  ngOnInit() {
    this.keycloak.loadUserProfile().then(profile => {
      this.username.set(`${profile.firstName} ${profile.lastName}`);
    });

    this.readAllArtist()
  }

  readAllArtist() {
    this.http.get<Array<Artist>>(
      'http://localhost:4000/api/v1/artists',
      { headers: { 'Access-Control-Allow-Origin': '*', 'Content-type': 'application/json', 'Authorization': `Bearer ${this.keycloak.token}` }
      }).subscribe(data => this.artists.set(data));
  }

  deleteArtist(id: number) {
    this.http.delete(
      'http://localhost:4000/api/v1/artists/' + id,
      { headers: { 'Access-Control-Allow-Origin': '*', 'Content-type': 'application/json', 'Authorization': `Bearer ${this.keycloak.token}` }
      }).subscribe(() => this.readAllArtist());
  }

  getImage$(id: number): Observable<string> {
    if (!this.imageUrlMap.has(id)) {
      this.imageUrlMap.set(id, this.downloadArtistImage(id));
    }
    return this.imageUrlMap.get(id)!;
  }

  downloadArtistImage(id: number) : Observable<string> {
    return this.http.get(
      `http://localhost:4000/api/v1/artists/${id}/images`,
      { headers: { 'Access-Control-Allow-Origin': '*', 'Authorization': `Bearer ${this.keycloak.token}`},  responseType: 'blob'}
    ).pipe(map(data => {
      this.done.set(true)
      return URL.createObjectURL(data)
    }));
  }

  downloadArtistImage2(id: number) {
    this.http.get(
      `http://localhost:4000/api/v1/artists/${id}/images`,
      { headers: { 'Access-Control-Allow-Origin': '*', 'Authorization': `Bearer ${this.keycloak.token}`},  responseType: 'blob'}
    ).subscribe(data => {
      this.imageDisplay = URL.createObjectURL(data)
      this.done.set(true)
    });
  }

  downloadArtistImage3(id: number) {
    this.http.get(
      `http://localhost:4000/api/v1/artists/${id}/images`,
      { headers: { 'Access-Control-Allow-Origin': '*', 'Authorization': `Bearer ${this.keycloak.token}`},  responseType: 'blob'}
    ).subscribe(data => {
      const fileReader = new FileReader();

      fileReader.addEventListener('load', () => {
        this.imageDisplay = fileReader.result; // the resulting image data
        console.log(this.imageDisplay)
        this.done.set(true)
      }, false);

      if (data) {
        console.log("read it")
        fileReader.readAsDataURL(data);
      }
    });
  }

  logout() {
    this.keycloak.logout({ redirectUri: window.location.origin });
  }
}

class Artist {
  id: number = 0
  name: string = ''
  filename?: string
}
