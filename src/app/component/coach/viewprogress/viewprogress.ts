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
    const labels = images
      .map((img) => new Date(img.uploadedAt).toLocaleDateString())
      .reverse();

    this.weightHeightChartData = {
      labels,
      datasets: [
        {
          data: images.map((img) => img.weight).reverse(),
          label: 'Weight (kg)',
          borderColor: 'blue',
          fill: false,
        },
        {
          data: images.map((img) => img.height).reverse(),
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

    const filteredAssigns = assigns.filter(
      (a) => a.caloriesIntake !== 0 && a.caloriesBurnt !== 0
    );

    this.caloriesChartData = {
      labels: filteredAssigns.map((a) =>
        a.assignedDate ? new Date(a.assignedDate).toLocaleDateString() : ''
      ),
      datasets: [
        {
          label: 'Calories Intake',
          data: filteredAssigns.map((a) => a.caloriesIntake),
          backgroundColor: 'orange',
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
    const calorieMap: Record<string, { intake: number; burnt: number }> = {};

    for (const assign of assigns) {
      const rawDates = assign.submittedOn?.$values;

      if (!Array.isArray(rawDates)) continue;

      for (const entry of rawDates) {
        const isoDate = entry.date;
        const intake = Number(entry.caloriesIntake || 0);
        const burnt = Number(entry.caloriesBurnt || 0);

        const dateKey = new Date(isoDate).toLocaleDateString();

        if (!calorieMap[dateKey]) {
          calorieMap[dateKey] = { intake: 0, burnt: 0 };
        }

        calorieMap[dateKey].intake += intake;
        calorieMap[dateKey].burnt += burnt;
      }
    }
    console.table(calorieMap);
    // Sort dates
    const sortedDates = Object.keys(calorieMap)
      .sort(
        (a, b) => new Date(b).getTime() - new Date(a).getTime() // 🔁 descending order
      )
      .reverse();

    // const labels = images.map((img) =>
    //   new Date(img.uploadedAt).toLocaleDateString()
    // );
    // const sortedDates = Object.keys(calorieMap).sort(); // ISO format sorts correctly

    const labels: string[] = [];
    const intakeData: number[] = [];
    const burntData: number[] = [];

    for (const date of sortedDates) {
      labels.push(date);
      intakeData.push(calorieMap[date].intake);
      burntData.push(calorieMap[date].burnt);
    }

    this.calorieLineChartData = {
      labels,
      datasets: [
        {
          data: intakeData,
          label: 'Calories Intake',
          borderColor: 'orange',
          fill: false,
          tension: 0.3,
          pointBackgroundColor: 'orange',
        },
        {
          data: burntData,
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
