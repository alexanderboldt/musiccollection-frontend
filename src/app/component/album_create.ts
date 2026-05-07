import { Component, inject, output } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatFormField, MatInput, MatLabel } from '@angular/material/input';
import Keycloak from 'keycloak-js';
import { HttpClient } from '@angular/common/http';
import { Api } from '../api';
import { AlbumRequest } from '../model/album';
import { MatOption } from '@angular/material/core';
import { MatSelect } from '@angular/material/select';

@Component({
  selector: 'album-create',
  imports: [
    MatButton,
    FormsModule,
    MatFormField,
    MatInput,
    MatLabel,
    MatOption,
    MatSelect
  ],
  template: `
    <h3>Create</h3>
    <form>
      <mat-form-field>
        <mat-label>Artist</mat-label>
        <mat-select [(value)]="selectedSort">
          @for (option of fieldSort; track option) {
            <mat-option [value]="option.value">{{ option.viewValue }}</mat-option>
          }
        </mat-select>
      </mat-form-field>
      <mat-form-field>
        <mat-label>Name</mat-label>
        <input matInput type="text" [(ngModel)]="inputAlbum" name="inputAlbum">
      </mat-form-field>
      <mat-form-field>
        <mat-label>Year</mat-label>
        <input matInput type="text" [(ngModel)]="inputYear" name="inputYear">
      </mat-form-field>
      <mat-form-field>
        <mat-label>Tracks</mat-label>
        <input matInput type="text" [(ngModel)]="inputTracks" name="inputTracks">
      </mat-form-field>
      <button type="button" (click)="createAlbum()" [disabled]="isButtonDisabled()" matButton="filled">CREATE</button>
    </form>
  `,
  styles: `
    mat-form-field {
      margin-right: 16px;
    }
  `
})
export class AlbumCreate {
  fieldSort: Sort[] = [];

  selectedSort = '';
  inputAlbum = '';
  inputYear = 0;
  inputTracks = 0;

  created = output<boolean>();

  private readonly keycloak = inject(Keycloak);
  private readonly http = inject(HttpClient);

  private api = new Api(this.http, this.keycloak);

  ngOnInit() {
    this.api.readAllArtist("id").subscribe(artists => {
      for (const artist of artists) {
        this.fieldSort.push({ value: artist.id.toString(), viewValue: artist.name });
      }
    })
  }

  isButtonDisabled(): boolean {
    return this.selectedSort == '' || this.inputAlbum.length == 0 || this.inputYear <= 0 || this.inputTracks <= 0
  }

  createAlbum() {
    let album = new AlbumRequest();
    album.artistId = Number.parseFloat(this.selectedSort);
    album.name = this.inputAlbum;
    album.year = this.inputYear;
    album.tracks = this.inputTracks;

    this.api.createAlbum(album).subscribe(() => {
      this.inputAlbum = '';
      this.created.emit(true);
    })
  }
}
