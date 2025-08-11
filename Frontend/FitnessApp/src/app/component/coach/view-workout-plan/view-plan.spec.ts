import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ViewPlan } from './view-plan';
import { WorkoutPlanService } from '../../../services/WorkoutPlanService';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

describe('ViewPlan Component', () => {
  let component: ViewPlan;
  let fixture: ComponentFixture<ViewPlan>;
  let mockWorkoutService: any;
  let mockRouter: any;

  const mockPlansResponse = {
    items: {
      $values: [
        {
          id: 'fdcf70ba-8475-4606-a798-2b29e092b933',
          title: 'Upper Body Muscle Gain Plan',
          description:
            'A 4-week program focusing on overall strength and conditioning for beginners.',
        },
        {
          id: '09b7968e-7b4c-4e12-8688-9280b4469671',
          title: 'Full Body Weight Loss Plan',
          description: 'Weight loss and toning program',
        },
      ],
    },
  };

  beforeEach(waitForAsync(() => {
    mockWorkoutService = {
      GetAllWorkouts: jasmine
        .createSpy('GetAllWorkouts')
        .and.returnValue(of(mockPlansResponse)),
    };

    mockRouter = {
      navigate: jasmine.createSpy('navigate'),
    };

    TestBed.configureTestingModule({
      imports: [ViewPlan, CommonModule, FormsModule],
      providers: [
        { provide: WorkoutPlanService, useValue: mockWorkoutService },
        { provide: Router, useValue: mockRouter },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewPlan);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch plans on init and set to signal', () => {
    const plans = component.plans();
    expect(plans.length).toBe(2);
    expect(plans[0].title).toContain('Upper Body Muscle Gain Plan');
  });

  it('should filter plans by search term', () => {
    component.searchTerm = 'weight loss';
    const filtered = component.filteredPlans();
    expect(filtered.length).toBe(1);
    expect(filtered[0].title).toBe('Full Body Weight Loss Plan');
  });

  it('should navigate to workout details page', () => {
    const dummyPlan = { id: '123' };
    component.showDetails(dummyPlan);
    expect(mockRouter.navigate).toHaveBeenCalledWith([
      '/workout-details',
      '123',
    ]);
  });

  it('should return all plans if searchTerm is empty', () => {
    component.searchTerm = '';
    const filtered = component.filteredPlans();
    expect(filtered.length).toBe(2);
  });
});
