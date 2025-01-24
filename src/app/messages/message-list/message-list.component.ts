import { Component, OnInit } from '@angular/core';

import { Message } from '../message.model';

@Component({
  selector: 'cms-message-list',
  standalone: false,

  templateUrl: './message-list.component.html',
  styleUrl: './message-list.component.css',
})
export class MessageListComponent implements OnInit {
  messages: Message[] = [
    new Message('01', 'Math', 'This is about Math', 'Kendrick'),
    new Message('02', 'Science', 'This is about Science', 'Kevyn'),
    new Message('02', 'Art', 'This is about Art', 'Rhianne'),
  ];

  ngOnInit(): void {}

  // Adds a new message to the array messages
  onAddMessage(message: Message) {
    this.messages.push(message);
  }
}
