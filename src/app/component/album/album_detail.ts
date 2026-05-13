import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Api } from '../../api';
import { switchMap } from 'rxjs';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatFormField, MatInput, MatLabel } from '@angular/material/input';
import { MatIcon } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DetailMode } from '../../util/detail_mode';
import { MatOption } from '@angular/material/core';
import { MatSelect } from '@angular/material/select';
import {AlbumRequest} from '../../model/album';

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
    <button routerLink="/album" matButton>
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
        <input type="file" id="file" hidden (change)="uploadAlbumImage($event)" #fileInput>

        <button (click)="deleteAlbumImage()" [disabled]="isButtonDeleteImageDisabled()" matButton>DELETE IMAGE</button>
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
      <button type="button" (click)="deleteAlbum()" [disabled]="isButtonDeleteDisabled()" matButton="outlined">DELETE
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
export class AlbumDetail {

  private readonly api = inject(Api);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  artistsSelect: Sort[] = [];

  private mode: DetailMode = DetailMode.CREATE

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

  ngOnInit() {
    this.mode = this.activatedRoute.snapshot.data['mode'];

    this.api.readAllArtist("id").subscribe(artists => {
      for (const artist of artists) {
        this.artistsSelect.push({ value: artist.id.toString(), viewValue: artist.name });
      }
    });

    if (this.mode === DetailMode.CREATE) {
      this.buttonCreateOrUpdateText.set("CREATE");
    } else {
      this.activatedRoute.params.pipe(
        switchMap(params => this.api.readSingleAlbum(params["id"]))
      ).subscribe(album => {
        this.id = album.id;

        if (album.filename != null) {
          this.api.downloadAlbumImage(this.id).subscribe(url => {
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

        this.buttonCreateOrUpdateText.set("UPDATE");
        this.isButtonDeleteDisabled.set(false);
      })
    }
  }

  uploadAlbumImage(event: any) {
    this
      .api
      .uploadAlbumImage(this.id, event.target.files[0])
      .pipe(switchMap(() => this.api.downloadAlbumImage(this.id)))
      .subscribe(url => this.image.set(url));
  }

  deleteAlbumImage() {
    this.api.deleteAlbumImage(this.id).subscribe(() => {
      this.image.set("")
      this.isButtonDeleteImageDisabled.set(true);
    });
  }

  isButtonCreateOrUpdateDisabled() {
    return this.artist() == "" || this.name().length == 0 || this.year() <= 0 || this.tracks() <= 0;
  }

  createOrUpdateAlbum() {
    if (this.mode === DetailMode.CREATE) {
      let album = new AlbumRequest();
      album.artistId = Number.parseFloat(this.artist());
      album.name = this.name();
      album.year = this.year();
      album.tracks = this.tracks();

      this.api.createAlbum(album).subscribe(album => {
        this.showSnackBar("Album successfully created.");
        this.router.navigate(['/album', album.id]);
      })
    } else {
      let album = new AlbumRequest();
      album.artistId = Number.parseFloat(this.artist());
      album.name = this.name();
      album.year = this.year();
      album.tracks = this.tracks();

      this.api.updateAlbum(this.id, album).subscribe(album => {
        this.showSnackBar("Album successfully updated.");
      })
    }
  }

  deleteAlbum() {
    this.api.deleteAlbum(this.id).subscribe(() => {
      this.showSnackBar("Album successfully deleted.");
      this.router.navigate(["/album"]);
    });
  }

  showSnackBar(message: string) {
    this.snackBar.open(message, "", { duration: 3000 });
  }
}
