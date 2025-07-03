import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WorkoutDetails } from './workout-details';
import { ActivatedRoute, Router } from '@angular/router';
import { WorkoutPlanService } from '../../../services/WorkoutPlanService';
import { of, throwError } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

describe('WorkoutDetails Component', () => {
  let component: WorkoutDetails;
  let fixture: ComponentFixture<WorkoutDetails>;
  let mockWorkoutPlanService: any;
  let mockRouter: any;
  let mockActivatedRoute: any;

  const mockWorkout = {
    id: 'test-id',
    title: 'Test Workout',
    description: 'Test description',
    durationInWeeks: 4,
    coachId: 'coach-123',
    clients: {
      $values: [
        {
          name: 'Client 1',
          email: 'client1@example.com',
          status: 'On Progress',
          assignedOn: new Date().toISOString(),
        },
      ],
    },
    exercises: {
      $values: [
        {
          id: 'ex1',
          name: 'Push-Ups',
          sets: 3,
          reps: 15,
          restSeconds: 60,
          caloriesBurnt: 8,
          notes: '',
        },
      ],
    },
  };

  beforeEach(async () => {
    mockWorkoutPlanService = {
      GetParticularWorkout: jasmine
        .createSpy()
        .and.returnValue(of(mockWorkout)),
      updateWorkoutPlan: jasmine.createSpy().and.returnValue(of({})),
      deleteWorkoutPlan: jasmine.createSpy().and.returnValue(of({})),
    };

    mockRouter = {
      navigate: jasmine.createSpy(),
    };

    mockActivatedRoute = {
      snapshot: {
        params: {
          workoutId: 'test-id',
        },
      },
    };

    await TestBed.configureTestingModule({
      imports: [CommonModule, FormsModule, WorkoutDetails],
      providers: [
        { provide: WorkoutPlanService, useValue: mockWorkoutPlanService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(WorkoutDetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component and load workout data', () => {
    expect(component).toBeTruthy();
    expect(mockWorkoutPlanService.GetParticularWorkout).toHaveBeenCalledWith(
      'test-id'
    );
    expect(component.workout()?.title).toBe('Test Workout');
  });

  // it('should add an exercise', () => {
  //   component.addExercise();
  //   expect(component.workout()?.exercises.$values.length).toBe(2);
  // });

  it('should remove an exercise', () => {
    component.removeExercise(0);
    expect(component.workout()?.exercises.$values.length).toBe(0);
  });

  it('should update workout plan on edit', () => {
    const formData = {
      title: 'Updated Title',
      description: 'Updated Description',
      durationInWeeks: 6,
    };

    component.editWorkout(formData);
    expect(mockWorkoutPlanService.updateWorkoutPlan).toHaveBeenCalled();
  });

  it('should delete the workout and navigate on success', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    component.deleteWorkout();
    expect(mockWorkoutPlanService.deleteWorkoutPlan).toHaveBeenCalledWith(
      'test-id'
    );
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/view-workout-plan']);
  });

  it('should cancel edit and reload workout', () => {
    component.cancelEdit();
    expect(mockWorkoutPlanService.GetParticularWorkout).toHaveBeenCalledTimes(
      2
    );
  });
});
