import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CoachDashboard } from './coach-dashboard';
import { CoachService } from '../../../services/CoachService';
import { of, throwError } from 'rxjs';
import { NgChartsModule } from 'ng2-charts';
import { CommonModule } from '@angular/common';

describe('CoachDashboard Component', () => {
  let component: CoachDashboard;
  let fixture: ComponentFixture<CoachDashboard>;
  let mockCoachService: any;

  beforeEach(async () => {
    mockCoachService = {
      getClientsList: jasmine.createSpy(),
      getWorkouts: jasmine.createSpy(),
      getDiets: jasmine.createSpy(),
      getAssignedPlansChart: jasmine.createSpy(),
    };

    await TestBed.configureTestingModule({
      imports: [CommonModule, NgChartsModule],
      providers: [{ provide: CoachService, useValue: mockCoachService }],
    })
      .overrideComponent(CoachDashboard, {
        set: {
          imports: [CommonModule, NgChartsModule],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(CoachDashboard);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // it('should load total clients and pie chart data', () => {
  //   const mockClients = {
  //     items: {
  //       $values: [
  //         { id: '1', name: 'John', status: 'On Progress' },
  //         { id: '2', name: 'Jane', status: 'Completed' },
  //         { id: '3', name: 'Doe', status: 'On Progress' },
  //       ],
  //     },
  //   };

  //   mockCoachService.getClientsList.and.returnValue(of(mockClients));

  //   fixture.detectChanges(); // triggers ngOnInit

  //   expect(mockCoachService.getClientsList).toHaveBeenCalled();
  //   expect(component.totalClients()).toBe(3);
  //   expect(component.clientPro().length).toBe(3);
  //   expect(component.pieChartLabels).toEqual(['On Progress', 'Completed']);
  //   expect(component.pieChartData).toEqual([2, 1]);
  // });

  it('should load workout and diet plan counts', () => {
    mockCoachService.getClientsList.and.returnValue(
      of({ items: { $values: [] } })
    );
    mockCoachService.getWorkouts.and.returnValue(
      of({ items: { $values: [{}, {}, {}] } })
    );
    mockCoachService.getDiets.and.returnValue(
      of({ items: { $values: [{}, {}] } })
    );
    mockCoachService.getAssignedPlansChart.and.returnValue(
      of({ labels: { $values: [] }, datasets: { $values: [] } })
    );

    fixture.detectChanges();

    expect(component.activeWorkoutPlans()).toBe(3);
    expect(component.activeDietPlans()).toBe(2);
  });

  it('should populate bar chart data from assigned plan chart data', () => {
    const mockChart = {
      labels: {
        $values: [
          '2024-06-25',
          '2024-06-26',
          '2024-06-27',
          '2024-06-28',
          '2024-06-29',
          '2024-06-30',
          '2024-07-01',
        ],
      },
      datasets: {
        $values: [
          {
            label: 'Workout Plans Assigned',
            data: { $values: [2, 4, 1, 3, 0, 5, 6] },
          },
          {
            label: 'Diet Plans Assigned',
            data: { $values: [1, 3, 2, 4, 2, 3, 4] },
          },
        ],
      },
    };

    mockCoachService.getClientsList.and.returnValue(
      of({ items: { $values: [] } })
    );
    mockCoachService.getWorkouts.and.returnValue(
      of({ items: { $values: [] } })
    );
    mockCoachService.getDiets.and.returnValue(of({ items: { $values: [] } }));
    mockCoachService.getAssignedPlansChart.and.returnValue(of(mockChart));

    fixture.detectChanges();

    expect(component.barChartData.labels?.length).toBe(7);
    expect(component.barChartData.datasets.length).toBe(2);
    expect(component.barChartData.datasets[0].label).toBe(
      'Workout Plans Assigned'
    );
    expect(component.barChartData.datasets[1].data).toEqual([
      1, 3, 2, 4, 2, 3, 4,
    ]);
  });

  it('should handle client API failure gracefully', () => {
    mockCoachService.getClientsList.and.returnValue(
      throwError(() => new Error('API Error'))
    );
    mockCoachService.getWorkouts.and.returnValue(
      of({ items: { $values: [] } })
    );
    mockCoachService.getDiets.and.returnValue(of({ items: { $values: [] } }));
    mockCoachService.getAssignedPlansChart.and.returnValue(
      of({ labels: { $values: [] }, datasets: { $values: [] } })
    );

    fixture.detectChanges();

    expect(component.totalClients()).toBe(0);
    expect(component.clientPro().length).toBe(0);
    expect(component.pieChartLabels).toEqual([]);
    expect(component.pieChartData).toEqual([]);
  });
});
