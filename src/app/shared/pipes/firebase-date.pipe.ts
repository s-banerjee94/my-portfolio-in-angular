import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'firebaseDate'
})
export class FirebaseDatePipe implements PipeTransform {

  transform(timestamp: any): Date {
    if (!timestamp) return new Date();

    if (timestamp.toDate) {
      return timestamp.toDate();
    }
    if (timestamp instanceof Date) {
      return timestamp;
    }
    if (timestamp.seconds) {
      return new Date(timestamp.seconds * 1000);
    }
    return new Date(timestamp);
  }
}
