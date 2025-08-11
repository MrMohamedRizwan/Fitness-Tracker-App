import { fakeAsync, tick } from '@angular/core/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Viewprogress } from './viewprogress';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { ProgressService } from '../../../services/ProgressService';
import { NgChartsModule } from 'ng2-charts';
import { CommonModule } from '@angular/common';

describe('Viewprogress', () => {
  let component: Viewprogress;
  let fixture: ComponentFixture<Viewprogress>;

  const dummyProgressImages = {
    $values: [
      { uploadedAt: new Date(), weight: 70, height: 175 },
      { uploadedAt: new Date(), weight: 72, height: 176 },
    ],
  };

  const dummyGraphData = {
    assignments: {
      $values: [
        {
          assignedDate: new Date().toISOString(),
          caloriesIntake: 2100,
          caloriesBurnt: 1800,
          progressPercentage: 80,
          submittedOn: {
            $values: [
              {
                date: new Date().toISOString(),
                caloriesIntake: 500,
                caloriesBurnt: 600,
              },
            ],
          },
        },
      ],
    },
  };

  const mockProgressService = {
    getAllProgressOfClient: jasmine
      .createSpy('getAllProgressOfClient')
      .and.returnValue(of(dummyProgressImages)),
    getProgressGraph: jasmine
      .createSpy('getProgressGraph')
      .and.returnValue(of(dummyGraphData)),
  };

  const mockActivatedRoute = {
    snapshot: {
      paramMap: {
        get: () => 'mock-client-id',
      },
    },
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Viewprogress, NgChartsModule, CommonModule],
      providers: [
        { provide: ProgressService, useValue: mockProgressService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Viewprogress);
    component = fixture.componentInstance;
    fixture.detectChanges(); // triggers ngOnInit
  });

  it('should load progress data and setup charts', fakeAsync(() => {
    fixture.detectChanges(); // triggers ngOnInit and subscriptions
    tick(); // waits for observable emissions

    expect(mockProgressService.getAllProgressOfClient).toHaveBeenCalledWith(
      'mock-client-id'
    );
    expect(mockProgressService.getProgressGraph).toHaveBeenCalledWith(
      'mock-client-id'
    );

    // weightHeightChartData
    expect(component.weightHeightChartData.labels?.length).toBe(2);
    expect(component.weightHeightChartData.datasets[0].label).toBe(
      'Weight (kg)'
    );

    // planProgressChartData
    expect(component.planProgressChartData.datasets[0].data).toEqual([80]);

    // caloriesChartData
    expect(component.caloriesChartData.datasets.length).toBe(2);
    expect(component.caloriesChartData.datasets[0].label).toBe(
      'Calories Intake'
    );

    // calorieLineChartData
    expect(component.calorieLineChartData.datasets[1].data).toEqual([600]);
  }));
});
