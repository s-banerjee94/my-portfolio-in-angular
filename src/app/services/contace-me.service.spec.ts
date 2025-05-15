import { TestBed } from '@angular/core/testing';

import { ContaceMeService } from './contace-me.service';

describe('ContaceMeService', () => {
  let service: ContaceMeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ContaceMeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
