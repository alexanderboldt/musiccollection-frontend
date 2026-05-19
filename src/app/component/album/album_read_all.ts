import { Component, signal, inject, OnInit } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { Observable, forkJoin } from 'rxjs';
import { MatCard, MatCardActions, MatCardContent, MatCardHeader, MatCardTitle, MatCardSubtitle } from '@angular/material/card';
import { MatButton} from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { Api } from '../../api';
import { MatFormField, MatLabel } from '@angular/material/input';
import { MatOption, MatSelect } from '@angular/material/select';
import { MatIcon } from '@angular/material/icon';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatDivider } from '@angular/material/list';
import { Option } from '../../util/option'

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
    RouterLink,
    MatDivider
  ],
  template: `
    <div id="sort">
      <mat-form-field>
        <mat-label>Filter</mat-label>
        <mat-select [(value)]="selectedFilter" (valueChange)="readAllAlbums()">
          <mat-option></mat-option>
          @for (option of artistFilter; track option) {
            <mat-option [value]="option.value">{{ option.viewValue }}</mat-option>
          }
        </mat-select>
      </mat-form-field>

      <mat-form-field>
        <mat-label>Sort</mat-label>
        <mat-select [(value)]="selectedSort" (valueChange)="readAllAlbums()">
          @for (option of sortOptions; track option) {
            <mat-option [value]="option.value">{{ option.viewValue }}</mat-option>
          }
        </mat-select>
      </mat-form-field>

      <button routerLink="/album/new" matButton>
        <mat-icon>add_circle_outline</mat-icon>
        CREATE ALBUM
      </button>
    </div>

    @if (albums().length == 0) {
      <mat-divider/>
      <p class="emptyState">No albums found.</p>
    }
    <div id="albumContent">
      @for (album of albums(); track album.id) {
        <mat-card appearance="filled">
          <mat-card-content routerLink="/album/{{album.id}}">
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

    .emptyState {
      margin-top: 16px;
      text-align: center;
    }

    #albumContent {
      display: grid;
      grid-template-columns: repeat(4, 350px);
      grid-gap: 16px;
    }

    mat-card-content {
      width: 100%;
      height: 250px;
      cursor: pointer;
    }

    img {
      width: 90%;
      height: 100%;
      object-fit: cover;
      border-radius: var(--mat-sys-corner-medium);
    }
  `
})
export class AlbumReadAll implements OnInit {
  artistFilter: Option[] = [];
  selectedFilter?: string = undefined;

  sortOptions: Option[] = [
    { value: 'id', viewValue: 'Created First' },
    { value: '-id', viewValue: 'Created Last' },
    { value: 'name', viewValue: 'Name A-Z' },
    { value: '-name', viewValue: 'Name Z-A' },
    { value: '-year', viewValue: 'Year Newest' },
    { value: 'year', viewValue: 'Year Oldest' },
  ];
  selectedSort = '';

  protected albums = signal<Album[]>([]);

  imageUrlMap = new Map<number, Observable<string>>();

  private readonly api = inject(Api);
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);

  ngOnInit() {
    this.api.readAllArtist("name").subscribe(artists => {
      for (const artist of artists) {
        this.artistFilter.push({ value: artist.id.toString(), viewValue: artist.name });
      }

      this.activatedRoute.queryParams.subscribe(params => {
        this.selectedFilter = this.artistFilter.find(options => options.value === params['filter'])?.value || undefined;
        this.selectedSort = this.sortOptions.find(options => options.value === params['sort'])?.value || this.sortOptions[0].value;
        this.readAllAlbums();
      });
    });
  }

  readAllAlbums() {
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: {
        filter: this.selectedFilter,
        sort: this.selectedSort
      },
      queryParamsHandling: 'merge'
    });

    if (this.selectedFilter != undefined) {
      this.api.readArtistAlbums(Number.parseInt(this.selectedFilter), this.selectedSort).subscribe(albumResponses => {
        const albums = albumResponses.map<Album>(albumResponse => {
          const album = new Album();
          album.id = albumResponse.id;
          album.name = albumResponse.name;
          album.artistName = this.artistFilter.find(artist => artist.value == this.selectedFilter)!!.viewValue;
          album.filename = albumResponse.filename;

          return album;
        })
        this.albums.set(albums);
      })
    } else {
      forkJoin([
        this.api.readAllAlbums(this.selectedSort),
        this.api.readAllArtist("id")
      ]).subscribe(([albumResponses, artistResponses]) => {
        const albums = albumResponses.map<Album>(albumResponse => {
          const album = new Album();
          album.id = albumResponse.id;
          album.name = albumResponse.name;
          album.artistName = artistResponses.find(artistResponse => artistResponse.id == albumResponse.artistId)?.name!!;
          album.filename = albumResponse.filename;

          return album;
        })
        this.albums.set(albums);
      })
    }
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
  id: number = 0;
  name: string = '';
  artistName: string = '';
  filename?: string;
}
