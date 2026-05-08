import { Routes } from '@angular/router';

import { Artist } from './component/artist'
import { ArtistDetail } from './component/artist_detail'
import { Album } from './component/album'

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/artist',
    pathMatch: 'full'
  },
  {
    path: 'artist',
    component: Artist
  },
  {
    path: 'artist/:id',
    component: ArtistDetail
  },
  {
    path: 'album',
    component: Album
  }
];
