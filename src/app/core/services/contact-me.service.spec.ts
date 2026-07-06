import { TestBed } from '@angular/core/testing';

import { ContactMeService } from './contact-me.service';

describe('ContactMeService', () => {
  let service: ContactMeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ContactMeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
