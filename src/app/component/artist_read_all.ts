import { Component, signal, inject, input } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { AsyncPipe } from '@angular/common';
import Keycloak from 'keycloak-js';
import { Observable } from 'rxjs';
import { MatCard, MatCardActions, MatCardContent, MatCardHeader, MatCardTitle } from '@angular/material/card';
import { MatButton} from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { Api } from '../api';
import { MatFormField, MatLabel, MatInput } from '@angular/material/input';
import { MatOption, MatSelect } from '@angular/material/select';
import {MatIcon} from '@angular/material/icon';

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
    MatCardTitle,
    MatFormField,
    MatLabel,
    MatSelect,
    MatOption,
    MatIcon, MatInput
  ],
  template: `
    <h3>Overview</h3>

    <div id="sort">
      <mat-form-field>
        <mat-label>Sort</mat-label>
        <mat-select [(value)]="selectedSort" (valueChange)="readAllArtist()">
          @for (option of fieldSort; track option) {
            <mat-option [value]="option.value">{{ option.viewValue }}</mat-option>
          }
        </mat-select>
      </mat-form-field>

      <mat-form-field>
        <mat-label>Order</mat-label>
        <mat-select [(value)]="selectedOrder" (valueChange)="readAllArtist()">
          @for (option of orderSorts; track option) {
            <mat-option [value]="option.value">{{ option.viewValue }}</mat-option>
          }
        </mat-select>
      </mat-form-field>
    </div>

    <div id="artistContent">
      @for (artist of artists(); track artist.id) {
        <mat-card appearance="filled">
          <mat-card-content>
            @if (artist.filename == null) {
              <img src="/placeholder.svg" alt="Placeholder Image">
            } @else {
              <img [src]="downloadArtistImage(artist.id) | async" alt="Image of the Artist">
            }
          </mat-card-content>
          <mat-card-header>
            <mat-card-title>{{ artist.name }}</mat-card-title>
          </mat-card-header>
          <mat-card-actions>
            <button type="button" (click)="fileInput.click()" matButton>SET IMAGE</button>
            <input type="file" id="file" hidden (change)="uploadArtistImage(artist.id, $event)" #fileInput>

            <button (click)="deleteArtist(artist.id)" matButton>DELETE</button>
          </mat-card-actions>
        </mat-card>
      }
    </div>
  `,
  styles: `
    #sort {
      display: flex;
      flex-direction: row;
      gap: 16px;
      margin-top: 24px;
    }

    #artistContent {
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
  fieldSort: Sort[] = [
    {value: 'id', viewValue: 'Created'},
    {value: 'name', viewValue: 'Name'},
  ];
  selectedSort = this.fieldSort[0].value;

  orderSorts: Sort[] = [
    {value: '', viewValue: 'ASC'},
    {value: '-', viewValue: 'DESC'},
  ];
  selectedOrder = this.orderSorts[0].value;

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
    this.api.readAllArtist(this.selectedOrder + this.selectedSort).subscribe(data => this.artists.set(data))
  }

  deleteArtist(id: number) {
    this.api.deleteArtist(id).subscribe(() => this.readAllArtist());
  }

  uploadArtistImage(id: number, event: any) {
    this.api.uploadArtistImage(id, event.target.files[0]).subscribe(() => this.readAllArtist());
  }

  downloadArtistImage(id: number): Observable<string> {
    if (!this.imageUrlMap.has(id)) {
      this.imageUrlMap.set(id, this.api.downloadArtistImage(id));
    }
    return this.imageUrlMap.get(id)!;
  }
}
