import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { Message } from '../message.model';
import { MessageService } from '../message.service';

@Component({
  selector: 'cms-message-list',
  standalone: false,

  templateUrl: './message-list.component.html',
  styleUrl: './message-list.component.css',
})
export class MessageListComponent implements OnInit, OnDestroy {
  messages: Message[] = [];
  messageSubscription: Subscription;

  constructor(private messageService: MessageService) {}

  ngOnInit() {
    this.messageService.fetchMessages();
    this.messageService.messageChangedEvent.subscribe(
      (messages: Message[]) => (this.messages = messages)
    );
    this.messageSubscription =
      this.messageService.messageListChangedEvent.subscribe(
        (messageList: Message[]) => (this.messages = messageList)
      );
  }

  // Adds a new message to the array messages
  onAddMessage(message: Message) {
    this.messages.push(message);
  }

  ngOnDestroy(): void {
    this.messageSubscription.unsubscribe();
  }
}
