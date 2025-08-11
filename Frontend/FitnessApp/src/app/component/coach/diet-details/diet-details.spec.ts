import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { DietDetails } from './diet-details';
import { ActivatedRoute, Router } from '@angular/router';
import { DietPlanService } from '../../../services/DietPlanService';
import { of, throwError } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

describe('DietDetails Component', () => {
  let component: DietDetails;
  let fixture: ComponentFixture<DietDetails>;
  let dietServiceSpy: jasmine.SpyObj<DietPlanService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const dietServiceMock = jasmine.createSpyObj('DietPlanService', [
      'GetParticularDiet',
      'updateDietPlan',
      'deleteDietPlan',
    ]);
    const routerMock = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [DietDetails, CommonModule, FormsModule],
      providers: [
        { provide: DietPlanService, useValue: dietServiceMock },
        { provide: Router, useValue: routerMock },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: new Map([['dietId', 'test-id']]) },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DietDetails);
    component = fixture.componentInstance;
    dietServiceSpy = TestBed.inject(
      DietPlanService
    ) as jasmine.SpyObj<DietPlanService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  //   it('should load diet on init', () => {
  //     const mockDiet = { title: 'Sample Diet', mealTypes: { $values: [] } };
  //     dietServiceSpy.GetParticularDiet.and.returnValue(of(mockDiet));

  //     component.ngOnInit();

  //     expect(dietServiceSpy.GetParticularDiet).toHaveBeenCalledWith('test-id');
  //     expect(component.diet()).toEqual(mockDiet);
  //   });

  //   it('should handle load diet error', () => {
  //     spyOn(window, 'alert');
  //     dietServiceSpy.GetParticularDiet.and.returnValue(throwError(() => 'error'));

  //     component.ngOnInit();

  //     expect(window.alert).toHaveBeenCalledWith('Failed to load diet plan.');
  //   });

  it('should update diet', () => {
    const updatedDiet = {
      title: 'Updated Title',
      description: 'Updated Description',
      durationInWeeks: 6,
    };

    const mockDiet = {
      id: '123',
      mealTypes: { $values: [{ mealName: 'Meal1' }] },
    };

    component.diet.set(mockDiet);

    dietServiceSpy.updateDietPlan.and.returnValue(of({}));

    spyOn(component, 'loadDiet');

    component.saveDiet(updatedDiet);

    expect(dietServiceSpy.updateDietPlan).toHaveBeenCalled();
    expect(component.loadDiet).toHaveBeenCalled();
  });

  it('should delete diet after confirmation', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    dietServiceSpy.deleteDietPlan.and.returnValue(of({}));

    component.dietId = '123';
    component.deleteDiet();

    expect(dietServiceSpy.deleteDietPlan).toHaveBeenCalledWith('123');
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/view-diet-plan']);
  });

  it('should not delete diet if cancelled', () => {
    spyOn(window, 'confirm').and.returnValue(false);

    component.deleteDiet();

    expect(dietServiceSpy.deleteDietPlan).not.toHaveBeenCalled();
  });

  it('should add a new meal', () => {
    component.diet.set({ mealTypes: { $values: [] } });

    component.addMeal();

    expect(component.diet().mealTypes.$values.length).toBe(1);
  });

  it('should remove a meal', () => {
    component.diet.set({ mealTypes: { $values: [{}, {}] } });

    component.removeMeal(1);

    expect(component.diet().mealTypes.$values.length).toBe(1);
  });
});
