import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, signal } from '@angular/core';
import { ChartConfiguration } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';
import { ActivatedRoute } from '@angular/router';
import { ProgressService } from '../../../services/ProgressService';

@Component({
  selector: 'app-viewprogress',
  standalone: true,
  imports: [CommonModule, NgChartsModule],
  templateUrl: './viewprogress.html',
  styleUrls: ['./viewprogress.css'],
})
export class Viewprogress implements OnInit {
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
    this.clientId = this.route.snapshot.paramMap.get('clientId');

    this.progressService.getAllProgressOfClient(this.clientId).subscribe({
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

    this.caloriesChartData = {
      labels: assigns.map((_, i) => `Plan ${i + 1}`),
      datasets: [
        {
          label: 'Calories Intake',
          data: assigns.map((a) => a.caloriesIntake),
          backgroundColor: 'orange',
        },
        {
          label: 'Calories Burnt',
          data: assigns.map((a) => a.caloriesBurnt),
          backgroundColor: 'red',
        },
      ],
    };
  }

  setupCalorieLineChart() {
    const assigns = this.assignments();
    const labels = assigns.map((_, i) => `Plan ${i + 1}`);

    this.calorieLineChartData = {
      labels,
      datasets: [
        {
          data: assigns.map((a) => a.caloriesIntake),
          label: 'Calories Intake',
          borderColor: 'orange',
          fill: false,
          tension: 0.3,
          pointBackgroundColor: 'orange',
        },
        {
          data: assigns.map((a) => a.caloriesBurnt),
          label: 'Calories Burnt',
          borderColor: 'red',
          fill: false,
          tension: 0.3,
          pointBackgroundColor: 'red',
        },
      ],
    };
  }
}
