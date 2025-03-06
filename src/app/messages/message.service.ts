import { EventEmitter, Injectable, Output } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Subject } from 'rxjs';

import { Message } from './message.model';
import { MOCKMESSAGES } from './MOCKMESSAGES';

@Injectable({
  providedIn: 'root',
})
export class MessageService {
  messages: Message[] = [];
  maxMessageId: number;
  @Output() messageChangedEvent = new EventEmitter<Message[]>();
  messageListChangedEvent = new Subject<Message[]>();

  constructor(private http: HttpClient) {
    this.messages = MOCKMESSAGES;
    this.maxMessageId = this.getMaxId();
  }

  getMessages() {
    return this.http.get<Message[]>(
      'https://kjamcms-default-rtdb.firebaseio.com/messages.json'
    );
  }

  fetchMessages() {
    // Subscribe to the Observable to handle the data
    this.getMessages().subscribe(
      (messages: Message[]) => {
        this.messages = messages;
        this.maxMessageId = this.getMaxId();
        // Sort the list of contacts
        this.messages.sort((curr, next) => {
          if (curr.id < next.id) {
            return -1;
          } else if (curr.id > next.id) {
            return 1;
          } else {
            return 0;
          }
        });
        this.messageListChangedEvent.next(this.messages.slice());
      },
      (error: any) => {
        console.log(error);
      }
    );
  }

  storeMessages() {
    let originalMessages = JSON.stringify(this.messages);
    const headers = new HttpHeaders({ 'content-type': 'application/json' });

    this.http
      .put(
        'https://kjamcms-default-rtdb.firebaseio.com/messages.json',
        originalMessages,
        { headers }
      )
      .subscribe(() =>
        this.messageListChangedEvent.next(this.messages.slice())
      );
  }

  getMessageId(id: string): Message {
    for (const message of this.messages) {
      if (message.id === id) {
        return message;
      }
    }
    return null;
  }

  getMaxId(): number {
    let maxId = 0;
    this.messages.forEach((message) => {
      let currentId = +message.id;
      if (currentId > maxId) {
        maxId = currentId;
      }
    });
    return maxId;
  }

  addMessage(message: Message) {
    this.messages.push(message);
    this.storeMessages();
  }
}
