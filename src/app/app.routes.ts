import { Routes } from '@angular/router';

import { Artist } from './component/artist'
import { ArtistCreate } from './component/artist_create'
import { ArtistDetail } from './component/artist_detail'
import { Album } from './component/album'
import { AlbumCreate } from './component/album_create'

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
    path: 'artist/new',
    component: ArtistCreate,
    data: { mode: 'create' }
  },
  {
    path: 'artist/:id',
    component: ArtistDetail,
    data: { mode: 'edit' }
  },
  {
    path: 'album',
    component: Album
  },
  {
    path: 'album/new',
    component: AlbumCreate
  }
];
