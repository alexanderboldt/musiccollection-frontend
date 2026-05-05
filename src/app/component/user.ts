import { Component, inject, signal } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { Api } from '../api';
import Keycloak from 'keycloak-js';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'user',
  imports: [
    MatButton,
    MatIcon
  ],
  template: `
    <div id="cardUser">
      <mat-icon>account_circle</mat-icon>
      <p>{{ username() }}</p>
      <button (click)="logout()" matButton>LOGOUT</button>
    </div>
  `,
  styles: `
    #cardUser {
      padding: 16px;
      display: flex;
      flex-direction: row;
      align-items: center;
    }

    #cardUser mat-icon {
      transform: scale(2);
      margin-left: 12px;
      margin-right: 20px;
    }

    #cardUser p {
      font-size: 20px;
      margin-right: 8px;
    }
  `
})
export class User {
  protected username = signal("");

  private readonly keycloak = inject(Keycloak);
  private readonly http = inject(HttpClient);

  private api = new Api(this.http, this.keycloak);

  ngOnInit() {
    this.api.loadUsername(username => this.username.set(username));
  }

  logout() {
    this.api.logout();
  }
}
