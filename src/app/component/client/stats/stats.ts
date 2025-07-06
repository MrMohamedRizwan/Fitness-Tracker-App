import { ChangeDetectorRef, Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ChartConfiguration } from 'chart.js';
import { ProgressService } from '../../../services/ProgressService';
import { CommonModule } from '@angular/common';
import { NgChartsModule } from 'ng2-charts';

@Component({
  selector: 'app-stats',
  imports: [CommonModule, NgChartsModule],

  templateUrl: './stats.html',
  styleUrl: './stats.css',
})
export class Stats implements OnInit {
  clientId: any;

  proImages = signal<any[]>([]);
  assignments = signal<any[]>([]);

  // Chart Data
  weightHeightChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [],
  };
  planProgressChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [],
  };
  caloriesChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [],
  };
  calorieLineChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [],
  };

  constructor(
    private route: ActivatedRoute,
    private progressService: ProgressService,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      const user = JSON.parse(userJson);
      const token = user.token;

      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        this.clientId = payload.UserId; // or payload['UserId']
        console.log('Decoded UserId (ClientId):', this.clientId);
      }
    }
    this.progressService.getAllProgress().subscribe({
      next: (res) => {
        this.proImages.set(res.$values || []);
        this.setupCharts();
        this.setupCalorieLineChart();
        this.cdRef.detectChanges();
      },
      error: (err) => console.error(err),
    });

    this.progressService.getProgressGraph(this.clientId).subscribe({
      next: (res) => {
        this.assignments.set(res.assignments.$values || []);
        this.setupCharts();
        this.setupCalorieLineChart();
        this.cdRef.detectChanges();
        console.log(res.assignments.$values);
      },
      error: (err) => console.error(err),
    });
  }

  setupCharts() {
    const images = this.proImages();
    const labels = images.map((img) =>
      new Date(img.uploadedAt).toLocaleDateString()
    );

    this.weightHeightChartData = {
      labels,
      datasets: [
        {
          data: images.map((img) => img.weight),
          label: 'Weight (kg)',
          borderColor: 'blue',
          fill: false,
        },
        {
          data: images.map((img) => img.height),
          label: 'Height (cm)',
          borderColor: 'green',
          fill: false,
        },
      ],
    };

    const assigns = this.assignments();
    this.planProgressChartData = {
      labels: assigns.map((_, i) => `Plan ${i + 1}`),
      datasets: [
        {
          label: 'Progress %',
          data: assigns.map((a) => a.progressPercentage),
          backgroundColor: 'rgba(54, 162, 235, 0.6)',
        },
      ],
    };

    // Filter out assignments where either caloriesIntake or caloriesBurnt is zero
    const filteredAssigns = assigns.filter(
      (a) => a.caloriesIntake !== 0 && a.caloriesBurnt !== 0
    );

    this.caloriesChartData = {
      labels: filteredAssigns.map((_, i) => `Plan ${i + 1}`),
      datasets: [
        {
          label: 'Calories Intake',
          data: filteredAssigns.map((a) => a.caloriesIntake),
          // backgroundColor: 'orange',
        },
        {
          label: 'Calories Burnt',
          data: filteredAssigns.map((a) => a.caloriesBurnt),
          backgroundColor: 'red',
        },
      ],
    };
  }

  setupCalorieLineChart() {
    const assigns = this.assignments();
    let totalIntake = 0;
    let totalBurnt = 0;
    let intakeCount = 0;
    let burntCount = 0;

    for (const assign of assigns) {
      const entries = assign.submittedOn?.$values;
      if (!Array.isArray(entries)) continue;

      for (const entry of entries) {
        const intake = Number(entry.caloriesIntake || 0);
        const burnt = Number(entry.caloriesBurnt || 0);

        if (intake > 0) {
          totalIntake += intake;
          intakeCount++;
        }

        if (burnt > 0) {
          totalBurnt += burnt;
          burntCount++;
        }
      }
    }

    const avgIntake = intakeCount > 0 ? totalIntake / intakeCount : 0;
    const avgBurnt = burntCount > 0 ? totalBurnt / burntCount : 0;

    this.calorieLineChartData = {
      labels: ['Avg Calories Intake', 'Avg Calories Burnt'],
      datasets: [
        {
          data: [avgIntake, avgBurnt],
          backgroundColor: ['orange', 'red'],
          label: 'Calories Distribution',
        },
      ],
    };
  }
}
