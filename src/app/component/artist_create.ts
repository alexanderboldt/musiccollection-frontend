import { Component, inject, output } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatFormField, MatInput, MatLabel } from '@angular/material/input';
import Keycloak from 'keycloak-js';
import { HttpClient } from '@angular/common/http';
import { Api } from '../api';
import { MatIcon } from '@angular/material/icon';
import { Router, RouterLink } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'artist-create',
  imports: [
    MatButton,
    FormsModule,
    MatFormField,
    MatInput,
    MatLabel,
    MatIcon,
    RouterLink
  ],
  template: `
    <button routerLink="/artist" matButton>
      <mat-icon>arrow_back</mat-icon>
      Back
    </button>

    <h2>Create</h2>

    <form>
      <mat-form-field>
        <mat-label>Artist</mat-label>
        <input matInput type="text" [(ngModel)]="inputCreateArtist" name="inputCreateArtist">
      </mat-form-field>
      <button type="button" (click)="createArtist(inputCreateArtist)" [disabled]="inputCreateArtist.length == 0" matButton="filled">CREATE</button>
    </form>
  `,
  styles: `
    h2 {
      color: var(--mat-sys-primary);
    }

    mat-form-field {
      margin-right: 16px;
    }
  `
})
export class ArtistCreate {
  inputCreateArtist = '';

  created = output<boolean>();

  private readonly keycloak = inject(Keycloak);
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private snackBar = inject(MatSnackBar);

  private api = new Api(this.http, this.keycloak);

  createArtist(name: string) {
    this.api.createArtist(name).subscribe(() => {
      this.snackBar.open(`Artist ${name} created successfully.`, "", { duration: 3000 });
      this.router.navigate(["/artist"]);
    })
  }
}
