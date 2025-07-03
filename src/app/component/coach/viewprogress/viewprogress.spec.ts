import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Viewprogress } from './viewprogress';
import { ActivatedRoute } from '@angular/router';
import { ProgressService } from '../../../services/ProgressService';
import { of, throwError } from 'rxjs';
import { CommonModule } from '@angular/common';
import { NgChartsModule } from 'ng2-charts';

describe('Viewprogress Component', () => {
  let component: Viewprogress;
  let fixture: ComponentFixture<Viewprogress>;
  let mockProgressService: jasmine.SpyObj<ProgressService>;

  const dummyProgressImages = {
    $values: [
      {
        uploadedAt: '2024-07-01T10:00:00Z',
        weight: 72,
        height: 175,
      },
      {
        uploadedAt: '2024-07-02T10:00:00Z',
        weight: 71,
        height: 175,
      },
    ],
  };

  const dummyGraphData = {
    assignments: {
      $values: [
        {
          progressPercentage: 80,
          caloriesIntake: 2200,
          caloriesBurnt: 500,
        },
        {
          progressPercentage: 60,
          caloriesIntake: 2100,
          caloriesBurnt: 600,
        },
      ],
    },
  };

  beforeEach(async () => {
    mockProgressService = jasmine.createSpyObj('ProgressService', [
      'getAllProgressOfClient',
      'getProgressGraph',
    ]);

    await TestBed.configureTestingModule({
      imports: [CommonModule, NgChartsModule],
      providers: [
        { provide: ProgressService, useValue: mockProgressService },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: () => 'mock-client-id',
              },
            },
          },
        },
      ],
    })
      .overrideComponent(Viewprogress, {
        set: {
          imports: [CommonModule, NgChartsModule],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(Viewprogress);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should load progress data and setup charts', () => {
    mockProgressService.getAllProgressOfClient.and.returnValue(
      of(dummyProgressImages)
    );
    mockProgressService.getProgressGraph.and.returnValue(of(dummyGraphData));

    fixture.detectChanges(); // triggers ngOnInit

    expect(mockProgressService.getAllProgressOfClient).toHaveBeenCalledWith(
      'mock-client-id'
    );
    expect(mockProgressService.getProgressGraph).toHaveBeenCalledWith(
      'mock-client-id'
    );

    // Check weightHeightChartData
    expect(component.weightHeightChartData.labels?.length).toBe(2);
    expect(component.weightHeightChartData.datasets[0].label).toBe(
      'Weight (kg)'
    );

    // Check planProgressChartData
    expect(component.planProgressChartData.datasets[0].data).toEqual([80, 60]);

    // Check caloriesChartData
    expect(component.caloriesChartData.datasets.length).toBe(2);
    expect(component.caloriesChartData.datasets[0].label).toBe(
      'Calories Intake'
    );

    // Check calorieLineChartData
    expect(component.calorieLineChartData.datasets[1].data).toEqual([500, 600]);
  });

  it('should handle error from progress API gracefully', () => {
    mockProgressService.getAllProgressOfClient.and.returnValue(
      throwError(() => new Error('progress error'))
    );
    mockProgressService.getProgressGraph.and.returnValue(
      throwError(() => new Error('graph error'))
    );

    fixture.detectChanges();

    expect(component.proImages().length).toBe(0);
    expect(component.assignments().length).toBe(0);
  });
});
