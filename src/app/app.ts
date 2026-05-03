import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { User } from './component/user';
import { ArtistCreate } from './component/artist_create';
import { ArtistReadAll } from './component/artist_read_all';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    FormsModule,
    User,
    ArtistCreate,
    ArtistReadAll
  ],
  template: `
    <div id="content">
      <user />
      <h1>Music Collection</h1>
      <artist-create (created)="artistCreated()" />
      <artist-read-all [reloadArtists]="reloadArtists()" />
    </div>
  `,
  styles: `
    #content {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin: 36px
    }

    h1 {
      color: var(--mat-sys-primary);
    }
  `
})
export class App {
  reloadArtists = signal(false)

  artistCreated() {
    this.reloadArtists.update(value => !value)
  }
}
