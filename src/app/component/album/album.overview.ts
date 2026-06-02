import { Component, signal, inject, OnInit, DestroyRef } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { Observable, forkJoin, switchMap, tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButton} from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { Api } from '../../api/api';
import { MatFormField, MatLabel } from '@angular/material/input';
import { MatOption, MatSelect } from '@angular/material/select';
import { MatIcon } from '@angular/material/icon';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatDivider } from '@angular/material/list';
import { Option } from '../option';
import { Card } from '../card';
import { CONSTANTS } from '../constants';
import { NAVIGATION } from '../../navigation/navigation';
import { DeleteDialogComponent, DeleteDialogData } from '../delete.dialog';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'album-overview',
  imports: [
    MatButton,
    FormsModule,
    AsyncPipe,
    MatFormField,
    MatLabel,
    MatSelect,
    MatOption,
    MatIcon,
    RouterLink,
    MatDivider,
    Card
  ],
  template: `
    <h2>Albums</h2>
    <div id="sort">
      <mat-form-field>
        <mat-label>Filter</mat-label>
        <mat-select [(value)]="selectedFilter" (valueChange)="onFilterSelectionChange()">
          <mat-option>--</mat-option>
          @for (option of filterOptions; track option) {
            <mat-option [value]="option.value">{{ option.viewValue }}</mat-option>
          }
        </mat-select>
      </mat-form-field>

      <mat-form-field>
        <mat-label>Sort</mat-label>
        <mat-select [(value)]="selectedSort" (valueChange)="onSortSelectionChange()">
          @for (option of sortOptions; track option) {
            <mat-option [value]="option.value">{{ option.viewValue }}</mat-option>
          }
        </mat-select>
      </mat-form-field>

      <button routerLink="{{ NAVIGATION.ALBUM.ROUTES.NEW }}" matButton>
        <mat-icon>add_circle_outline</mat-icon>
        {{ CONSTANTS.BUTTON.CREATE_ALBUM }}
      </button>
    </div>

    @if (albums().length == 0) {
      <mat-divider/>
      <p class="emptyState">No albums found.</p>
    }
    <div id="albumContent">
      @for (album of albums(); track album.id) {
        <card
          detailRoute="{{ NAVIGATION.ALBUM.ROUTES.DETAIL.replace(':id', album.id.toString()) }}"
          [image]="album.filename ? (downloadAlbumImage(album.id) | async) : null"
          [title]="album.name"
          [subtitle]="album.artistName"
          [isButtonDeleteImageDisabled]="album.filename == null"
          (uploadImage)="uploadAlbumImage(album.id, $event)"
          (deleteImage)="openDialogDeleteAlbumImage(album.id, album.name)"
          (delete)="openDialogDeleteAlbum(album.id, album.name)" />
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
  `
})
export class AlbumOverview implements OnInit {
  protected filterOptions: Option[] = [];
  protected selectedFilter?: string = undefined;

  protected sortOptions: Option[] = [
    { value: 'id', viewValue: 'Created First' },
    { value: '-id', viewValue: 'Created Last' },
    { value: 'name', viewValue: 'Name A-Z' },
    { value: '-name', viewValue: 'Name Z-A' },
    { value: '-year', viewValue: 'Year Newest' },
    { value: 'year', viewValue: 'Year Oldest' },
  ];
  protected selectedSort = '';

  protected albums = signal<Album[]>([]);

  private imageUrlMap = new Map<number, Observable<string>>();

  private readonly api = inject(Api);
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dialog = inject(MatDialog);

  protected readonly CONSTANTS = CONSTANTS;
  protected readonly NAVIGATION = NAVIGATION;

  ngOnInit() {
    // Initialize filter options and subscribe to query params
    this.api.readAllArtist("name").pipe(
      tap(artists => {
        artists.forEach(artist => {
          this.filterOptions.push({ value: artist.id.toString(), viewValue: artist.name });
        });
      }),
      switchMap(() => this.activatedRoute.queryParams),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(params => {
      this.selectedFilter = this.filterOptions.find(options => options.value === params[CONSTANTS.PARAM.FILTER])?.value || undefined;
      this.selectedSort = this.sortOptions.find(options => options.value === params[CONSTANTS.PARAM.SORT])?.value || this.sortOptions[0].value;
      this.fetchAlbums();
    });
  }

  onFilterSelectionChange() {
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: { filter: this.selectedFilter },
      queryParamsHandling: 'merge'
    });
  }

  onSortSelectionChange() {
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: { sort: this.selectedSort },
      queryParamsHandling: 'merge'
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
    this.fetchAlbums();
  }

  openDialogDeleteAlbum(id: number, name: string) {
    const dialogRef = this.dialog.open(DeleteDialogComponent, { data: new DeleteDialogData("Album", name) });

    dialogRef.afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(result => result && this.deleteAlbum(id));
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

  openDialogDeleteAlbumImage(id: number, name: string) {
    const dialogRef = this.dialog.open(DeleteDialogComponent, { data: new DeleteDialogData("Image", ` the image from ${name}`) });

    dialogRef.afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(result => result && this.deleteAlbumImage(id));
  }

  deleteAlbumImage(id: number) {
    this.api.deleteAlbumImage(id).subscribe(() => this.readAllAlbums());
  }

  private fetchAlbums() {
    if (this.selectedFilter != undefined) {
      this.api.readArtistAlbums(Number.parseInt(this.selectedFilter), this.selectedSort)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(albumResponses => {
          const albums = albumResponses.map<Album>(albumResponse => {
            const album = new Album();
            album.id = albumResponse.id;
            album.name = albumResponse.name;
            album.artistName = this.filterOptions.find(artist => artist.value == this.selectedFilter)!!.viewValue;
            album.filename = albumResponse.filename;
            return album;
          })
          this.albums.set(albums);
        })
    } else {
      forkJoin([
        this.api.readAllAlbums(this.selectedSort),
        this.api.readAllArtist("id")
      ]).pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(([albumResponses, artistResponses]) => {
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
}

class Album {
  id: number = 0;
  name: string = '';
  artistName: string = '';
  filename?: string;
}
