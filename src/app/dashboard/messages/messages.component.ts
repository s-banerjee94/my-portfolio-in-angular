import { DatePipe } from '@angular/common';
import {
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';

import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { SelectButtonModule } from 'primeng/selectbutton';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';

import { ContactMeService, Message } from '@core/services/contact-me.service';
import { SectionHeaderComponent } from '@shared/section-header.component';

type ReadFilter = 'all' | 'unread' | 'read';

@Component({
  selector: 'app-messages',
  imports: [
    DatePipe,
    FormsModule,
    TableModule,
    ButtonModule,
    ToastModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    SelectButtonModule,
    TagModule,
    TooltipModule,
    SectionHeaderComponent,
  ],
  templateUrl: './messages.component.html',
  styleUrl: './messages.component.css',
  providers: [MessageService],
})
export class MessagesComponent implements OnInit {
  private messageService = inject(MessageService);
  private contactService = inject(ContactMeService);
  private destroyRef = inject(DestroyRef);

  protected readonly messages = signal<Message[]>([]);
  protected readonly searchTerm = signal('');
  protected readonly readFilter = signal<ReadFilter>('all');

  protected readonly filterOptions: { label: string; value: ReadFilter }[] = [
    { label: 'All', value: 'all' },
    { label: 'Unread', value: 'unread' },
    { label: 'Read', value: 'read' },
  ];

  protected readonly unreadCount = computed(
    () => this.messages().filter((m) => !m.read).length,
  );

  // Search + read-state filtering happen client-side over the one live
  // Firestore subscription — no re-query per filter click.
  protected readonly filtered = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const filter = this.readFilter();
    return this.messages().filter((m) => {
      if (filter === 'unread' && m.read) return false;
      if (filter === 'read' && !m.read) return false;
      if (!term) return true;
      return [m.name, m.email, m.subject, m.message].some((field) =>
        field.toLowerCase().includes(term),
      );
    });
  });

  ngOnInit() {
    this.contactService
      .getAllMessages()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => this.messages.set(data as Message[]),
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load messages',
          });
        },
      });
  }

  toggleRead(message: Message) {
    if (!message.id) {
      return;
    }
    // The live collection subscription picks the change back up, so no
    // local mutation is needed here.
    this.contactService
      .updateMessageStatus(message.id, !message.read)
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: message.read ? 'Marked as unread' : 'Marked as read',
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

  delete(message: Message) {
    if (!message.id) {
      return;
    }
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
