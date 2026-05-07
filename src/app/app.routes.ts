import { Routes } from '@angular/router';

import { Artist } from './component/artist'
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
    path: 'album',
    component: Album
  }
];
