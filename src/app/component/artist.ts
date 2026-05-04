import { Component, signal } from '@angular/core';
import { ArtistCreate } from './artist_create';
import { ArtistReadAll } from './artist_read_all';

@Component({
  selector: 'artist',
  imports: [
    ArtistCreate,
    ArtistReadAll
  ],
  template: `
    <artist-create (created)="artistCreated()" />
    <artist-read-all [reloadArtists]="reloadArtists()" />
  `
})
export class Artist {
  reloadArtists = signal(false)

  artistCreated() {
    this.reloadArtists.update(value => !value)
  }
}
