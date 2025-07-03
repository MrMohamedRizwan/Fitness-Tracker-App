import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { ChartConfiguration, ChartOptions, ChartType } from 'chart.js';
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
  // Signals
  totalClients = signal<number>(0);
  activeWorkoutPlans = signal<number>(0);
  activeDietPlans = signal<number>(0);
  completedPlans = signal<number>(0);
  clientPro = signal<any[]>([]); // clients with status

  // Bar chart for plan assignment trends
  barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [],
  };

  barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: 'Number of Plans' },
      },
      x: {
        title: { display: true, text: 'Days' },
      },
    },
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Weekly Plan Assignments' },
    },
  };

  // Optional pie chart (client status)
  pieChartLabels: string[] = [];
  pieChartData: number[] = [];
  pieChartOptions: ChartOptions<'pie'> = {
    responsive: true,
    plugins: {
      legend: { position: 'bottom' },
      title: { display: true, text: 'Client Status Distribution' },
    },
  };
  pieChartType: ChartType = 'pie';

  // Static dummy activity & progress
  recentActivities = [
    'Welcome',
    // 'Assigned "Strength Plan" to John Doe',
    // 'Sarah completed Week 2 of "HIIT Program"',
    // 'Mike uploaded progress photo',
    // 'Lisa updated weight tracking',
  ];

  clientProgress = [
    { name: 'John Doe', progress: 75 },
    { name: 'Sarah Smith', progress: 50 },
    { name: 'Mike Brown', progress: 30 },
    { name: 'Lisa Ray', progress: 90 },
  ];

  constructor(private coachService: CoachService) {}

  ngOnInit(): void {
    this.fetchClientData();
    this.fetchWorkoutAndDietPlans();
    this.fetchAssignedPlansChart();
    // this.recentActivities = [...this.recentActivities, 'hni'];
  }

  fetchClientData(): void {
    this.coachService.getClientsList().subscribe({
      next: (res) => {
        const clients = res.items?.$values ?? [];
        this.totalClients.set(clients.length);
        this.clientPro.set(clients);
        // Count clients with status 'unassigned'
        const unassignedCount = clients.filter(
          (c: any) => c.status === 'Unassigned'
        ).length;
        if (unassignedCount > 0) {
          this.recentActivities = [
            ...[`There are ${unassignedCount} unassigned clients`],
          ];
          console.log(unassignedCount);
        }
        // Process client status chart (optional)
        const statusCounts = clients.reduce((acc: any, c: any) => {
          acc[c.status] = (acc[c.status] || 0) + 1;
          return acc;
        }, {});
        this.pieChartLabels = Object.keys(statusCounts);
        this.pieChartData = Object.values(statusCounts);
      },
      error: (err) => {
        console.error('Failed to fetch clients:', err);
      },
    });
  }

  fetchWorkoutAndDietPlans(): void {
    this.coachService.getWorkouts().subscribe({
      next: (res) => {
        this.activeWorkoutPlans.set(res.items?.$values?.length ?? 0);
      },
      error: (err) => console.error('Workout plans fetch error:', err),
    });

    this.coachService.getDiets().subscribe({
      next: (res) => {
        this.activeDietPlans.set(res.items?.$values?.length ?? 0);
      },
      error: (err) => console.error('Diet plans fetch error:', err),
    });
  }

  fetchAssignedPlansChart(): void {
    this.coachService.getAssignedPlansChart().subscribe({
      next: (res) => {
        let labels = res.labels?.$values ?? [];

        // Only show the last 7 data points
        if (labels.length > 7) {
          labels = labels.slice(-7);
        }

        // Convert date labels (e.g., '2024-01-05') to '5 Jan'
        const formattedLabels = labels.map((dateStr: string) => {
          const date = new Date(dateStr);
          const day = date.getDate();
          const month = date.toLocaleString('en-US', { month: 'short' });
          return `${day} ${month}`;
        });

        const datasets =
          res.datasets?.$values?.map((ds: any) => {
            // Slice data to match the last 7 labels
            const data = ds.data?.$values ?? [];
            const slicedData = data.length > 7 ? data.slice(-7) : data;
            return {
              label: ds.label,
              data: slicedData,
              backgroundColor:
                ds.label === 'Workout Plans Assigned' ? '#0d6efd' : '#20c997',
              borderRadius: 6,
            };
          }) ?? [];

        this.barChartData = { labels: formattedLabels, datasets };
      },
      error: (err) => {
        console.error('Error fetching assigned plans chart:', err);
      },
    });
  }
}
