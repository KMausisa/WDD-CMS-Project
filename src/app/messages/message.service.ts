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
    return this.http.get<any>('http://localhost:3000/messages');
  }

  fetchMessages() {
    // Subscribe to the Observable to handle the data
    this.getMessages().subscribe(
      (response: { data: Message[]; message: string }) => {
        this.messages = response?.data;
        this.maxMessageId = this.getMaxId();
        // Sort the list of contacts
        this.messages.sort((curr, next) => {
          if (curr.subject < next.subject) {
            return -1;
          } else if (curr.subject > next.subject) {
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
      .put('http://localhost:3000/messages', originalMessages, { headers })
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
    if (!Array.isArray(this.messages)) {
      this.messages = Array.isArray(this.messages)
        ? this.messages
        : [this.messages];
    }

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
    if (!message) {
      return;
    }

    message.id = '';

    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    this.http
      .post<{ message: Message }>('http://localhost:3000/messages', message, {
        headers: headers,
      })
      .subscribe(
        (responseData) => {
          const savedMessage = responseData.message;
          this.messages.push(savedMessage);
          this.messageListChangedEvent.next(this.messages.slice());
        },
        (err) => {
          console.log('Error adding Document: ', err);
        }
      );
  }
}
