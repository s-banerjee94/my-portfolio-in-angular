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
}
