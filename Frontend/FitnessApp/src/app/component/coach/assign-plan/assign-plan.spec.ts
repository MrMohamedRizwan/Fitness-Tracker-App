import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { AssignPlan } from './assign-plan';
import { CoachService } from '../../../services/CoachService';
import { ToastService } from '../../../services/ToastService';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

describe('AssignPlan Component', () => {
  let component: AssignPlan;
  let fixture: ComponentFixture<AssignPlan>;
  let coachServiceMock: any;
  let toastServiceMock: any;
  let routerMock: any;
  let routeMock: any;

  const mockClients = {
    items: {
      $values: [
        {
          id: 'client-1',
          name: 'Test Client',
          email: 'client@example.com',
        },
      ],
    },
  };

  const mockWorkouts = {
    items: {
      $values: [
        {
          id: 'workout-1',
          title: 'Strength Plan',
        },
      ],
    },
  };

  const mockDiets = {
    items: {
      $values: [
        {
          id: 'diet-1',
          title: 'Keto Plan',
        },
      ],
    },
  };

  beforeEach(waitForAsync(() => {
    coachServiceMock = {
      getClientsList: jasmine.createSpy().and.returnValue(of(mockClients)),
      getWorkouts: jasmine.createSpy().and.returnValue(of(mockWorkouts)),
      getDiets: jasmine.createSpy().and.returnValue(of(mockDiets)),
      assignPlanToClient: jasmine
        .createSpy()
        .and.returnValue(of({ success: true })),
    };

    toastServiceMock = {
      showToast: jasmine.createSpy('showToast'),
    };

    routerMock = {
      navigate: jasmine.createSpy('navigate'),
    };

    routeMock = {
      snapshot: { paramMap: new Map([['clientId', 'client-1']]) },
    };

    TestBed.configureTestingModule({
      imports: [CommonModule, ReactiveFormsModule, FormsModule],
      declarations: [],
      providers: [
        { provide: CoachService, useValue: coachServiceMock },
        { provide: ToastService, useValue: toastServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: routeMock },
      ],
    })
      .overrideComponent(AssignPlan, {
        set: {
          imports: [CommonModule, ReactiveFormsModule, FormsModule],
        },
      })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssignPlan);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should load clients, workouts, and diets on init', () => {
    expect(coachServiceMock.getClientsList).toHaveBeenCalled();
    expect(coachServiceMock.getWorkouts).toHaveBeenCalled();
    expect(coachServiceMock.getDiets).toHaveBeenCalled();
    expect(component.clients.length).toBeGreaterThan(0);
    expect(component.workoutPlans.length).toBeGreaterThan(0);
    expect(component.dietPlans.length).toBeGreaterThan(0);
  });

  it('should filter clients by name', () => {
    component.searchClient = 'test';
    component.filterList();
    expect(component.filteredClients.length).toBe(1);
  });

  it('should assign plans on submit', () => {
    component.selectedClient = 'client-1';
    component.selectedWorkoutPlan = 'workout-1';
    component.selectedDietPlan = 'diet-1';
    component.dueDate = '2025-07-03';

    component.clients = mockClients.items.$values;
    component.workoutPlans = mockWorkouts.items.$values;
    component.dietPlans = mockDiets.items.$values;

    component.onSubmit();

    expect(coachServiceMock.assignPlanToClient).toHaveBeenCalledTimes(2);
    expect(toastServiceMock.showToast).toHaveBeenCalledWith(
      'Successful',
      'Plan Assigned',
      'success'
    );
  });

  it('should show alert if required fields are missing', () => {
    spyOn(window, 'alert');
    component.selectedClient = '';
    component.onSubmit();
    expect(window.alert).toHaveBeenCalledWith(
      'Please select a client, workout plan, and diet plan.'
    );
  });

  // it('should show error toast on assign failure', () => {
  //   coachServiceMock.assignPlanToClient.and.returnValue(
  //     throwError(() => 'Failed')
  //   );
  //   spyOn(window, 'alert');

  //   component.selectedClient = 'client-1';
  //   component.selectedWorkoutPlan = 'workout-1';
  //   component.selectedDietPlan = 'diet-1';
  //   component.clients = mockClients.items.$values;
  //   component.workoutPlans = mockWorkouts.items.$values;
  //   component.dietPlans = mockDiets.items.$values;

  //   component.onSubmit();
  //   expect(toastServiceMock.showToast).toHaveBeenCalledWith(
  //     'Failed',
  //     'Failed',
  //     'error'
  //   );
  // });
});
