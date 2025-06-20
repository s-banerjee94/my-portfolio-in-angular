import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, ViewChild } from '@angular/core';

import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { CardModule } from 'primeng/card';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { FloatLabel } from 'primeng/floatlabel';
import { Popover, PopoverModule } from 'primeng/popover';
import { InputText } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';

import {
  LucideAngularModule,
  Check,
  X,
  Trash2,
  Search,
  Inbox,
} from 'lucide-angular';

import { ContaceMeService, Message } from '../../services/contace-me.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-messages',
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    ToastModule,
    CardModule,
    InputGroupModule,
    InputGroupAddonModule,
    FloatLabel,
    InputText,
    PopoverModule,
    LucideAngularModule,
  ],
  templateUrl: './messages.component.html',
  styleUrl: './messages.component.css',
  providers: [MessageService],
})
export class MessagesComponent implements OnInit {
  readonly Check = Check;
  readonly X = X;
  readonly Trash2 = Trash2;
  readonly Search = Search;
  readonly Inbox = Inbox;

  messages: Message[] = [];
  isMobile: boolean = false;
  selectedFilter: any = null;
  filters = [
    { name: 'All', value: null },
    { name: 'Read', value: true },
    { name: 'Unread', value: false },
  ];

  @ViewChild('filterPopover') filterPopover!: Popover;

  private contactService: ContaceMeService = inject(ContaceMeService);

  constructor(private messageService: MessageService) {}

  ngOnInit() {
    this.selectFilter(this.selectedFilter || null);
  }

  toggle(event: MouseEvent) {
    this.filterPopover.toggle(event);
  }

  selectFilter(filter: any) {
    this.selectedFilter = filter;
    if (!this.selectedFilter || filter.value === null) {
      this.contactService
        .getAllMessages()
        .pipe(take(1))
        .subscribe((data) => {
          this.messages = data as Message[];
        });
    } else {
      this.contactService
        .getMessageByFilter(filter.value)
        .pipe(take(1))
        .subscribe((data) => {
          this.messages = data as Message[];
        });
    }
    if (this.filterPopover) {
      this.filterPopover.hide();
    }
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
            message.read = !message.read;
            if (
              this.selectedFilter.value !== null &&
              message.read !== this.selectedFilter.value
            ) {
              this.messages = this.messages.filter((m) => m.id !== message.id);
            }
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
          this.messages = this.messages.filter((m) => m.id !== message.id);
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
