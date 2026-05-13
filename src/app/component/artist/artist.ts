import { Component } from '@angular/core';
import { ArtistReadAll } from './artist_read_all';

@Component({
  selector: 'artist',
  imports: [
    ArtistReadAll
  ],
  template: `
    <h2>Artists</h2>
    <artist-read-all />
  `,
  styles: `
    h2 {
      color: var(--mat-sys-primary);
    }
  `
})
export class Artist {}
