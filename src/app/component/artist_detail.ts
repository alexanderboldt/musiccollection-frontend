import { Component, inject, signal } from '@angular/core';
import { Location} from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Api } from '../api';
import Keycloak from 'keycloak-js';
import { HttpClient } from '@angular/common/http';
import { switchMap } from 'rxjs';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatFormField, MatInput, MatLabel } from '@angular/material/input';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'artist',
  imports: [
    FormsModule,
    MatButton,
    MatFormField,
    MatInput,
    MatLabel,
    ReactiveFormsModule,
    MatIcon,
  ],
  template: `
    <button (click)="navigateBack()" matButton>
      <mat-icon>arrow_back</mat-icon>
      Back
    </button>

    <form>
      <mat-form-field>
        <mat-label>Artist</mat-label>
        <input matInput type="text" [(ngModel)]="artistName" name="inputCreateArtist">
      </mat-form-field>
      <button type="button" (click)="updateArtist()" [disabled]="artistName().length == 0" matButton="filled">UPDATE</button>
    </form>
  `,
  styles: `
    h2 {
      color: var(--mat-sys-primary);
    }
    form {
      margin-top: 16px;
    }

    form button {
      margin-left: 16px;
    }
  `
})
export class ArtistDetail {

  private activatedRoute = inject(ActivatedRoute);
  private location = inject(Location);

  private readonly keycloak = inject(Keycloak);
  private readonly http = inject(HttpClient);

  private api = new Api(this.http, this.keycloak);

  private id = 0

  artistName = signal("")

  ngOnInit() {
    this.activatedRoute.params.pipe(
      switchMap(params => {
        this.id = params["id"]
        return this.api.readSingleArtist(params["id"])
      })
    ).subscribe(artist => {
      this.artistName.set(artist.name)
    })
  }

  navigateBack() {
    this.location.back();
  }

  updateArtist() {
    this.api.updateArtist(this.id, this.artistName()).subscribe(() => {})
  }
}
