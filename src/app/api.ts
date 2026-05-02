import {HttpClient, HttpHeaders} from "@angular/common/http";
import Keycloak from 'keycloak-js';
import { map, Observable } from 'rxjs';

export class Api {
  private baseUrl = "http://localhost:4000";
  private resourceUrl = `${this.baseUrl}/api/v1/artists`;

  private readonly headers: HttpHeaders

  constructor(private http: HttpClient, private keycloak: Keycloak) {
    this.headers = new HttpHeaders({
      'Access-Control-Allow-Origin': '*', 'Content-type': 'application/json', 'Authorization': `Bearer ${this.keycloak.token}`
    })
  }

  loadUsername(block: (username: string) => (void)) {
    this.keycloak.loadUserProfile().then(profile => {
      block(`${profile.firstName} ${profile.lastName}`)
    });
  }

  logout() {
    this.keycloak.logout({ redirectUri: window.location.origin });
  }

  readAllArtist(): Observable<Array<Artist>> {
    return this.http.get<Array<Artist>>(this.resourceUrl, { headers: this.headers });
  }

  deleteArtist(id: number): Observable<any> {
    return this.http.delete(this.resourceUrl + `/${id}`, { headers: this.headers });
  }

  downloadArtistImage(id: number) : Observable<string> {
    return this.http
      .get(this.resourceUrl + `/${id}/images`, { headers: this.headers,  responseType: 'blob'})
      .pipe(map(data => URL.createObjectURL(data)));;
  }
}
