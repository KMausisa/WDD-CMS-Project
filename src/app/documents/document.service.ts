import { Injectable, Output, EventEmitter, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Subject } from 'rxjs';

import { Document } from './document.model';
import { MOCKDOCUMENTS } from './MOCKDOCUMENTS';

@Injectable({
  providedIn: 'root',
})
export class DocumentService implements OnInit {
  documents: Document[] = [];
  maxDocumentId: number;
  @Output() documentSelectedEvent = new EventEmitter<Document>();
  @Output() documentChangedEvent = new EventEmitter<Document[]>();
  documentListChangedEvent = new Subject<Document[]>();

  constructor(private http: HttpClient) {
    this.documents = MOCKDOCUMENTS;
    this.maxDocumentId = this.getMaxId();
  }

  ngOnInit(): void {}

  getDocuments() {
    return this.http.get<Document[]>(
      'https://kjamcms-default-rtdb.firebaseio.com/documents.json'
    );
  }

  fetchDocuments() {
    // Subscribe to the Observable to handle the data
    this.getDocuments().subscribe(
      (documents: Document[]) => {
        this.documents = documents;
        this.maxDocumentId = this.getMaxId();
        // Sort the list of documents
        this.documents.sort((curr, next) => {
          if (curr.id < next.id) {
            return -1;
          } else if (curr.id > next.id) {
            return 1;
          } else {
            return 0;
          }
        });
        this.documentListChangedEvent.next(this.documents.slice());
      },
      (error: any) => {
        console.log(error);
      }
    );
  }

  storeDocuments() {
    let originalDocuments = JSON.stringify(this.documents);
    const headers = new HttpHeaders({ 'content-type': 'application/json' });

    this.http
      .put(
        'https://kjamcms-default-rtdb.firebaseio.com/documents.json',
        originalDocuments,
        { headers }
      )
      .subscribe(() =>
        this.documentListChangedEvent.next(this.documents.slice())
      );
  }

  getDocumentId(id: string): Document | null {
    return this.documents.find((document) => document.id === id) || null;
  }

  getMaxId(): number {
    let maxId = 0;
    this.documents.forEach((document) => {
      let currentId = +document.id;
      if (currentId > maxId) {
        maxId = currentId;
      }
    });
    return maxId;
  }

  addDocument(newDocument: Document) {
    if (!newDocument) {
      return;
    }
    this.maxDocumentId++;
    newDocument.id = String(this.maxDocumentId);
    this.documents.push(newDocument);
    let documentsListClone = this.documents.slice();
    this.storeDocuments();
  }

  updateDocument(originalDocument: Document, newDocument: Document) {
    if (!originalDocument || !newDocument) {
      return;
    }
    let pos = this.documents.indexOf(originalDocument);
    if (pos < 0) {
      return;
    }
    newDocument.id = originalDocument.id;
    this.documents[pos] = newDocument;
    let documentsListClone = this.documents.slice();
    this.storeDocuments();
  }

  deleteDocument(document: Document) {
    if (!document) {
      return;
    }
    const pos = this.documents.indexOf(document);
    if (pos < 0) {
      return;
    }
    this.documents.splice(pos, 1);
    let documentsListClone = this.documents.slice();
    this.storeDocuments();
  }
}
