import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeorComponent } from './heor.component';

describe('HeorComponent', () => {
  let component: HeorComponent;
  let fixture: ComponentFixture<HeorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HeorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
