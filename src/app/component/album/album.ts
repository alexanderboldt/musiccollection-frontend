import { Component, signal } from '@angular/core';
import { AlbumReadAll } from './album_read_all';

@Component({
  selector: 'album',
  imports: [
    AlbumReadAll
  ],
  template: `
    <h2>Overview</h2>
    <album-read-all [reloadAlbums]="reloadAlbums()" />
  `,
  styles: `
    h2 {
      color: var(--mat-sys-primary);
    }
  `
})
export class Album {
  reloadAlbums = signal(false);

  albumCreated() {
    this.reloadAlbums.update(value => !value);
  }
}
