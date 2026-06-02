import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'dialog-content-example-dialog',
  template: `
    <h2 mat-dialog-title>Delete {{ data.title }}</h2>
    <mat-dialog-content>
      Do you want to delete {{ data.name }}?
    </mat-dialog-content>
    <mat-dialog-actions>
      <button matButton [mat-dialog-close]="false">Cancel</button>
      <button matButton [mat-dialog-close]="true">Delete</button>
    </mat-dialog-actions>
  `,
  imports: [MatDialogModule, MatButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeleteDialogComponent {
  data: DeleteDialogData = inject(MAT_DIALOG_DATA);
}

export class DeleteDialogData {
  constructor(public title: string, public name: string) {
    this.title = title;
    this.name = name;
  }
}
