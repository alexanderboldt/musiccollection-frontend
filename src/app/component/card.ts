import { Component, input, output } from '@angular/core';
import { MatCard, MatCardActions, MatCardContent, MatCardHeader, MatCardTitle, MatCardSubtitle } from '@angular/material/card';
import { MatButton} from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'card',
  imports: [
    MatButton,
    MatCard,
    FormsModule,
    MatCardActions,
    MatCardContent,
    MatCardHeader,
    MatCardTitle,
    MatCardSubtitle,
    RouterLink
  ],
  template: `
    <mat-card appearance="filled">
      <mat-card-content routerLink="{{ detailRoute() }}">
        @if (image() != null) {
          <img [src]="image()" alt="Image">
        } @else {
          <img src="/placeholder.svg" alt="Placeholder Image">
        }
      </mat-card-content>
      <mat-card-header>
        <mat-card-title>{{ title() }}</mat-card-title>
        <mat-card-subtitle>{{ subtitle() }}</mat-card-subtitle>
      </mat-card-header>
      <mat-card-actions>
        <button type="button" (click)="fileInput.click()" matButton>SET IMAGE</button>
        <input type="file" id="file" hidden (change)="onUploadImage($event)" #fileInput>

        <button (click)="onDeleteImage()" matButton>DELETE IMAGE</button>
        <button (click)="onDelete()" matButton>DELETE</button>
      </mat-card-actions>
    </mat-card>
`,
  styles: `
    mat-card-content {
      width: 100%;
      height: 250px;
      cursor: pointer;
    }

    img {
      width: 90%;
      height: 100%;
      object-fit: cover;
      border-radius: var(--mat-sys-corner-medium);
    }
  `
})
export class Card {
  detailRoute = input.required<string>();
  image = input.required<string | null>();
  title = input.required<string>();
  subtitle = input<string>();

  uploadImage = output<any>();
  deleteImage = output<void>();
  delete = output<void>();

  onUploadImage(event: any) {
    this.uploadImage.emit(event);
  }

  onDeleteImage() {
    this.deleteImage.emit();
  }

  onDelete() {
    this.delete.emit();
  }
}
