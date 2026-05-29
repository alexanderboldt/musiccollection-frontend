import { Routes } from '@angular/router';

import { ArtistOverview } from './component/artist/artist.overview';
import { ArtistDetail } from './component/artist/artist.detail';
import { AlbumOverview } from './component/album/album.overview';
import { AlbumDetail } from './component/album/album.detail';
import { DetailMode } from './util/detail.mode';
import { NAVIGATION } from './util/navigation';

export const routes: Routes = [
  {
    path: '',
    redirectTo: NAVIGATION.ARTIST.ROUTES.BASE,
    pathMatch: 'full'
  },
  {
    path: NAVIGATION.ARTIST.ROUTES.BASE.substring(1),
    component: ArtistOverview
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
    path: NAVIGATION.ALBUM.ROUTES.BASE.substring(1),
    component: AlbumOverview
  },
  {
    path: NAVIGATION.ALBUM.ROUTES.NEW.substring(1),
    component: AlbumDetail,
    data: { mode: DetailMode.CREATE }
  },
  {
    path: NAVIGATION.ALBUM.ROUTES.DETAIL.substring(1),
    component: AlbumDetail,
    data: { mode: DetailMode.EDIT }
  }
];
