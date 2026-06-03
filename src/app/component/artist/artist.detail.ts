import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Api } from '../../api/api';
import { switchMap } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatFormField, MatInput, MatLabel } from '@angular/material/input';
import { MatIcon } from '@angular/material/icon';
import { DetailMode } from '../../navigation/detail.mode';
import { Snackbar } from '../snackbar';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CONSTANTS } from '../constants';
import { NAVIGATION } from '../../navigation/navigation';
import { MatDialog } from '@angular/material/dialog';
import { DeleteDialogComponent, DeleteDialogData } from '../delete.dialog';

@Component({
  selector: 'artist-detail',
  imports: [
    FormsModule,
    MatButton,
    MatFormField,
    MatInput,
    MatLabel,
    MatIcon,
    RouterLink
  ],
  template: `
    <button routerLink="{{ NAVIGATION.ARTIST.ROUTES.BASE }}" matButton>
      <mat-icon>arrow_back</mat-icon>
      {{  CONSTANTS.BUTTON.BACK }}
    </button>

    <form>
      @if (image() == "") {
        <img src="/placeholder.svg" alt="Placeholder Image">
      } @else {
        <img [src]="image()" alt="Image of the Artist">
      }

      <div style="display: flex; flex-direction: row;">
        <button type="button" (click)="fileInput.click()" [disabled]="isButtonSetImageDisabled()" matButton>{{ CONSTANTS.BUTTON.SET_IMAGE }}</button>
        <input type="file" id="file" hidden (change)="uploadArtistImage($event)" #fileInput>

        <button (click)="openDialogDeleteArtistImage()" [disabled]="isButtonDeleteImageDisabled()" matButton>{{ CONSTANTS.BUTTON.DELETE_IMAGE }}</button>
      </div>

      <mat-form-field>
        <mat-label>Artist</mat-label>
        <input matInput type="text" [(ngModel)]="name" (ngModelChange)="onChangeArtistName()" name="inputArtistName">
      </mat-form-field>
      <button type="button" (click)="createOrUpdateArtist()" [disabled]="isButtonCreateOrUpdateDisabled()"
              matButton="filled" [textContent]="buttonCreateOrUpdateText()"></button>
      <button type="button" (click)="openDialogDeleteArtist()" [disabled]="isButtonDeleteDisabled()" matButton="outlined">{{ CONSTANTS.BUTTON.DELETE }}
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
export class ArtistDetail implements OnInit{

  private readonly api = inject(Api);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly snackBar = inject(Snackbar);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dialog = inject(MatDialog);

  private mode: DetailMode = DetailMode.CREATE;

  private id = 0;

  image = signal("");
  isButtonSetImageDisabled = signal(true);
  isButtonDeleteImageDisabled = signal(true);

  name = signal("");

  buttonCreateOrUpdateText = signal("");
  isButtonCreateOrUpdateDisabled = signal(true);
  isButtonDeleteDisabled = signal(true);

  protected readonly CONSTANTS = CONSTANTS;
  protected readonly NAVIGATION = NAVIGATION;

  ngOnInit() {
    this.mode = this.activatedRoute.snapshot.data["mode"];

    if (this.mode === DetailMode.CREATE) {
      this.buttonCreateOrUpdateText.set(CONSTANTS.BUTTON.CREATE);
    } else {
      this.activatedRoute.params.pipe(
        switchMap(params => this.api.readSingleArtist(params["id"])),
        takeUntilDestroyed(this.destroyRef)
      ).subscribe(artist => {
        this.id = artist.id;

        if (artist.filename != null) {
          this.api.downloadArtistImage(this.id)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(url => {
              this.image.set(url);
              this.isButtonDeleteImageDisabled.set(false);
            });
        } else {
          this.isButtonDeleteImageDisabled.set(true);
        }
        this.isButtonSetImageDisabled.set(false);

        this.name.set(artist.name);

        this.buttonCreateOrUpdateText.set(CONSTANTS.BUTTON.UPDATE);
        this.isButtonCreateOrUpdateDisabled.set(false);
        this.isButtonDeleteDisabled.set(false);
      });
    }
  }

  uploadArtistImage(event: any) {
    this.api.uploadArtistImage(this.id, event.target.files[0])
      .pipe(
        switchMap(() => this.api.downloadArtistImage(this.id)),
        takeUntilDestroyed(this.destroyRef)
      ).subscribe(url => {
        this.image.set(url);
        this.isButtonDeleteImageDisabled.set(false);
        this.snackBar.show(CONSTANTS.SNACKBAR.IMAGE_UPLOADED);
      });
  }

  openDialogDeleteArtistImage() {
    const dialogRef = this.dialog.open(DeleteDialogComponent, { data: new DeleteDialogData("Image", ` the image from ${this.name()}`) });

    dialogRef.afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(result => result && this.deleteArtistImage());
  }

  deleteArtistImage() {
    this.api.deleteArtistImage(this.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.image.set("")
        this.isButtonDeleteImageDisabled.set(true);
        this.snackBar.show(CONSTANTS.SNACKBAR.IMAGE_DELETED);
      });
  }

  onChangeArtistName() {
    this.isButtonCreateOrUpdateDisabled.set(this.name().length == 0);
  }

  createOrUpdateArtist() {
    if (this.mode === DetailMode.CREATE) {
      this.api.createArtist(this.name())
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(artist => {
          this.snackBar.show(CONSTANTS.SNACKBAR.ARTIST_CREATED);
          this.router.navigate([NAVIGATION.ARTIST.ROUTES.BASE, artist.id]);
        });
    } else {
      this.api.updateArtist(this.id, this.name())
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => this.snackBar.show(CONSTANTS.SNACKBAR.ARTIST_UPDATED));
    }
  }

  openDialogDeleteArtist() {
    const dialogRef = this.dialog.open(DeleteDialogComponent, { data: new DeleteDialogData("Artist", this.name()) });

    dialogRef.afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(result => result && this.deleteArtist());
  }

  deleteArtist() {
    this.api.deleteArtist(this.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.snackBar.show(CONSTANTS.SNACKBAR.ARTIST_DELETED);
        this.router.navigate([NAVIGATION.ARTIST.ROUTES.BASE]);
      });
  }
}
