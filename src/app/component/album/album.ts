import { Component } from '@angular/core';
import { AlbumReadAll } from './album_read_all';

@Component({
  selector: 'album',
  imports: [
    AlbumReadAll
  ],
  template: `
    <h2>Albums</h2>
    <album-read-all />
  `,
  styles: `
    h2 {
      color: var(--mat-sys-primary);
    }
  `
})
export class Album {}
