import {HttpClient, HttpHeaders} from "@angular/common/http";
import Keycloak from 'keycloak-js';
import { map, Observable } from 'rxjs';

export class Api {
  private baseUrl = "http://localhost:4000";
  private artistUrl = `${this.baseUrl}/api/v1/artists`;
  private albumUrl = `${this.baseUrl}/api/v1/albums`;

  private readonly headers: HttpHeaders

  constructor(private http: HttpClient, private keycloak: Keycloak) {
    this.headers = new HttpHeaders({
      'Access-Control-Allow-Origin': '*', 'Content-type': 'application/json', 'Authorization': `Bearer ${this.keycloak.token}`
    })
  }

  // user routes

  loadUsername(block: (username: string) => (void)) {
    this.keycloak.loadUserProfile().then(profile => {
      block(`${profile.firstName} ${profile.lastName}`)
    });
  }

  logout() {
    this.keycloak.logout({ redirectUri: window.location.origin });
  }

  // artist routes

  createArtist(name: string): Observable<Artist> {
    return this.http.post<Artist>(this.artistUrl, { name: name }, { headers: this.headers })
  }

  readAllArtist(sort: string): Observable<Array<Artist>> {
    return this.http.get<Array<Artist>>(this.artistUrl, { headers: this.headers, params: { sort: sort } });
  }

  deleteArtist(id: number): Observable<any> {
    return this.http.delete(this.artistUrl + `/${id}`, { headers: this.headers });
  }

  downloadArtistImage(id: number) : Observable<string> {
    return this.http
      .get(this.artistUrl + `/${id}/images`, { headers: this.headers,  responseType: 'blob'})
      .pipe(map(data => URL.createObjectURL(data)));
  }

  // album routes

  readAllAlbums(sort: string): Observable<Array<Artist>> {
    return this.http.get<Array<Artist>>(this.albumUrl, { headers: this.headers, params: { sort: sort } });
  }

  deleteAlbum(id: number): Observable<any> {
    return this.http.delete(this.albumUrl + `/${id}`, { headers: this.headers });
  }

  downloadAlbumImage(id: number) : Observable<string> {
    return this.http
      .get(this.albumUrl + `/${id}/images`, { headers: this.headers,  responseType: 'blob'})
      .pipe(map(data => URL.createObjectURL(data)));
  }
}
