import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewDietPlan } from './view-diet-plan';

describe('ViewDietPlan', () => {
  let component: ViewDietPlan;
  let fixture: ComponentFixture<ViewDietPlan>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewDietPlan]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewDietPlan);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
