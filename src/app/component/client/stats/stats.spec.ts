import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Stats } from './stats';
import { ProgressService } from '../../../services/ProgressService';
import { of } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';

describe('Stats', () => {
  let component: Stats;
  let fixture: ComponentFixture<Stats>;
  let progressServiceSpy: jasmine.SpyObj<ProgressService>;

  const mockProgressImages = {
    $values: [
      { uploadedAt: new Date().toISOString(), weight: 70, height: 175 },
      { uploadedAt: new Date().toISOString(), weight: 72, height: 176 },
    ],
  };

  const mockAssignments = {
    assignments: {
      $values: [
        {
          progressPercentage: 80,
          caloriesIntake: 1800,
          caloriesBurnt: 1600,
        },
        {
          progressPercentage: 90,
          caloriesIntake: 2000,
          caloriesBurnt: 1900,
        },
      ],
    },
  };

  beforeEach(waitForAsync(() => {
    const spy = jasmine.createSpyObj('ProgressService', [
      'getAllProgress',
      'getProgressGraph',
    ]);

    TestBed.configureTestingModule({
      imports: [Stats, RouterTestingModule],
      providers: [{ provide: ProgressService, useValue: spy }],
    }).compileComponents();

    progressServiceSpy = TestBed.inject(
      ProgressService
    ) as jasmine.SpyObj<ProgressService>;
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Stats);
    component = fixture.componentInstance;

    // Set localStorage user token
    const dummyPayload = btoa(JSON.stringify({ UserId: 'test-client-id' }));
    const dummyToken = `header.${dummyPayload}.signature`;
    localStorage.setItem('user', JSON.stringify({ token: dummyToken }));

    progressServiceSpy.getAllProgress.and.returnValue(of(mockProgressImages));
    progressServiceSpy.getProgressGraph.and.returnValue(of(mockAssignments));

    fixture.detectChanges(); // ngOnInit runs here
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should load progress and assignments data', () => {
    expect(component.proImages().length).toBe(2);
    expect(component.assignments().length).toBe(2);

    // Confirm chart data was generated
    expect(component.weightHeightChartData.datasets.length).toBe(2);
    expect(component.planProgressChartData.datasets[0].data.length).toBe(2);
    expect(component.calorieLineChartData.datasets[0].data.length).toBe(2);
  });

  it('should correctly decode clientId from token', () => {
    expect(component.clientId).toBe('test-client-id');
  });
});
