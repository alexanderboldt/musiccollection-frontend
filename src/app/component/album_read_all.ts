import { Component, signal, inject, input } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { AsyncPipe } from '@angular/common';
import Keycloak from 'keycloak-js';
import { Observable } from 'rxjs';
import { MatCard, MatCardActions, MatCardContent, MatCardHeader, MatCardTitle } from '@angular/material/card';
import { MatButton} from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { Api } from '../api';
import { MatFormField, MatLabel } from '@angular/material/input';
import { MatOption, MatSelect } from '@angular/material/select';
import { MatDivider } from '@angular/material/list';

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
    MatFormField,
    MatLabel,
    MatSelect,
    MatOption,
    MatDivider
  ],
  template: `
    <h2>Album</h2>
    <mat-divider />

    <h3>Overview</h3>

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
          </mat-card-header>
          <mat-card-actions>
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

  private readonly keycloak = inject(Keycloak);
  private readonly http = inject(HttpClient);

  private api = new Api(this.http, this.keycloak);

  ngOnInit() {
    this.readAllAlbums()
  }

  ngOnChanges() {
    this.readAllAlbums()
  }

  readAllAlbums() {
    this.api.readAllAlbums(this.selectedOrder + this.selectedSort).subscribe(data => this.albums.set(data))
  }

  deleteAlbum(id: number) {
    this.api.deleteAlbum(id).subscribe(() => this.readAllAlbums());
  }

  downloadAlbumImage(id: number): Observable<string> {
    if (!this.imageUrlMap.has(id)) {
      this.imageUrlMap.set(id, this.api.downloadAlbumImage(id));
    }
    return this.imageUrlMap.get(id)!;
  }
}
