import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DietPlan } from './diet-plan';

describe('DietPlan', () => {
  let component: DietPlan;
  let fixture: ComponentFixture<DietPlan>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DietPlan]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DietPlan);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
