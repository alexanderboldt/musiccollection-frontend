import { Component, signal } from '@angular/core';
import { ArtistReadAll } from './artist_read_all';

@Component({
  selector: 'artist',
  imports: [
    ArtistReadAll
  ],
  template: `
    <h2>Overview</h2>
    <artist-read-all [reloadArtists]="reloadArtists()" />
  `,
  styles: `
    h2 {
      color: var(--mat-sys-primary);
    }
  `
})
export class Artist {
  reloadArtists = signal(false);

  artistCreated() {
    this.reloadArtists.update(value => !value);
  }
}
