import { Component, OnInit, signal } from '@angular/core';
import { ProgressService } from '../../../services/ProgressService';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ChartOptions, ChartType } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';
import { CalenderComponent } from '../../calender-component/calender-component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-progress',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    NgChartsModule,
    CalenderComponent,
  ],
  templateUrl: './progress.html',
  styleUrl: './progress.css',
})
export class Progress implements OnInit {
  clientId = 'my';
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
  lastUploadedDate: any;

  constructor(
    private progressService: ProgressService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadProgressData();
  }

  loadProgressData() {
    this.progressService.getAllProgress().subscribe((res) => {
      this.progressList = res?.$values || [];
      this.lastUploadedDate =
        this.progressList[this.progressList.length - 1].uploadedAt;

      this.lineChartLabels = this.progressList.map((p) =>
        new Date(p.uploadedAt).toLocaleDateString()
      );
      this.heightData = this.progressList.map((p) => p.height);
      this.weightData = this.progressList.map((p) => p.weight);

      this.lineChartData = [
        { data: this.heightData, label: 'Height (cm)' },
        { data: this.weightData, label: 'Weight (kg)' },
      ];

      this.lineChartData = [...this.lineChartData];
      this.lineChartLabels = [...this.lineChartLabels];
    });
  }
  canUploadProgress(): boolean {
    if (!this.lastUploadedDate) return true;

    const lastDate = new Date(this.lastUploadedDate);
    const today = new Date();

    // Calculate the difference in days
    const diffTime = today.getTime() - lastDate.getTime();
    const diffDays = diffTime / (1000 * 3600 * 24);

    return diffDays > 5;
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

  get isFormValid(): boolean {
    if (!this.selectedFile || this.height <= 0 || this.weight <= 0)
      return false;
    if (this.heightData.length > 0) {
      const lastHeight = this.heightData[this.heightData.length - 1];
      if (this.height < lastHeight) return false;
    }
    return true;
  }

  onSubmit() {
    if (!this.isFormValid) return;

    const formData = new FormData();
    formData.append('imageFile', this.selectedFile!);

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
        this.router.navigate(['stats-analytics']);
      },
      error: () => {
        this.loading = false;
        alert('Upload failed');
      },
    });
  }
}
