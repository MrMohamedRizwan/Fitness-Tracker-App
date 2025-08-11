import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WorkoutPlan } from './workout-plan';
import { ActivatedRoute, Router } from '@angular/router';
import { WorkoutPlanService } from '../../../services/WorkoutPlanService';
import { of, throwError } from 'rxjs';
import { CommonModule } from '@angular/common';

describe('WorkoutPlan Component', () => {
  let component: WorkoutPlan;
  let fixture: ComponentFixture<WorkoutPlan>;
  let workoutServiceSpy: jasmine.SpyObj<WorkoutPlanService>;
  let routerSpy: jasmine.SpyObj<Router>;

  const mockWorkoutPlanId = 'workout123';
  const mockPlanAssignmentId = 'assignment456';

  const mockWorkout = {
    id: mockWorkoutPlanId,
    title: 'Full Body Workout',
    exercises: {
      $values: [
        {
          id: 'ex1',
          name: 'Push Up',
          sets: 3,
          reps: 15,
          restSeconds: 30,
          caloriesBurnt: 10,
        },
        {
          id: 'ex2',
          name: 'Plank',
          sets: 2,
          reps: 1,
          restSeconds: 60,
          caloriesBurnt: 5,
        },
      ],
    },
  };

  beforeEach(async () => {
    const workoutService = jasmine.createSpyObj('WorkoutPlanService', [
      'GetParticularWorkout',
      'SubmitWorkoutByClient',
    ]);
    const router = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        WorkoutPlan, // If WorkoutPlan is standalone, import it here
      ],
      providers: [
        { provide: WorkoutPlanService, useValue: workoutService },
        { provide: Router, useValue: router },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: (key: string) => {
                  if (key === 'workoutPlanId') return mockWorkoutPlanId;
                  if (key === 'planAssignemnetId') return mockPlanAssignmentId;
                  return null;
                },
              },
            },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(WorkoutPlan);
    component = fixture.componentInstance;
    workoutServiceSpy = TestBed.inject(
      WorkoutPlanService
    ) as jasmine.SpyObj<WorkoutPlanService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should load workout on init', () => {
    workoutServiceSpy.GetParticularWorkout.and.returnValue(of(mockWorkout));
    fixture.detectChanges();

    expect(workoutServiceSpy.GetParticularWorkout).toHaveBeenCalledWith(
      mockWorkoutPlanId
    );
    expect(component.Workouts()?.title).toBe('Full Body Workout');
  });

  it('should handle error on load workout', () => {
    spyOn(console, 'error');
    workoutServiceSpy.GetParticularWorkout.and.returnValue(
      throwError(() => new Error('Load error'))
    );
    fixture.detectChanges();

    expect(console.error).toHaveBeenCalled();
  });

  it('should toggle an exercise as completed', () => {
    const exId = 'ex1';
    expect(component.isCompleted(exId)).toBeFalse();

    component.toggleExercise(exId);
    expect(component.isCompleted(exId)).toBeTrue();

    component.toggleExercise(exId);
    expect(component.isCompleted(exId)).toBeFalse();
  });

  it('should submit workout with correct payload', () => {
    workoutServiceSpy.GetParticularWorkout.and.returnValue(of(mockWorkout));
    workoutServiceSpy.SubmitWorkoutByClient.and.returnValue(
      of({ message: 'Submitted' })
    );
    fixture.detectChanges();

    // Mark one exercise completed
    component.toggleExercise('ex1');

    component.submitWorkout();

    expect(workoutServiceSpy.SubmitWorkoutByClient).toHaveBeenCalled();
    const submittedPayload =
      workoutServiceSpy.SubmitWorkoutByClient.calls.mostRecent().args[0];

    expect(submittedPayload.PlanAssignmentId).toBe(mockPlanAssignmentId);
    expect(submittedPayload.totalExercises).toBe(1);
    expect(submittedPayload.caloriesBurnt).toBe(30); // 10 * 3 sets
    expect(routerSpy.navigate).toHaveBeenCalledWith(['client-dashboard']);
  });

  it('should not fail if no exercises are marked completed', () => {
    workoutServiceSpy.GetParticularWorkout.and.returnValue(of(mockWorkout));
    workoutServiceSpy.SubmitWorkoutByClient.and.returnValue(of({}));
    fixture.detectChanges();

    component.submitWorkout();

    expect(workoutServiceSpy.SubmitWorkoutByClient).toHaveBeenCalled();
    const payload =
      workoutServiceSpy.SubmitWorkoutByClient.calls.mostRecent().args[0];
    expect(payload.totalExercises).toBe(0);
    expect(payload.caloriesBurnt).toBe(0);
  });
});
