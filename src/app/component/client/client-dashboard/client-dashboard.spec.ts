import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ClientDashboard } from './client-dashboard';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { Quotes } from '../quotes/quotes';
import { CommonModule } from '@angular/common';
import { PlanAssignmentService } from '../../../services/PlanAssignmentService';
import { ClientService } from '../../../services/ClientService';
import { NotificationService } from '../../../services/NotificationService';
import { ProgressService } from '../../../services/ProgressService';

describe('ClientDashboard Component', () => {
  let component: ClientDashboard;
  let fixture: ComponentFixture<ClientDashboard>;

  let mockRouter: any;
  let mockClientService: any;
  let mockPlanAssignmentService: any;
  let mockNotificationService: any;
  let mockProgressService: any;

  beforeEach(async () => {
    mockRouter = { navigate: jasmine.createSpy('navigate') };

    mockClientService = {
      getMyDetails: jasmine
        .createSpy()
        .and.returnValue(
          of({ message: { name: 'Test Client', email: 'test@example.com' } })
        ),
    };

    mockPlanAssignmentService = {
      getPlans: jasmine.createSpy().and.returnValue(
        of({
          $values: [
            {
              planAssignmentId: '1',
              workoutPlanID: 'w1',
              workoutPlanTitle: 'Upper',
              assignedOn: new Date().toISOString(),
            },
            {
              planAssignmentId: '2',
              dietPlanId: 'd1',
              dietPlanTitle: 'Keto',
              assignedOn: new Date().toISOString(),
            },
          ],
        })
      ),
      AcceptPlan: jasmine.createSpy().and.returnValue(of({ status: 200 })),
    };

    mockNotificationService = {
      notification: jasmine.createSpy().and.returnValue({
        message: 'New Plan Assigned',
      }),
      stopConnection: jasmine.createSpy(),
    };

    mockProgressService = {
      getAllProgress: jasmine.createSpy().and.returnValue(
        of({
          $values: [{ weightChangeSummary: 'Lost 2kg' }],
        })
      ),
    };

    await TestBed.configureTestingModule({
      imports: [CommonModule],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: ClientService, useValue: mockClientService },
        { provide: PlanAssignmentService, useValue: mockPlanAssignmentService },
        { provide: NotificationService, useValue: mockNotificationService },
        { provide: ProgressService, useValue: mockProgressService },
      ],
    })
      .overrideComponent(ClientDashboard, {
        set: {
          imports: [Quotes, CommonModule],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(ClientDashboard);
    component = fixture.componentInstance;
    fixture.detectChanges(); // triggers ngOnInit
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should load client details on init', () => {
    expect(mockClientService.getMyDetails).toHaveBeenCalled();
    expect(component.clientDetails).toBeTruthy();
    expect(component.client()?.name).toBe('Test Client');
  });

  it('should fetch plans and populate workout and diet plans', () => {
    component.getAssignedPlans();

    const workout = component.workoutPlans();
    const diet = component.dietPlans();

    expect(workout.length).toBe(1);
    expect(diet.length).toBe(1);
    expect(workout[0].workoutPlanTitle).toBe('Upper');
    expect(diet[0].dietPlanTitle).toBe('Keto');
  });

  it('should accept workout plan and store in sessionStorage', () => {
    spyOn(sessionStorage, 'setItem');

    const workoutPlan = {
      planAssignmentId: '1',
      workoutPlanID: 'w1',
    };

    component.acceptPlan(workoutPlan, 1);

    expect(mockPlanAssignmentService.AcceptPlan).toHaveBeenCalled();
    expect(sessionStorage.setItem).toHaveBeenCalledWith(
      'WorkoutPlanAssignment',
      JSON.stringify({
        PlanAssignmentID: '1',
        WorkoutPlanID: 'w1',
      })
    );
  });

  it('should accept diet plan and store in sessionStorage', () => {
    spyOn(sessionStorage, 'setItem');

    const dietPlan = {
      planAssignmentId: '2',
      dietPlanId: 'd1',
    };

    component.acceptPlan(dietPlan, 2);

    expect(mockPlanAssignmentService.AcceptPlan).toHaveBeenCalled();
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
      planAssignmentId: 'p2',
    };
    component.showDietDetails(details);

    expect(mockRouter.navigate).toHaveBeenCalledWith([
      '/client-diet-plan',
      'd1',
      'p2',
    ]);
  });

  it('should load weight change progress', () => {
    component.getProgresss();
    expect(mockProgressService.getAllProgress).toHaveBeenCalled();
    expect(component.weightChange).toBe('Lost 2kg');
  });

  it('should stop SignalR connection on destroy', () => {
    component.ngOnDestroy();
    expect(mockNotificationService.stopConnection).toHaveBeenCalled();
  });

  // it('should handle failed getPlans gracefully', () => {
  //   mockPlanAssignmentService.getPlans.and.returnValue(
  //     throwError(() => new Error('Error fetching plans'))
  //   );
  //   component.getAssignedPlans();

  //   expect(component.allPlans().length).toBe(0);
  //   expect(component.workoutPlans().length).toBe(0);
  //   expect(component.dietPlans().length).toBe(0);
  // });
});
