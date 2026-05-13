import {MatSnackBar} from '@angular/material/snack-bar';
import {Injectable} from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SnackBarUtils {

  constructor(private snackBar: MatSnackBar) {}

  show(message: string) {
    this.snackBar.open(message, "", { duration: 3000 });
  }
}
