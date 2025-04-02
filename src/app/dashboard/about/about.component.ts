import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';

import { CardModule } from 'primeng/card';
import { EditorModule } from 'primeng/editor';
import { FloatLabel } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { ChipModule } from 'primeng/chip';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-about',
  imports: [
    FormsModule,
    CardModule,
    EditorModule,
    FloatLabel,
    InputTextModule,
    ChipModule,
    ButtonModule,
  ],
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css'],
})
export class AboutComponent {
  text = '';
  experience = '';
  education = '';
  certification = '';
  enteredSkill = '';
  skills: string[] = [];

  addSkill(): void {
    const skill = this.enteredSkill.trim();
    if (skill && !this.skills.includes(skill)) {
      this.skills.push(skill);
      this.enteredSkill = '';
    }
  }

  removeSkill(skill: string): void {
    this.skills = this.skills.filter((s) => s !== skill);
  }
  saveAboutDetails(form: NgForm): void {
    console.log('Form Data:', form.value);
    console.log('Text:', this.text);
    console.log('Experience:', this.experience);
    console.log('Education:', this.education);
    console.log('Certification:', this.certification);
    console.log('Skills:', this.skills);
  }
}
