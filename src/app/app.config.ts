import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { environment } from './environment/environment';

import { routes } from './app.routes';
import { provideKeycloak } from 'keycloak-angular';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideKeycloak({
      config: {
        url: environment.keycloakUrl,
        realm: 'musiccollection',
        clientId: 'musiccollection-client'
      },
      initOptions: {
        onLoad: 'login-required',
        pkceMethod: 'S256'
      }
    })
  ]
};
