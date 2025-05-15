import { inject, Injectable } from '@angular/core';
import {
  addDoc,
  collectionData,
  deleteDoc,
  doc,
  Firestore,
  getDocFromServer,
  setDoc,
} from '@angular/fire/firestore';
import { collection } from 'firebase/firestore';
import { from, Observable } from 'rxjs';
import {
  Storage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from '@angular/fire/storage';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private firestore = inject(Firestore);
  private storage = inject(Storage);
  readonly initial: string = 'profile/';
  constructor() {}
  getSectionData(sectionName: string) {
    const docRef = doc(this.firestore, `${this.initial}${sectionName}`);
    return from(getDocFromServer(docRef));
  }

  saveSectionData(sectionName: string, data: any): Observable<void> {
    const docRef = doc(this.firestore, `${this.initial}${sectionName}`);
    return from(setDoc(docRef, data));
  }

  getAllProjects() {
    const projectsRef = collection(this.firestore, `projects`);
    return collectionData(projectsRef, { idField: 'id' });
  }

  saveProject(projectData: any): Observable<void> {
    const projectRef = collection(this.firestore, 'projects');
    return from(addDoc(projectRef, projectData).then(() => {}));
  }

  deleteProject(projectId: string): Observable<void> {
    const projectRef = doc(this.firestore, `projects/${projectId}`);
    return from(deleteDoc(projectRef));
  }

  updateProject(projectId: string, projectData: any): Observable<void> {
    const projectRef = doc(this.firestore, `projects/${projectId}`);
    return from(setDoc(projectRef, projectData, { merge: true }));
  }

  uploadFile(file: File): Observable<string> {
    const storageRef = ref(this.storage, file.name);
    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Observable((observer) => {
      uploadTask.on(
        'state_changed',
        null,
        (error) => observer.error(error),
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            observer.next(downloadURL);
            observer.complete();
          });
        },
      );
    });
  }

  deleteFile(fileUrl: string): Observable<void> {
    const storageRef = ref(this.storage, fileUrl);
    return from(deleteObject(storageRef));
  }
}
