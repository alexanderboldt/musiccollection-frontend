import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly storageKey = 'app.theme';

  private getMode(): Mode {
    return localStorage.getItem(this.storageKey) as Mode;
  }

  private setMode(mode: Mode) {
    document.body.classList.toggle('dark-theme', mode == Mode.DARK);
    document.body.classList.toggle('light-theme', mode == Mode.LIGHT);
    try {
      localStorage.setItem(this.storageKey, mode);
    } catch {}
  }

  initTheme() {
    this.setMode(this.getMode() ?? Mode.LIGHT);
  }

  toggle() {
    this.setMode(this.getMode() === Mode.LIGHT ? Mode.DARK : Mode.LIGHT);
  }

  isLight(): boolean {
    return this.getMode() === Mode.LIGHT;
  }
}

enum Mode {
  LIGHT = "light",
  DARK = "dark"
}
