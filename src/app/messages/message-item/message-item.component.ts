import { Component, Input, OnDestroy, OnInit } from '@angular/core';

import { Message } from '../message.model';
import { Contact } from '../../contacts/contact.model';
import { ContactService } from '../../contacts/contact.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'cms-message-item',
  standalone: false,

  templateUrl: './message-item.component.html',
  styleUrl: './message-item.component.css',
  providers: [ContactService],
})
export class MessageItemComponent implements OnInit {
  @Input() message: Message;
  messageSender: string;

  constructor(private contactService: ContactService) {}
  ngOnInit() {
    this.contactService.contacts$.subscribe((contacts) => {
      if (contacts.length > 0) {
        const contact: Contact | null = this.contactService.getContact(
          this.message.sender
        );
        if (contact) {
          this.messageSender = contact.name;
        } else {
          console.error('Contact not found');
        }
      } else {
        console.log('Contacts are still loading...');
      }
    });

    // Ensure contacts are fetched if they haven't been fetched yet
    if (this.contactService['contacts'].length === 0) {
      this.contactService.fetchContacts();
    }
  }
}
