import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ViewDietPlan } from './view-diet-plan';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { DietPlanService } from '../../../services/DietPlanService';
import { RouterTestingModule } from '@angular/router/testing';

describe('ViewDietPlan', () => {
  let component: ViewDietPlan;
  let fixture: ComponentFixture<ViewDietPlan>;
  let mockDietPlanService: jasmine.SpyObj<DietPlanService>;
  let router: Router;

  const mockPlans = {
    items: {
      $values: [
        {
          id: '1',
          title: 'Keto Plan',
          description: 'Low carb, high fat',
        },
        {
          id: '2',
          title: 'Vegan Plan',
          description: 'Plant-based nutrition',
        },
      ],
    },
  };

  beforeEach(waitForAsync(() => {
    mockDietPlanService = jasmine.createSpyObj('DietPlanService', [
      'GetAllDiets',
    ]);

    TestBed.configureTestingModule({
      imports: [ViewDietPlan, RouterTestingModule],
      providers: [{ provide: DietPlanService, useValue: mockDietPlanService }],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewDietPlan);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should load diet plans on init', () => {
    mockDietPlanService.GetAllDiets.and.returnValue(of(mockPlans));
    fixture.detectChanges(); // triggers ngOnInit

    expect(component.plans()).toEqual(mockPlans.items.$values);
    expect(mockDietPlanService.GetAllDiets).toHaveBeenCalled();
  });

  it('should filter plans based on searchTerm', () => {
    component.plans.set(mockPlans.items.$values);
    component.searchTerm = 'vegan';

    const result = component.filteredPlans();
    expect(result.length).toBe(1);
    expect(result[0].title).toBe('Vegan Plan');
  });

  it('should navigate to diet details when showDetails is called', () => {
    const navigateSpy = spyOn(router, 'navigate');
    const testPlan = { id: '123' };

    component.showDetails(testPlan);

    expect(navigateSpy).toHaveBeenCalledWith(['/diet-details', '123']);
  });
});
