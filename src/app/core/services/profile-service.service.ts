import {inject, Injectable} from '@angular/core';
import {
  addDoc,
  collectionData,
  deleteDoc,
  doc,
  Firestore,
  getDocFromServer,
  orderBy,
  query,
  setDoc, where,
} from '@angular/fire/firestore';
import {collection} from 'firebase/firestore';
import {from, Observable} from 'rxjs';
import {deleteObject, getDownloadURL, ref, Storage, uploadBytesResumable,} from '@angular/fire/storage';
import {Experience} from '@dashboard/experience/experience.component';
import {Resume} from '@dashboard/resume/resume.component';
import {Certification} from '@dashboard/certification/certification.component';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private firestore = inject(Firestore);
  private storage = inject(Storage);
  readonly initial: string = 'profile/';

  constructor() {
  }

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
    const q = query(projectsRef, orderBy('projectDate', 'desc'));
    return collectionData(q, {idField: 'id'});
  }

  saveProject(projectData: any): Observable<void> {
    const projectRef = collection(this.firestore, 'projects');
    return from(addDoc(projectRef, projectData).then(() => {
    }));
  }

  deleteProject(projectId: string): Observable<void> {
    const projectRef = doc(this.firestore, `projects/${projectId}`);
    return from(deleteDoc(projectRef));
  }

  updateProject(projectId: string, projectData: any): Observable<void> {
    const projectRef = doc(this.firestore, `projects/${projectId}`);
    return from(setDoc(projectRef, projectData, {merge: true}));
  }

  getAllExperiences() {
    const projectsRef = collection(this.firestore, `experience`);
    const q = query(projectsRef, orderBy('startDate', 'desc'));
    return collectionData(q, {idField: 'id'});
  }

  saveExperience(experienceData: Experience): Observable<void> {
    const projectRef = collection(this.firestore, 'experience');
    return from(addDoc(projectRef, experienceData).then(() => {
    }));
  }

  deleteExperience(experienceId: string): Observable<void> {
    const projectRef = doc(this.firestore, `experience/${experienceId}`);
    return from(deleteDoc(projectRef));
  }

  updateExperience(experienceId: string, experienceData: Experience): Observable<void> {
    const projectRef = doc(this.firestore, `experience/${experienceId}`);
    return from(setDoc(projectRef, experienceData, {merge: true}));
  }

  getAllCertifications() {
    const certificationsRef = collection(this.firestore, 'certifications');
    const q = query(certificationsRef, orderBy('issueDate', 'desc'));
    return collectionData(q, {idField: 'id'});
  }

  saveCertification(certificationData: Certification): Observable<void> {
    const certificationRef = collection(this.firestore, 'certifications');
    return from(addDoc(certificationRef, certificationData).then(() => {
    }));
  }

  updateCertification(certificationId: string, certificationData: Certification): Observable<void> {
    const certificationRef = doc(this.firestore, `certifications/${certificationId}`);
    return from(setDoc(certificationRef, certificationData, {merge: true}));
  }

  deleteCertification(certificationId: string): Observable<void> {
    const certificationRef = doc(this.firestore, `certifications/${certificationId}`);
    return from(deleteDoc(certificationRef));
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

  getAllResumes(): Observable<Resume[]> {
    const resumesRef = collection(this.firestore, 'resumes');
    const q = query(resumesRef, orderBy('uploadDate', 'desc'));
    return collectionData(q, {idField: 'id'}) as Observable<Resume[]>;
  }
  getPrimaryResume(): Observable<Resume[]> {
    const resumesRef = collection(this.firestore, 'resumes');
    const q = query(resumesRef, where('isPrimary', '==', true));
    return collectionData(q, {idField: 'id'}) as Observable<Resume[]>;
  }

  saveResume(resumeData: Resume): Observable<void> {
    const resumeRef = collection(this.firestore, 'resumes');
    return from(addDoc(resumeRef, resumeData).then(() => {}));
  }

  deleteResume(resumeId: string): Observable<void> {
    const resumeRef = doc(this.firestore, `resumes/${resumeId}`);
    return from(deleteDoc(resumeRef));
  }

  updateResume(resumeId: string, resumeData: Partial<Resume>): Observable<void> {
    const resumeRef = doc(this.firestore, `resumes/${resumeId}`);
    return from(setDoc(resumeRef, resumeData, {merge: true}));
  }
}
