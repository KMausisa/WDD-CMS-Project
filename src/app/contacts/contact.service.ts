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
  contacts$ = this.contactListChangedEvent.asObservable();

  constructor(private http: HttpClient) {
    this.maxContactId = this.getMaxId();
  }

  ngOnInit() {}

  getContacts() {
    return this.http.get<any>('http://localhost:3000/contacts');
  }

  fetchContacts() {
    // Subscribe to the Observable to handle the data
    this.getContacts().subscribe(
      (response: { data: Contact[]; message: string }) => {
        this.contacts = response?.data;
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
      .put('http://localhost:3000/contacts', originalContacts, { headers })
      .subscribe(() =>
        this.contactListChangedEvent.next(this.contacts.slice())
      );
  }

  getContact(id: string): Contact | null {
    const contact = this.contacts.find((contact) => contact.id === id);
    return contact || null;
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

    newContact.id = '';

    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    // add to database
    this.http
      .post<{ message: Contact }>(
        'http://localhost:3000/contacts',
        newContact,
        {
          headers: headers,
        }
      )
      .subscribe(
        (responseData) => {
          const savedContact = responseData.message;
          // add new document to documents
          this.contacts.push(savedContact);
          this.contactListChangedEvent.next(this.contacts.slice());
        },
        (err) => {
          console.log('Error adding Document: ', err);
        }
      );
  }

  updateContact(originalContact: Contact, newContact: Contact) {
    if (!originalContact || !newContact) {
      return;
    }
    const pos = this.contacts.findIndex((d) => d.id === originalContact.id);

    if (pos < 0) {
      return;
    }
    newContact.id = originalContact.id;
    // newDocument._id = originalDocument._id;

    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    // update database
    this.http
      .put('http://localhost:3000/contacts/' + originalContact.id, newContact, {
        headers: headers,
      })
      .subscribe((response: Response) => {
        this.contacts[pos] = newContact;
        this.contactListChangedEvent.next(this.contacts.slice());
      });
  }

  deleteContact(contact: Contact) {
    if (!contact) {
      return;
    }
    const pos = this.contacts.findIndex((d) => d.id === contact.id);

    if (pos < 0) {
      return;
    }

    // delete from database
    this.http
      .delete('http://localhost:3000/contacts/' + contact.id)
      .subscribe((response: Response) => {
        this.contacts.splice(pos, 1);
        this.contactListChangedEvent.next(this.contacts.slice());
      });
  }
}
