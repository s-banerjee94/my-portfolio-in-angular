import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { InputTextModule } from 'primeng/inputtext';
import { FloatLabel } from 'primeng/floatlabel';
import { TextareaModule } from 'primeng/textarea';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-heor',
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    FloatLabel,
    TextareaModule,
    ToastModule,
    CardModule,
    ButtonModule,
  ],
  templateUrl: './heor.component.html',
  styleUrl: './heor.component.css',
  providers: [MessageService],
})
export class HeorComponent {
  heroName = '';
  professionalTitle = '';
  description = '';
  statusBadge = '';

  uploadedFiles: any[] = [];

  constructor(private messageService: MessageService) {}

  onUpload(event: { files: any }) {
    for (let file of event.files) {
      this.uploadedFiles.push(file);
    }

    this.messageService.add({
      severity: 'info',
      summary: 'File Uploaded',
      detail: '',
    });
  }

  saveHeroDetails(): void {
    console.log('Hero Name:', this.heroName);
    console.log('Professional Title:', this.professionalTitle);
    console.log('Description:', this.description);
    console.log('Status Badge:', this.statusBadge);
  }
}
