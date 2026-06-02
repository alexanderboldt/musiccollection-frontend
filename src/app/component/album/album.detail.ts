import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Api } from '../../api/api';
import { switchMap } from 'rxjs';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatFormField, MatInput, MatLabel } from '@angular/material/input';
import { MatIcon } from '@angular/material/icon';
import { DetailMode } from '../../navigation/detail.mode';
import { MatOption } from '@angular/material/core';
import { MatSelect } from '@angular/material/select';
import { AlbumRequest } from '../../api/model/album';
import { Snackbar } from '../snackbar';
import { Option } from '../option'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CONSTANTS } from '../constants';
import { NAVIGATION } from '../../navigation/navigation';
import { MatDialog } from '@angular/material/dialog';
import { DeleteDialogComponent, DeleteDialogData } from '../delete.dialog';

@Component({
  selector: 'album-detail',
  imports: [
    FormsModule,
    MatButton,
    MatFormField,
    MatInput,
    MatLabel,
    ReactiveFormsModule,
    MatIcon,
    RouterLink,
    MatOption,
    MatSelect
  ],
  template: `
    <button routerLink="{{ NAVIGATION.ALBUM.ROUTES.BASE }}" matButton>
      <mat-icon>arrow_back</mat-icon>
      {{ CONSTANTS.BUTTON.BACK }}
    </button>

    <form>
      @if (image() == "") {
        <img src="/placeholder.svg" alt="Placeholder Image">
      } @else {
        <img [src]="image()" alt="Image of the Artist">
      }

      <div style="display: flex; flex-direction: row;">
        <button type="button" (click)="fileInput.click()" [disabled]="isButtonSetImageDisabled()" matButton>{{ CONSTANTS.BUTTON.SET_IMAGE }}</button>
        <input type="file" id="file" hidden (change)="uploadAlbumImage($event)" #fileInput>

        <button (click)="openDialogDeleteAlbumImage()" [disabled]="isButtonDeleteImageDisabled()" matButton>{{ CONSTANTS.BUTTON.DELETE_IMAGE }}</button>
      </div>

      <mat-form-field>
        <mat-label>Artist</mat-label>
        <mat-select [(value)]="artist">
          @for (option of artistsSelect; track option) {
            <mat-option [value]="option.value">{{ option.viewValue }}</mat-option>
          }
        </mat-select>
      </mat-form-field>
      <mat-form-field>
        <mat-label>Name</mat-label>
        <input matInput type="text" [(ngModel)]="name" name="inputAlbum">
      </mat-form-field>
      <mat-form-field>
        <mat-label>Year</mat-label>
        <input matInput type="number" [(ngModel)]="year" name="inputYear">
      </mat-form-field>
      <mat-form-field>
        <mat-label>Tracks</mat-label>
        <input matInput type="number" [(ngModel)]="tracks" name="inputTracks">
      </mat-form-field>

      <button type="button" (click)="createOrUpdateAlbum()" [disabled]="isButtonCreateOrUpdateDisabled()"
              matButton="filled" [textContent]="buttonCreateOrUpdateText()"></button>
      <button type="button" (click)="openDialogDeleteAlbum()" [disabled]="isButtonDeleteDisabled()" matButton="outlined">{{ CONSTANTS.BUTTON.DELETE }}
      </button>
    </form>
  `,
  styles: `
    form {
      margin-top: 16px;
      display: grid;
      gap: 16px;
    }

    img {
      width: 500px;
      height: auto;
      object-fit: cover;
      border-radius: var(--mat-sys-corner-medium);
    }
  `
})
export class AlbumDetail implements OnInit {

  private readonly api = inject(Api);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly snackBar = inject(Snackbar);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dialog = inject(MatDialog);

  protected artistsSelect: Option[] = [];

  private mode: DetailMode = DetailMode.CREATE;

  private id = 0;

  image = signal("");
  isButtonSetImageDisabled = signal(true);
  isButtonDeleteImageDisabled = signal(true);

  artist = signal("");
  name = signal("");
  year = signal(0);
  tracks = signal(0);

  buttonCreateOrUpdateText = signal("");
  isButtonDeleteDisabled = signal(true);

  protected readonly CONSTANTS = CONSTANTS;
  protected readonly NAVIGATION = NAVIGATION;

  ngOnInit() {
    this.mode = this.activatedRoute.snapshot.data["mode"];

    this.api.readAllArtist("id")
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(artists => {
        artists.forEach(artist => this.artistsSelect.push({ value: artist.id.toString(), viewValue: artist.name }));
      });

    if (this.mode === DetailMode.CREATE) {
      this.buttonCreateOrUpdateText.set(CONSTANTS.BUTTON.CREATE);
    } else {
      this.activatedRoute.params.pipe(
        switchMap(params => this.api.readSingleAlbum(params["id"])),
        takeUntilDestroyed(this.destroyRef)
      ).subscribe(album => {
        this.id = album.id;

        if (album.filename != null) {
          this.api.downloadAlbumImage(this.id)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(url => {
              this.image.set(url);
              this.isButtonDeleteImageDisabled.set(false);
            });
        } else {
          this.isButtonDeleteImageDisabled.set(true);
        }
        this.isButtonSetImageDisabled.set(false);

        this.artist.set(album.artistId.toString());
        this.name.set(album.name);
        this.year.set(album.year);
        this.tracks.set(album.tracks);

        this.buttonCreateOrUpdateText.set(CONSTANTS.BUTTON.UPDATE);
        this.isButtonDeleteDisabled.set(false);
      });
    }
  }

  uploadAlbumImage(event: any) {
    this
      .api
      .uploadAlbumImage(this.id, event.target.files[0])
      .pipe(
        switchMap(() => this.api.downloadAlbumImage(this.id)),
        takeUntilDestroyed(this.destroyRef)
      ).subscribe(url => {
        this.image.set(url);
        this.isButtonDeleteImageDisabled.set(false);
      });
  }

  openDialogDeleteAlbumImage() {
    const dialogRef = this.dialog.open(DeleteDialogComponent, { data: new DeleteDialogData("Image", ` the image from ${this.name()}`) });

    dialogRef.afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(result => result && this.deleteAlbumImage());
  }

  deleteAlbumImage() {
    this.api.deleteAlbumImage(this.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.image.set("")
        this.isButtonDeleteImageDisabled.set(true);
      });
  }

  isButtonCreateOrUpdateDisabled() {
    return this.artist() == "" || this.name().length == 0 || this.year() <= 0 || this.tracks() <= 0;
  }

  createOrUpdateAlbum() {
    let album = new AlbumRequest();
    album.artistId = Number.parseFloat(this.artist());
    album.name = this.name();
    album.year = this.year();
    album.tracks = this.tracks();

    if (this.mode === DetailMode.CREATE) {
      this.api.createAlbum(album)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(album => {
          this.snackBar.show(CONSTANTS.SNACKBAR.ALBUM_CREATED);
          this.router.navigate([NAVIGATION.ALBUM.ROUTES.BASE, album.id]);
        });
    } else {
      this.api.updateAlbum(this.id, album)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => this.snackBar.show(CONSTANTS.SNACKBAR.ALBUM_UPDATED));
    }
  }

  openDialogDeleteAlbum() {
    const dialogRef = this.dialog.open(DeleteDialogComponent, { data: new DeleteDialogData("Album", this.name()) });

    dialogRef.afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(result => result && this.deleteAlbum());
  }

  deleteAlbum() {
    this.api.deleteAlbum(this.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.snackBar.show(CONSTANTS.SNACKBAR.ALBUM_DELETED);
        this.router.navigate([NAVIGATION.ALBUM.ROUTES.BASE]);
      });
  }
}
