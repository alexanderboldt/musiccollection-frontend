import { Component, signal, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import Keycloak from 'keycloak-js';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('musiccollection-frontend');

  private readonly keycloak = inject(Keycloak);

  ngOnInit() {
    this.keycloak.loadUserProfile().then(profile => {
      this.title.set(profile.firstName ?? "anonymous");
    });
  }
}
