import { EventEmitter, Injectable, OnInit, Output } from '@angular/core';
import { Subject } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Contact } from './contact.model';
import { MOCKCONTACTS } from './MOCKCONTACTS';

@Injectable({
  providedIn: 'root',
})
export class ContactService implements OnInit {
  contacts: Contact[] = [];
  maxContactId: number;
  @Output() contactSelectedEvent = new EventEmitter<Contact>();
  @Output() contactChangedEvent = new EventEmitter<Contact[]>();
  contactListChangedEvent = new Subject<Contact[]>();

  constructor(private http: HttpClient) {
    this.contacts = MOCKCONTACTS;
    this.maxContactId = this.getMaxId();
  }

  ngOnInit() {}

  getContacts() {
    return this.http.get<Contact[]>(
      'https://kjamcms-default-rtdb.firebaseio.com/contacts.json'
    );
  }

  fetchContacts() {
    // Subscribe to the Observable to handle the data
    this.getContacts().subscribe(
      (contacts: Contact[]) => {
        this.contacts = contacts;
        this.maxContactId = this.getMaxId();
        // Sort the list of contacts
        this.contacts.sort((curr, next) => {
          if (curr.id < next.id) {
            return -1;
          } else if (curr.id > next.id) {
            return 1;
          } else {
            return 0;
          }
        });
        this.contactListChangedEvent.next(this.contacts.slice());
      },
      (error: any) => {
        console.log(error);
      }
    );
  }

  storeContacts() {
    let originalContacts = JSON.stringify(this.contacts);
    const headers = new HttpHeaders({ 'content-type': 'application/json' });

    this.http
      .put(
        'https://kjamcms-default-rtdb.firebaseio.com/contacts.json',
        originalContacts,
        { headers }
      )
      .subscribe(() =>
        this.contactListChangedEvent.next(this.contacts.slice())
      );
  }

  getContact(id: string): Contact {
    for (const contact of this.contacts) {
      if (contact.id === id) {
        return contact;
      }
    }
    return null;
  }

  getMaxId(): number {
    let maxId = 0;
    this.contacts.forEach((contact) => {
      let currentId = +contact.id;
      if (currentId > maxId) {
        maxId = currentId;
      }
    });
    return maxId;
  }

  addContact(newContact: Contact) {
    if (!newContact) {
      return;
    }
    this.maxContactId++;
    newContact.id = String(this.maxContactId);
    this.contacts.push(newContact);
    let contactsListClone = this.contacts.slice();
    this.storeContacts();
  }

  updateContact(originalContact: Contact, newContact: Contact) {
    if (!originalContact || !newContact) {
      return;
    }
    let pos = this.contacts.indexOf(originalContact);
    if (pos < 0) {
      return;
    }
    newContact.id = originalContact.id;
    this.contacts[pos] = newContact;
    let contactsListClone = this.contacts.slice();
    this.storeContacts();
  }

  deleteContact(contact: Contact) {
    if (!contact) {
      return;
    }
    const pos = this.contacts.indexOf(contact);
    if (pos < 0) {
      return;
    }
    this.contacts.splice(pos, 1);
    let contactsListClone = this.contacts.slice();
    this.storeContacts();
  }
}
