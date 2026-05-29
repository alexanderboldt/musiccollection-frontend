import { MatSnackBar } from '@angular/material/snack-bar';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class Snackbar {

  constructor(private snackBar: MatSnackBar) {}

  show(message: string) {
    this.snackBar.open(message, "", { duration: 3000 });
  }
}
