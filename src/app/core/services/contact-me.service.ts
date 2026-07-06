import { inject, Injectable } from '@angular/core';
import {
  addDoc,
  collection,
  collectionData,
  deleteDoc,
  doc,
  Firestore,
  orderBy,
  query,
  setDoc,
  where,
} from '@angular/fire/firestore';
import { from } from 'rxjs';

export interface Message {
  id?: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  timestamp?: number;
  read?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ContaceMeService {
  private firestore = inject(Firestore);
  readonly collectionName: string = 'messages';

  constructor() {}

  saveMessage(message: Message) {
    const contactRef = collection(this.firestore, this.collectionName);
    message.timestamp = Date.now();
    message.read = false;
    return from(
      addDoc(contactRef, message).then((data) => {
        return data;
      }),
    );
  }

  getAllMessages() {
    const messagesRef = collection(this.firestore, this.collectionName);
    const q = query(messagesRef, orderBy('timestamp', 'desc'));
    return from(collectionData(q, { idField: 'id' }));
  }

  getMessageByFilter(filter: boolean) {
    const messagesRef = collection(this.firestore, this.collectionName);
    const q = query(messagesRef, where('read', '==', filter));
    return from(collectionData(q, { idField: 'id' }));
  }

  updateMessageStatus(messageId: string, status: boolean) {
    const messageRef = doc(
      this.firestore,
      `${this.collectionName}/${messageId}`,
    );
    return from(
      setDoc(messageRef, { read: status }, { merge: true }).then(() => {
        return;
      }),
    );
  }

  deleteMessage(messageId: string) {
    const messageRef = doc(
      this.firestore,
      `${this.collectionName}/${messageId}`,
    );
    return from(deleteDoc(messageRef));
  }

  searchMessages(term: string) {
    const messagesRef = collection(this.firestore, this.collectionName);
    // Firestore does not support full text search natively, so we search by name, email, subject, or message (prefix match)
    // This example searches by name (add more fields as needed)
    const q = query(
      messagesRef,
      where('name', '>=', term),
      where('name', '<=', term + '\uf8ff'),
    );
    return from(collectionData(q, { idField: 'id' }));
  }
}
