import { Component, signal } from '@angular/core';
import { AlbumCreate } from './album_create';
import { AlbumReadAll } from './album_read_all';
import { MatDivider } from '@angular/material/list';

@Component({
  selector: 'album',
  imports: [
    AlbumCreate,
    AlbumReadAll,
    MatDivider
  ],
  template: `
    <h2>Album</h2>
    <mat-divider />
    <album-create (created)="albumCreated()" />
    <mat-divider />
    <album-read-all [reloadAlbums]="reloadAlbums()" />
  `,
  styles: `
    h2 {
      color: var(--mat-sys-primary);
    }
  `
})
export class Album {
  reloadAlbums = signal(false)

  albumCreated() {
    this.reloadAlbums.update(value => !value)
  }
}
