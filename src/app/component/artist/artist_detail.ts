import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Api } from '../../api';
import { switchMap } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatFormField, MatInput, MatLabel } from '@angular/material/input';
import { MatIcon } from '@angular/material/icon';
import { DetailMode } from '../../util/detail_mode';
import { SnackBarUtils } from '../../util/snackbar_utils';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

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
    <button routerLink="/artist" matButton>
      <mat-icon>arrow_back</mat-icon>
      Back
    </button>

    <form>
      @if (image() == "") {
        <img src="/placeholder.svg" alt="Placeholder Image">
      } @else {
        <img [src]="image()" alt="Image of the Artist">
      }

      <div style="display: flex; flex-direction: row;">
        <button type="button" (click)="fileInput.click()" [disabled]="isButtonSetImageDisabled()" matButton>SET IMAGE
        </button>
        <input type="file" id="file" hidden (change)="uploadArtistImage($event)" #fileInput>

        <button (click)="deleteArtistImage()" [disabled]="isButtonDeleteImageDisabled()" matButton>DELETE IMAGE</button>
      </div>

      <mat-form-field>
        <mat-label>Artist</mat-label>
        <input matInput type="text" [(ngModel)]="name" (ngModelChange)="onChangeArtistName()" name="inputArtistName">
      </mat-form-field>
      <button type="button" (click)="createOrUpdateArtist()" [disabled]="isButtonCreateOrUpdateDisabled()"
              matButton="filled" [textContent]="buttonCreateOrUpdateText()"></button>
      <button type="button" (click)="deleteArtist()" [disabled]="isButtonDeleteDisabled()" matButton="outlined">DELETE
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
  private readonly snackBar = inject(SnackBarUtils);
  private readonly destroyRef = inject(DestroyRef);

  private mode: DetailMode = DetailMode.CREATE

  private id = 0;

  image = signal("");
  isButtonSetImageDisabled = signal(true);
  isButtonDeleteImageDisabled = signal(true);

  name = signal("");

  buttonCreateOrUpdateText = signal("");
  isButtonCreateOrUpdateDisabled = signal(true);
  isButtonDeleteDisabled = signal(true);

  ngOnInit() {
    this.mode = this.activatedRoute.snapshot.data['mode'];

    if (this.mode === DetailMode.CREATE) {
      this.buttonCreateOrUpdateText.set("CREATE");
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

        this.buttonCreateOrUpdateText.set("UPDATE");
        this.isButtonCreateOrUpdateDisabled.set(false);
        this.isButtonDeleteDisabled.set(false);
      })
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
      });
  }

  deleteArtistImage() {
    this.api.deleteArtistImage(this.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.image.set("")
        this.isButtonDeleteImageDisabled.set(true);
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
          this.snackBar.show("Artist successfully created.");
          this.router.navigate(['/artist', artist.id]);
        })
    } else {
      this.api.updateArtist(this.id, this.name())
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => this.snackBar.show("Artist successfully updated."))
    }
  }

  deleteArtist() {
    this.api.deleteArtist(this.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.snackBar.show("Artist successfully deleted.");
        this.router.navigate(["/artist"]);
      });
  }
}
