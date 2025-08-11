import { Component, OnInit, ChangeDetectorRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgChartsModule } from 'ng2-charts';
import { FormsModule } from '@angular/forms';

import { ProgressService } from '../../../services/ProgressService';
import { StatsHelperService } from './stats.helper';
import { StatsPhotos } from '../stats-photos/stats-photos';

@Component({
  selector: 'app-stats',
  standalone: true,
  imports: [CommonModule, NgChartsModule, FormsModule, StatsPhotos],
  templateUrl: './stats.html',
  styleUrl: './stats.css'
})
export class Stats implements OnInit {
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
    private progressService: ProgressService,
    private helper: StatsHelperService,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.weightHeightChartData = this.helper.emptyLineChart();
    this.planProgressChartData = this.helper.emptyBarChart();
    this.caloriesChartData = this.helper.emptyBarChart();
    this.calorieLineChartData = this.helper.emptyLineChart();

    const userJson = localStorage.getItem('user');
    if (userJson) {
      const user = JSON.parse(userJson);
      const token = user.token;

      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        this.clientId = payload.UserId;
      }
    }

    this.progressService.getAllProgress().subscribe({
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
    this.planProgressChartData = this.helper.setupPlanProgressChart(this.assignments());
    this.caloriesChartData = this.helper.setupCaloriesChart(this.assignments());
    this.calorieLineChartData = this.helper.setupCalorieLineChart(this.assignments());
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
    this.groupedImages = this.helper.groupImagesByTimeFrame(this.proImages(), grouping);
  }
}
