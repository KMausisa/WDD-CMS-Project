import { Injectable, Output, EventEmitter, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Subject } from 'rxjs';

import { Document } from './document.model';
import { MOCKDOCUMENTS } from './MOCKDOCUMENTS';
import { response } from 'express';

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
    return this.http.get<any>('http://localhost:3000/documents');
  }

  fetchDocuments() {
    // Subscribe to the Observable to handle the data
    this.getDocuments().subscribe(
      (response: { data: Document[]; message: string }) => {
        this.documents = response?.data;
        this.maxDocumentId = this.getMaxId();
        // Sort the list of documents
        this.documents.sort((curr, next) => {
          if (curr.name < next.name) {
            return -1;
          } else if (curr.name > next.name) {
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
      .put('http://localhost:3000/documents', originalDocuments, { headers })
      .subscribe(() =>
        this.documentListChangedEvent.next(this.documents.slice())
      );
  }

  getDocumentId(id: string): Document | null {
    return this.documents.find((document) => document.id === id) || null;
  }

  getMaxId(): number {
    // Check if documents is an array. If not, perform logic to make it an array
    if (!Array.isArray(this.documents)) {
      this.documents = Array.isArray(this.documents)
        ? this.documents
        : [this.documents];
    }

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

    // make sure id of the new Document is empty
    newDocument.id = '';

    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    // add to database
    this.http
      .post<{ message: string; document: Document }>(
        'http://localhost:3000/documents',
        newDocument,
        { headers: headers }
      )
      .subscribe(
        (responseData) => {
          const savedDocument = responseData.document;
          // add new document to documents
          this.documents.push(savedDocument);
          this.documentListChangedEvent.next(this.documents.slice());
        },
        (err) => {
          console.log('Error adding Document: ', err);
        }
      );
  }

  updateDocument(originalDocument: Document, newDocument: Document) {
    if (!originalDocument || !newDocument) {
      return;
    }

    const pos = this.documents.findIndex((d) => d.id === originalDocument.id);

    if (pos < 0) {
      return;
    }

    // set the id of the new Document to the id of the old Document
    newDocument.id = originalDocument.id;
    // newDocument._id = originalDocument._id;

    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    // update database
    this.http
      .put(
        'http://localhost:3000/documents/' + originalDocument.id,
        newDocument,
        { headers: headers }
      )
      .subscribe((response: Response) => {
        this.documents[pos] = newDocument;
        this.documentListChangedEvent.next(this.documents.slice());
      });
  }

  deleteDocument(document: Document) {
    if (!document) {
      return;
    }

    const pos = this.documents.findIndex((d) => d.id === document.id);

    if (pos < 0) {
      return;
    }

    // delete from database
    this.http
      .delete('http://localhost:3000/documents/' + document.id)
      .subscribe((response: Response) => {
        this.documents.splice(pos, 1);
        this.documentListChangedEvent.next(this.documents.slice());
      });
  }
}
