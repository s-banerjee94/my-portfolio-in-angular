import { EventEmitter, Injectable } from '@angular/core';
import { Project } from '../dashboard/project/add-edit-project/add-edit-project.component';

@Injectable({
  providedIn: 'root',
})
export class CommunicationService {
  public onProjectClickedEvent: EventEmitter<Project | null> =
    new EventEmitter<Project | null>();
  constructor() {}

  onProjectClicked(project: Project | null) {
    this.onProjectClickedEvent.emit(project);
  }
}
