import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';
import { CoachService } from '../../../services/CoachService';

@Component({
  selector: 'app-coach-dashboard',
  standalone: true,
  imports: [CommonModule, NgChartsModule],
  templateUrl: './coach-dashboard.html',
  styleUrls: ['./coach-dashboard.css'],
})
export class CoachDashboard implements OnInit {
  totalClients = signal<number | null>(null);
  activeWorkoutPlans = signal<number | null>(null);
  activeDietPlans = signal<number | null>(null);
  completedPlans = signal<number | null>(null);

  barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [],
  };

  barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Number of Plans',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Days',
        },
      },
    },
  };

  recentActivities = [
    'Assigned "Strength Plan" to John Doe',
    'Sarah completed Week 2 of "HIIT Program"',
    'Mike uploaded progress photo',
    'Lisa updated weight tracking',
  ];

  clientProgress = [
    { name: 'John Doe', progress: 75 },
    { name: 'Sarah Smith', progress: 50 },
    { name: 'Mike Brown', progress: 30 },
    { name: 'Lisa Ray', progress: 90 },
  ];

  constructor(private coachService: CoachService) {}

  ngOnInit(): void {
    // Fetch basic counts
    this.coachService.getClientsList().subscribe({
      next: (res) => {
        this.totalClients.set(res.items?.$values?.length ?? 0);
      },
    });

    this.coachService.getWorkouts().subscribe({
      next: (res) => {
        this.activeWorkoutPlans.set(res.items?.$values?.length ?? 0);
      },
    });

    this.coachService.getDiets().subscribe({
      next: (res) => {
        this.activeDietPlans.set(res.items?.$values?.length ?? 0);
      },
    });

    // Fetch chart data
    this.coachService.getAssignedPlansChart().subscribe({
      next: (res) => {
        const labels = res.labels?.$values ?? [];

        const datasets =
          res.datasets?.$values?.map((ds: any) => ({
            label: ds.label,
            data: ds.data?.$values ?? [],
            backgroundColor:
              ds.label === 'Workout Plans Assigned' ? '#0d6efd' : '#20c997',
            borderRadius: 6,
          })) ?? [];

        this.barChartData = {
          labels,
          datasets,
        };

        console.log('Parsed Chart Data:', this.barChartData);
      },
      error: (err) => {
        console.error('Error fetching assigned plans chart:', err);
      },
    });
  }
}
