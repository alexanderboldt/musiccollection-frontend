import { Component, signal } from '@angular/core';
import { ArtistCreate } from './artist_create';
import { ArtistReadAll } from './artist_read_all';
import { MatDivider } from '@angular/material/list';

@Component({
  selector: 'artist',
  imports: [
    ArtistCreate,
    ArtistReadAll,
    MatDivider
  ],
  template: `
    <h2>Artist</h2>
    <mat-divider />
    <artist-create (created)="artistCreated()" />
    <mat-divider />
    <artist-read-all [reloadArtists]="reloadArtists()" />
  `,
  styles: `
    h2 {
      color: var(--mat-sys-primary);
    }
  `
})
export class Artist {
  reloadArtists = signal(false)

  artistCreated() {
    this.reloadArtists.update(value => !value)
  }
}
