import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { DietPlan } from './diet-plan';
import { ActivatedRoute, Router } from '@angular/router';
import { DietPlanService } from '../../../services/DietPlanService';
import { of } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

describe('DietPlan Component', () => {
  let component: DietPlan;
  let fixture: ComponentFixture<DietPlan>;

  const mockDietPlanService = {
    GetParticularDiet: jasmine.createSpy('GetParticularDiet'),
    SubmitDietByClient: jasmine.createSpy('SubmitDietByClient'),
  };

  const mockActivatedRoute = {
    snapshot: {
      paramMap: {
        get: (key: string) => {
          if (key === 'dietPlanId') return 'diet123';
          if (key === 'planAssignemnetId') return 'assign456';
          return null;
        },
      },
    },
  };

  const mockRouter = {
    navigate: jasmine.createSpy('navigate'),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DietPlan, CommonModule, FormsModule],
      providers: [
        { provide: DietPlanService, useValue: mockDietPlanService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: Router, useValue: mockRouter },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DietPlan);
    component = fixture.componentInstance;
  });

  beforeEach(() => {
    mockDietPlanService.GetParticularDiet.calls.reset();
    mockDietPlanService.SubmitDietByClient.calls.reset();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize and load diet plan on ngOnInit', fakeAsync(() => {
    const dummyPlan = { id: 'diet123', mealTypes: { $values: [] } };
    mockDietPlanService.GetParticularDiet.and.returnValue(of(dummyPlan));

    fixture.detectChanges(); // triggers ngOnInit
    tick();

    expect(component.planAssignmentId).toBe('assign456');
    expect(mockDietPlanService.GetParticularDiet).toHaveBeenCalledWith(
      'diet123'
    );
    expect(component.DietPlan()).toEqual(dummyPlan);
  }));

  it('should add a new meal to the plan', () => {
    const existingPlan = {
      mealTypes: { $values: [] },
    };
    component.DietPlan.set(existingPlan);

    component.newMeal = {
      mealType: 'Lunch',
      mealName: 'Chicken Bowl',
      calories: 400,
    };

    component.addNewMeal();

    expect(component.DietPlan().mealTypes.$values.length).toBe(1);
    expect(component.newMeal.mealName).toBe('');
    expect(component.showAddForm).toBeFalse();
  });

  it('should not add meal if required fields are missing', () => {
    spyOn(window, 'alert');

    component.newMeal = {
      mealType: '',
      mealName: 'Rice',
      calories: 200,
    };

    component.addNewMeal();

    expect(window.alert).toHaveBeenCalledWith(
      '❌ Please fill all fields correctly.'
    );
  });

  it('should delete a meal by ID', () => {
    const meal1 = { id: 'm1', name: 'Breakfast' };
    const meal2 = { id: 'm2', name: 'Dinner' };

    component.DietPlan.set({
      mealTypes: { $values: [meal1, meal2] },
    });

    component.completedMeals.set(new Set(['m1', 'm2']));

    component.deleteMeal('m1');

    expect(component.DietPlan().mealTypes.$values.length).toBe(1);
    expect(component.DietPlan().mealTypes.$values[0].id).toBe('m2');
    expect(component.completedMeals().has('m1')).toBeFalse();
  });

  it('should toggle meal completion state', () => {
    component.completedMeals.set(new Set());

    component.toggleMeal('m1');
    expect(component.completedMeals().has('m1')).toBeTrue();

    component.toggleMeal('m1');
    expect(component.completedMeals().has('m1')).toBeFalse();
  });

  it('should return true for isCompleted if mealId is in set', () => {
    component.completedMeals.set(new Set(['m2']));
    expect(component.isCompleted('m2')).toBeTrue();
  });

  it('should submit diet and navigate on success', fakeAsync(() => {
    const meal1 = {
      id: 'm1',
      calories: 300,
      name: 'A',
      foodItems: [],
      timeOfDay: 'Morning',
    };
    const meal2 = {
      id: 'm2',
      calories: 200,
      name: 'B',
      foodItems: [],
      timeOfDay: 'Evening',
    };

    component.DietPlan.set({ mealTypes: { $values: [meal1, meal2] } });
    component.completedMeals.set(new Set(['m1']));

    mockDietPlanService.SubmitDietByClient.and.returnValue(
      of({ status: 'ok' })
    );

    component.planAssignmentId = 'assign456';

    component.submitDiet();
    tick();

    expect(mockDietPlanService.SubmitDietByClient).toHaveBeenCalled();
    const payload =
      mockDietPlanService.SubmitDietByClient.calls.mostRecent().args[0];
    expect(payload.totalMeals).toBe(1);
    expect(payload.caloriesTaken).toBe(300);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['client-dashboard']);
  }));
});
