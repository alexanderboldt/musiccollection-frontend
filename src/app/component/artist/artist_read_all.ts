import { Component, signal, inject, OnInit, DestroyRef } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { Observable } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatCard, MatCardActions, MatCardContent, MatCardHeader, MatCardTitle } from '@angular/material/card';
import { MatButton} from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { Api } from '../../api';
import { MatFormField, MatLabel } from '@angular/material/input';
import { MatOption, MatSelect } from '@angular/material/select';
import { ArtistResponse } from '../../model/artist';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { MatDivider } from '@angular/material/list';
import { Option } from '../../util/option'

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
    MatIcon,
    MatDivider,
    RouterLink
  ],
  template: `
    <div id="sort">
      <mat-form-field>
        <mat-label>Sort</mat-label>
        <mat-select [(value)]="selectedSort" (valueChange)="onSortSelectionChange()">
          @for (option of sortOptions; track option) {
            <mat-option [value]="option.value">{{ option.viewValue }}</mat-option>
          }
        </mat-select>
      </mat-form-field>

      <button routerLink="/artist/new" matButton>
        <mat-icon>add_circle_outline</mat-icon>
        CREATE ARTIST
      </button>
    </div>

    @if (artists().length == 0) {
      <mat-divider/>
      <p class="emptyState">No artists found.</p>
    }
    <div id="artistContent">
      @for (artist of artists(); track artist.id) {
        <mat-card appearance="filled">
          <mat-card-content routerLink="/artist/{{artist.id}}">
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

            <button (click)="deleteArtistImage(artist.id)" matButton>DELETE IMAGE</button>

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
      align-items: baseline;
      gap: 16px;
      margin-top: 24px;
    }

    .emptyState {
      margin-top: 16px;
      text-align: center;
    }

    #artistContent {
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
export class ArtistReadAll implements OnInit {
  protected sortOptions: Option[] = [
    { value: 'id', viewValue: 'Created First' },
    { value: '-id', viewValue: 'Created Last' },
    { value: 'name', viewValue: 'Name A-Z' },
    { value: '-name', viewValue: 'Name Z-A' }
  ];
  protected selectedSort = '';

  protected artists = signal<ArtistResponse[]>([]);

  protected imageUrlMap = new Map<number, Observable<string>>();

  private readonly api = inject(Api);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit() {
    // Subscribe to query params and fetch artists on change
    this.activatedRoute.queryParams.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(params => {
      this.selectedSort = this.sortOptions.find(options => options.value === params['sort'])?.value || this.sortOptions[0].value;
      this.fetchArtists();
    });
  }

  onSortSelectionChange() {
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: { sort: this.selectedSort },
      queryParamsHandling: 'merge'
    });
  }

  readAllArtist() {
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: { sort: this.selectedSort },
      queryParamsHandling: 'merge'
    });
    this.fetchArtists();
  }

  deleteArtist(id: number) {
    this.api.deleteArtist(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.readAllArtist());
  }

  uploadArtistImage(id: number, event: any) {
    this.api.uploadArtistImage(id, event.target.files[0])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.readAllArtist());
  }

  downloadArtistImage(id: number): Observable<string> {
    if (!this.imageUrlMap.has(id)) {
      this.imageUrlMap.set(id, this.api.downloadArtistImage(id));
    }
    return this.imageUrlMap.get(id)!;
  }

  deleteArtistImage(id: number) {
    this.api.deleteArtistImage(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.readAllArtist());
  }

  private fetchArtists() {
    this.api.readAllArtist(this.selectedSort)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(data => this.artists.set(data));
  }
}
