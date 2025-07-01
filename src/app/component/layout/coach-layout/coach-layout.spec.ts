import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoachLayout } from './coach-layout';

describe('CoachLayout', () => {
  let component: CoachLayout;
  let fixture: ComponentFixture<CoachLayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoachLayout]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CoachLayout);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
