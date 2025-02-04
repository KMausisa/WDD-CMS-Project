import {
  Component,
  ViewChild,
  ElementRef,
  Output,
  EventEmitter,
  OnInit,
} from '@angular/core';

import { Message } from '../message.model';
import { MessageService } from '../message.service';

@Component({
  selector: 'cms-message-edit',
  standalone: false,

  templateUrl: './message-edit.component.html',
  styleUrl: './message-edit.component.css',
})
export class MessageEditComponent implements OnInit {
  @ViewChild('subject', { static: false }) subjectRef: ElementRef;
  @ViewChild('msgText', { static: false }) msgTextRef: ElementRef;
  @Output() addMessageEvent = new EventEmitter<Message>();
  currentSender: string = '1';

  constructor(private messageService: MessageService) {}

  ngOnInit(): void {}

  onSendMessage() {
    // grab the value stored in the subject input
    const subject = this.subjectRef.nativeElement.value;
    // grab the value stored in the msgText input
    const msgText = this.msgTextRef.nativeElement.value;
    const newMessage = new Message('99', subject, msgText, this.currentSender);
    this.messageService.addMessage(newMessage);
  }

  onClear() {}
}
