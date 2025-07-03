import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MyPlans } from './my-plans';
import { PlanAssignmentService } from '../../../services/PlanAssignmentService';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { CommonModule } from '@angular/common';

describe('MyPlans Component', () => {
  let component: MyPlans;
  let fixture: ComponentFixture<MyPlans>;
  let mockPlanService: any;
  let mockRouter: any;

  const mockPlansResponse = {
    $values: [
      {
        planAssignmentId: '1',
        workoutPlanID: 'w1',
        workoutPlanTitle: 'Upper Body Gain',
      },
      {
        planAssignmentId: '2',
        dietPlanId: 'd1',
        dietPlanTitle: 'Keto Diet',
      },
      {
        planAssignmentId: '3',
        workoutPlanID: 'w2',
        workoutPlanTitle: 'Not Assigned',
      },
    ],
  };

  beforeEach(waitForAsync(() => {
    mockPlanService = {
      getPlans: jasmine.createSpy().and.returnValue(of(mockPlansResponse)),
      AcceptPlan: jasmine
        .createSpy()
        .and.returnValue(of({ message: 'Accepted' })),
    };

    mockRouter = {
      navigate: jasmine.createSpy('navigate'),
    };

    TestBed.configureTestingModule({
      imports: [CommonModule],
      providers: [
        { provide: PlanAssignmentService, useValue: mockPlanService },
        { provide: Router, useValue: mockRouter },
      ],
    })
      .overrideComponent(MyPlans, {
        set: { imports: [CommonModule] },
      })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MyPlans);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch and filter workout and diet plans on init', () => {
    const all = component.allPlans();
    const workouts = component.workoutPlans();
    const diets = component.dietPlans();

    expect(mockPlanService.getPlans).toHaveBeenCalled();
    expect(all.length).toBe(3);
    expect(workouts.length).toBe(1); // Only one with a valid workoutPlanTitle
    expect(diets.length).toBe(1); // Only one with a valid dietPlanTitle
  });

  it('should handle fetch plan error gracefully', () => {
    mockPlanService.getPlans.and.returnValue(throwError(() => 'Error'));
    component.fetchPlanAssignment();

    expect(component.allPlans().length).toBe(0);
    expect(component.workoutPlans().length).toBe(0);
    expect(component.dietPlans().length).toBe(0);
  });

  it('should accept workout plan and store it in sessionStorage', () => {
    spyOn(sessionStorage, 'setItem');
    const workoutPlan = {
      planAssignmentId: '1',
      workoutPlanID: 'w1',
      workoutPlanTitle: 'Push Workout',
    };

    component.acceptPlan(workoutPlan, 1);

    expect(mockPlanService.AcceptPlan).toHaveBeenCalled();
    expect(sessionStorage.setItem).toHaveBeenCalledWith(
      'WorkoutPlanAssignment',
      JSON.stringify({
        PlanAssignmentID: '1',
        WorkoutPlanID: 'w1',
      })
    );
  });

  it('should accept diet plan and store it in sessionStorage', () => {
    spyOn(sessionStorage, 'setItem');
    const dietPlan = {
      planAssignmentId: '2',
      dietPlanId: 'd1',
      dietPlanTitle: 'Keto Diet',
    };

    component.acceptPlan(dietPlan, 2);

    expect(mockPlanService.AcceptPlan).toHaveBeenCalled();
    expect(sessionStorage.setItem).toHaveBeenCalledWith(
      'DietPlanAssignment',
      JSON.stringify({
        DietPlanAssignmentID: '2',
        DietPlanID: 'd1',
      })
    );
  });

  it('should navigate to workout plan details', () => {
    const details = {
      workoutPlanID: 'w1',
      planAssignmentId: 'p1',
    };

    component.showWorkoutDetails(details);

    expect(mockRouter.navigate).toHaveBeenCalledWith([
      '/client-workout-plan',
      'w1',
      'p1',
    ]);
  });

  it('should navigate to diet plan details', () => {
    const details = {
      dietPlanId: 'd1',
      planAssignmentId: 'p1',
    };

    component.showDietDetails(details);

    expect(mockRouter.navigate).toHaveBeenCalledWith([
      '/client-diet-plan',
      'd1',
      'p1',
    ]);
  });
});
