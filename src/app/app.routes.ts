import { Routes } from '@angular/router';

import { Artist } from './component/artist/artist';
import { ArtistDetail } from './component/artist/artist_detail';
import { Album } from './component/album/album';
import { AlbumDetail } from './component/album/album_detail';
import { DetailMode } from './util/detail_mode';

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
    component: ArtistDetail,
    data: { mode: DetailMode.CREATE }
  },
  {
    path: 'artist/:id',
    component: ArtistDetail,
    data: { mode: DetailMode.EDIT }
  },
  {
    path: 'album',
    component: Album
  },
  {
    path: 'album/new',
    component: AlbumDetail,
    data: { mode: DetailMode.CREATE }
  },
  {
    path: 'album/:id',
    component: AlbumDetail,
    data: { mode: DetailMode.EDIT }
  }
];
