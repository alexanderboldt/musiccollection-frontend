import { Routes } from '@angular/router';

import { Artist } from './component/artist/artist';
import { ArtistDetail } from './component/artist/artist_detail';
import { Album } from './component/album/album';
import { AlbumDetail } from './component/album/album_detail';
import { DetailMode } from './util/detail_mode';
import { NAVIGATION } from './util/navigation';

export const routes: Routes = [
  {
    path: '',
    redirectTo: NAVIGATION.ARTIST.ROUTES.BASE,
    pathMatch: 'full'
  },
  {
    path: NAVIGATION.ARTIST.ROUTES.BASE.substring(1),
    component: Artist
  },
  {
    path: NAVIGATION.ARTIST.ROUTES.NEW.substring(1),
    component: ArtistDetail,
    data: { mode: DetailMode.CREATE }
  },
  {
    path: NAVIGATION.ARTIST.ROUTES.DETAIL.substring(1),
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
