import { Component, OnInit, ChangeDetectorRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgChartsModule } from 'ng2-charts';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { ProgressService } from '../../../services/ProgressService';
import { StatsPhotos } from '../../client/stats-photos/stats-photos';
import { StatsHelperService } from '../../client/stats/stats.helper';

@Component({
  selector: 'app-viewprogress',
  standalone: true,
  imports: [CommonModule, NgChartsModule, FormsModule, StatsPhotos],
  templateUrl: './viewprogress.html',
  styleUrls: ['./viewprogress.css'],
})
export class Viewprogress implements OnInit {
  clientId: any;

  proImages = signal<any[]>([]);
  assignments = signal<any[]>([]);
  selectedView: 'daily' | 'weekly' | 'monthly' = 'daily';
  selectedGrouping: 'weekly' | 'monthly' = 'weekly';
  showComparison = false;
  showGallery = false;
  groupedImages: any[] = [];

  weightHeightChartData: any;
  planProgressChartData: any;
  caloriesChartData: any;
  calorieLineChartData: any;

  constructor(
    private route: ActivatedRoute,
    private progressService: ProgressService,
    private helper: StatsHelperService,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.weightHeightChartData = this.helper.emptyLineChart();
    this.planProgressChartData = this.helper.emptyBarChart();
    this.caloriesChartData = this.helper.emptyBarChart();
    this.calorieLineChartData = this.helper.emptyLineChart();

    this.clientId = this.route.snapshot.paramMap.get('clientId');

    // Use specific API call for this component
    this.progressService.getAllProgressOfClient(this.clientId).subscribe({
      next: (res) => {
        this.proImages.set(res.$values || []);
        this.setupAllCharts();
      },
      error: (err) => console.error(err),
    });

    this.progressService.getProgressGraph(this.clientId).subscribe({
      next: (res) => {
        this.assignments.set(res.assignments.$values || []);
        this.setupAllCharts();
      },
      error: (err) => console.error(err),
    });
  }

  setupAllCharts() {
    this.weightHeightChartData = this.helper.setupWeightHeightChart(
      this.proImages(),
      this.selectedView
    );
    this.planProgressChartData = this.helper.setupPlanProgressChart(
      this.assignments()
    );
    this.caloriesChartData = this.helper.setupCaloriesChart(this.assignments());
    this.calorieLineChartData = this.helper.setupCalorieLineChart(
      this.assignments()
    );
    // this.setupCalorieLineChart();
    this.cdRef.detectChanges();
  }

  onCompare() {
    this.showComparison = true;
    this.showGallery = false;
    this.groupImagesByTimeFrame(this.selectedGrouping);
  }

  toggleGallery() {
    this.showGallery = true;
    this.showComparison = false;
  }

  groupImagesByTimeFrame(grouping: 'weekly' | 'monthly') {
    this.selectedGrouping = grouping;
    this.groupedImages = this.helper.groupImagesByTimeFrame(
      this.proImages(),
      grouping
    );
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
