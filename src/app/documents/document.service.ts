import { Injectable, Output, EventEmitter, OnInit } from '@angular/core';
import { Document } from './document.model';
import { MOCKDOCUMENTS } from './MOCKDOCUMENTS';

@Injectable({
  providedIn: 'root',
})
export class DocumentService implements OnInit {
  documents: Document[];
  @Output() documentSelectedEvent = new EventEmitter<Document>();
  @Output() documentChangedEvent = new EventEmitter<Document[]>();

  constructor() {
    this.documents = MOCKDOCUMENTS;
    console.log(this.documents);
  }

  ngOnInit(): void {}

  getDocuments(): Document[] {
    return this.documents.slice();
  }

  getDocumentId(id: string): Document | null {
    return this.documents.find((document) => document.id === id) || null;
  }

  deleteDocument(document: Document) {
    console.log(document);
    if (!document) {
      return;
    }
    const pos = this.documents.indexOf(document);
    if (pos < 0) {
      return;
    }
    this.documents.splice(pos, 1);
    this.documentChangedEvent.emit(this.documents.slice());
  }
}
