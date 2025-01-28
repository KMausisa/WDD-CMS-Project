import { Component, OnInit, Output, EventEmitter } from '@angular/core';

import { Document } from '../document.model';

@Component({
  selector: 'cms-document-list',
  standalone: false,

  templateUrl: './document-list.component.html',
  styleUrl: './document-list.component.css',
})
export class DocumentListComponent implements OnInit {
  @Output() selectedDocumentEvent = new EventEmitter<Document>();

  documents: Document[] = [
    new Document(
      '1',
      'Kendrick Mausisa',
      'BYU-Idaho Student',
      'http://example.com/',
      []
    ),
    new Document(
      '2',
      'Kevyn Mausisa',
      'Full-time Missionary',
      'http://example.com/',
      []
    ),
    new Document(
      '3',
      'Rhianne Mausisa',
      'Highschool Student',
      'http://example.com/',
      []
    ),
    new Document(
      '4',
      'Richyl Mausisa',
      'Middle School Student',
      'http://example.com/',
      []
    ),
    new Document(
      '5',
      'Richard Mausisa',
      'Hertz Employee',
      'http://example.com/',
      []
    ),
  ];

  constructor() {}

  ngOnInit(): void {}

  onSelectedDocument(document: Document) {
    this.selectedDocumentEvent.emit(document);
  }
}
