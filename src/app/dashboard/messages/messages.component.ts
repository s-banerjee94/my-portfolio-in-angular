import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';

import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { CardModule } from 'primeng/card';
import { MessageService } from 'primeng/api';

import { LucideAngularModule, Check, X, Trash2 } from 'lucide-angular';

import { HeaderComponent } from '../header/header.component';
import { ContaceMeService, Message } from '../../services/contace-me.service';

@Component({
  selector: 'app-messages',
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    ToastModule,
    CardModule,
    LucideAngularModule,
    HeaderComponent,
  ],
  templateUrl: './messages.component.html',
  styleUrl: './messages.component.css',
  providers: [MessageService],
})
export class MessagesComponent implements OnInit {
  readonly Check = Check;
  readonly X = X;
  readonly Trash2 = Trash2;
  messages: Message[] = [];

  isMobile: boolean = false;

  private contactService: ContaceMeService = inject(ContaceMeService);

  constructor(private messageService: MessageService) {}

  ngOnInit() {
    this.contactService.getAllMessages().subscribe((data) => {
      this.messages = data as Message[];
      console.log(this.messages);
    });
  }

  read(message: Message) {
    if (message.id) {
      this.contactService
        .updateMessageStatus(message.id, !message.read)
        .subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Message status updated successfully',
            });
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to update message status',
            });
          },
        });
    }
  }

  delete(message: Message) {
    if (message.id) {
      this.contactService.deleteMessage(message.id).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Message deleted successfully',
          });
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to delete message',
          });
        },
      });
    }
  }
}
