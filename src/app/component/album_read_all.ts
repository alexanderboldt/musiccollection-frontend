import { Component, signal, inject, input } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { Observable, forkJoin } from 'rxjs';
import { MatCard, MatCardActions, MatCardContent, MatCardHeader, MatCardTitle, MatCardSubtitle } from '@angular/material/card';
import { MatButton} from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { Api } from '../api';
import { MatFormField, MatLabel } from '@angular/material/input';
import { MatOption, MatSelect } from '@angular/material/select';
import { MatIcon } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'album-read-all',
  imports: [
    MatButton,
    MatCard,
    FormsModule,
    AsyncPipe,
    MatCardActions,
    MatCardContent,
    MatCardHeader,
    MatCardTitle,
    MatCardSubtitle,
    MatFormField,
    MatLabel,
    MatSelect,
    MatOption,
    MatIcon,
    RouterLink
  ],
  template: `
    <div id="sort">
      <mat-form-field>
        <mat-label>Sort</mat-label>
        <mat-select [(value)]="selectedSort" (valueChange)="readAllAlbums()">
          @for (option of fieldSort; track option) {
            <mat-option [value]="option.value">{{ option.viewValue }}</mat-option>
          }
        </mat-select>
      </mat-form-field>

      <mat-form-field>
        <mat-label>Order</mat-label>
        <mat-select [(value)]="selectedOrder" (valueChange)="readAllAlbums()">
          @for (option of orderSorts; track option) {
            <mat-option [value]="option.value">{{ option.viewValue }}</mat-option>
          }
        </mat-select>
      </mat-form-field>

      <button routerLink="/album/new" matButton>
        <mat-icon>add_circle_outline</mat-icon>
        CREATE ALBUM
      </button>
    </div>

    <div id="albumContent">
      @for (album of albums(); track album.id) {
        <mat-card appearance="filled">
          <mat-card-content>
            @if (album.filename == null) {
              <img src="/placeholder.svg" alt="Placeholder Image">
            } @else {
              <img [src]="downloadAlbumImage(album.id) | async" alt="Image of the Album">
            }
          </mat-card-content>
          <mat-card-header>
            <mat-card-title>{{ album.name }}</mat-card-title>
            <mat-card-subtitle>{{ album.artistName }}</mat-card-subtitle>
          </mat-card-header>
          <mat-card-actions>
            <button type="button" (click)="fileInput.click()" matButton>SET IMAGE</button>
            <input type="file" id="file" hidden (change)="uploadAlbumImage(album.id, $event)" #fileInput>

            <button (click)="deleteAlbumImage(album.id)" matButton>DELETE IMAGE</button>

            <button (click)="deleteAlbum(album.id)" matButton>DELETE</button>
          </mat-card-actions>
        </mat-card>
      }
    </div>
  `,
  styles: `
    h2 {
      color: var(--mat-sys-primary);
    }

    #sort {
      display: flex;
      flex-direction: row;
      align-items: baseline;
      gap: 16px;
      margin-top: 24px;
    }

    #albumContent {
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
export class AlbumReadAll {
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

  reloadAlbums = input<boolean>()

  protected albums = signal<Album[]>([]);

  imageUrlMap = new Map<number, Observable<string>>();

  private readonly api = inject(Api);

  ngOnChanges() {
    this.readAllAlbums()
  }

  readAllAlbums() {
    forkJoin([
      this.api.readAllAlbums(this.selectedOrder + this.selectedSort),
      this.api.readAllArtist("id")
    ]).subscribe(([albumResponses, artistResponses]) => {
      const albums = albumResponses.map<Album>(albumResponse => {
        const album = new Album()
        album.id = albumResponse.id
        album.name = albumResponse.name
        album.artistName = artistResponses.find(artistResponse => artistResponse.id == albumResponse.artistId)?.name!!
        album.filename = albumResponse.filename

        return album
      })
      this.albums.set(albums)
    })
  }

  deleteAlbum(id: number) {
    this.api.deleteAlbum(id).subscribe(() => this.readAllAlbums());
  }

  uploadAlbumImage(id: number, event: any) {
    this.api.uploadAlbumImage(id, event.target.files[0]).subscribe(() => this.readAllAlbums());
  }

  downloadAlbumImage(id: number): Observable<string> {
    if (!this.imageUrlMap.has(id)) {
      this.imageUrlMap.set(id, this.api.downloadAlbumImage(id));
    }
    return this.imageUrlMap.get(id)!;
  }

  deleteAlbumImage(id: number) {
    this.api.deleteAlbumImage(id).subscribe(() => this.readAllAlbums());
  }
}

class Album {
  id: number = 0
  name: string = ''
  artistName: string = ''
  filename?: string
}
