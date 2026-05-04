import { Component, inject, output } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatFormField, MatInput, MatLabel } from '@angular/material/input';
import Keycloak from 'keycloak-js';
import { HttpClient } from '@angular/common/http';
import { Api } from '../api';

@Component({
  selector: 'artist-create',
  imports: [
    MatButton,
    FormsModule,
    MatFormField,
    MatInput,
    MatLabel
  ],
  template: `
    <h3>Create</h3>
    <form>
      <mat-form-field>
        <mat-label>Artist</mat-label>
        <input matInput type="text" [(ngModel)]="inputCreateArtist" name="inputCreateArtist">
      </mat-form-field>
      <button type="button" (click)="createArtist(inputCreateArtist)" [disabled]="inputCreateArtist.length == 0" matButton="filled">CREATE</button>
    </form>
  `,
  styles: `
    button {
      margin-left: 16px;
    }
  `
})
export class ArtistCreate {
  inputCreateArtist = '';

  created = output<boolean>();

  private readonly keycloak = inject(Keycloak);
  private readonly http = inject(HttpClient);

  private api = new Api(this.http, this.keycloak);

  createArtist(name: string) {
    this.api.createArtist(name).subscribe(() => {
      this.inputCreateArtist = '';
      this.created.emit(true);
    })
  }
}
