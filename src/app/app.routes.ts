import { Routes } from '@angular/router';

import { Artist } from './component/artist'
import { AlbumReadAll } from './component/album_read_all'

export const routes: Routes = [
  {
    path: 'artist',
    component: Artist
  },
  {
    path: 'album-overview',
    component: AlbumReadAll
  }
];
