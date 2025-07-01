import { Component, OnInit, signal } from '@angular/core';
import { ProgressService } from '../../../services/ProgressService';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ChartEvent, ChartOptions, ChartType, LabelItem } from 'chart.js';
import { NgModule } from '@angular/core';
import { NgChartsModule } from 'ng2-charts';

@Component({
  selector: 'app-progress',
  imports: [CommonModule, ReactiveFormsModule, FormsModule, NgChartsModule],
  templateUrl: './progress.html',
  styleUrl: './progress.css',
})
export class Progress implements OnInit {
  progressList: any[] = [];
  selectedFile: File | null = null;
  selectedFilePreview: string | null = null;
  height = 0;
  weight = 0;
  loading = false;

  // Chart.js config
  lineChartLabels: string[] = [];
  heightData: number[] = [];
  weightData: number[] = [];
  lineChartData = [
    { data: this.heightData, label: 'Height (cm)' },
    { data: this.weightData, label: 'Weight (kg)' },
  ];
  lineChartOptions: ChartOptions = {
    responsive: true,
  };
  lineChartType: ChartType = 'line';
  lineChartLegend = true;

  constructor(private progressService: ProgressService) {}

  ngOnInit(): void {
    this.loadProgressData();
  }

  loadProgressData() {
    this.progressService.getAllProgress().subscribe((res) => {
      this.progressList = res?.$values || [];

      this.lineChartLabels = this.progressList.map((p) =>
        new Date(p.uploadedAt).toLocaleDateString()
      );
      this.heightData = this.progressList.map((p) => p.height);
      this.weightData = this.progressList.map((p) => p.weight);

      this.lineChartData = [
        { data: this.heightData, label: 'Height (cm)' },
        { data: this.weightData, label: 'Weight (kg)' },
      ];

      // trigger chart update
      this.lineChartData = [...this.lineChartData];
      this.lineChartLabels = [...this.lineChartLabels];
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = (e) => {
        this.selectedFilePreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  submitting() {
    return this.loading;
  }

  onSubmit() {
    if (!this.selectedFile || !this.height || !this.weight) return;

    const formData = new FormData();
    formData.append('imageFile', this.selectedFile);
    // Validation: height should not be less than previous entry
    if (this.heightData.length > 0) {
      const lastHeight = this.heightData[this.heightData.length - 1];
      if (this.height < lastHeight) {
        alert('Height cannot be less than the previous entry.');
        this.loading = false;
        return;
      }
    }
    formData.append('height', this.height.toString());
    formData.append('weight', this.weight.toString());

    this.loading = true;
    this.progressService.createProgress(formData).subscribe({
      next: () => {
        this.height = 0;
        this.weight = 0;
        this.selectedFile = null;
        this.selectedFilePreview = null;
        this.loadProgressData();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        alert('Upload failed');
      },
    });
  }
}
