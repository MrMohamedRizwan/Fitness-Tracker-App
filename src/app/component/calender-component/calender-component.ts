import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { WorkoutLogService } from '../../services/WorkoutLogService';
import { createGlobalPositionStrategy } from '@angular/cdk/overlay';
declare var bootstrap: any;

@Component({
  selector: 'app-calender-component',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './calender-component.html',
  styleUrl: './calender-component.css',
})
export class CalenderComponent implements OnInit {
  parseJSON(json: string): any[] {
    try {
      return JSON.parse(json);
    } catch (error) {
      console.error('❌ Failed to parse exerciseJSON:', error);
      return [];
    }
  }

  @Input() clientId!: string;

  constructor(
    private workoutLogService: WorkoutLogService,
    private cdRef: ChangeDetectorRef
  ) {}

  currentDate = new Date(); // represents the current month/year
  daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  workoutLogs: any[] = [];
  workoutDates: string[] = []; // ISO dates with workouts
  workoutIds: Record<string, string[]> = {};

  daysInMonth: Date[] = [];

  selectedDate: Date | null = null;
  selectedWorkoutLogs: any[] = [];

  ngOnInit(): void {
    this.setMonthDays();
    this.getWorkoutLogsOfClient();
    this.setCurrentWeek();
  }

  setMonthDays() {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const totalDays = lastDay.getDate();

    this.daysInMonth = Array.from({ length: totalDays }, (_, i) => {
      return new Date(year, month, i + 1);
    });
  }

  getWorkoutLogsOfClient() {
    this.workoutLogService.getWorkoutLog(this.clientId).subscribe({
      next: (res) => {
        this.workoutLogs = res.$values || [];

        this.workoutIds = this.workoutLogs.reduce(
          (acc: Record<string, string[]>, log: any) => {
            const date = log.date ? log.date.split('T')[0] : null;
            if (date) {
              if (!acc[date]) acc[date] = [];
              acc[date].push(log.id);
            }
            return acc;
          },
          {}
        );

        this.workoutDates = Object.keys(this.workoutIds);
      },
      error: (err) => {
        console.error(err);
      },
    });
  }

  goToPreviousMonth() {
    this.currentDate.setMonth(this.currentDate.getMonth() - 1);
    this.setMonthDays();
  }

  goToNextMonth() {
    this.currentDate.setMonth(this.currentDate.getMonth() + 1);
    this.setMonthDays();
  }

  hasWorkoutEntry(date: Date): boolean {
    const iso = date.toISOString().split('T')[0];
    return this.workoutDates.includes(iso);
  }

  onDateClick(date: Date) {
    this.selectedDate = date;
    const isoDate = date.toISOString().split('T')[0];
    const workoutIdsForDate = this.workoutIds?.[isoDate] || [];

    this.selectedWorkoutLogs = [];

    if (workoutIdsForDate.length > 0) {
      let pending = workoutIdsForDate.length;

      for (const wId of workoutIdsForDate) {
        this.workoutLogService.getWorkoutLogByid(wId).subscribe({
          next: (res) => {
            this.selectedWorkoutLogs.push(res);
            this.cdRef.detectChanges();
            pending--;
            if (pending === 0) this.openModal();
          },
          error: (err) => {
            console.error(err);
            pending--;
            if (pending === 0) this.openModal();
          },
        });
      }
    } else {
      this.openModal();
    }
  }

  openModal() {
    const modalElement = document.getElementById('workoutLogModal');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  currentWeekDates: Date[] = [];

  setCurrentWeek() {
    const startOfWeek = this.getStartOfWeek(this.currentDate);
    this.currentWeekDates = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(startOfWeek);
      d.setDate(d.getDate() + i);
      return d;
    });
  }

  getStartOfWeek(date: Date): Date {
    const day = date.getDay(); // 0 = Sunday
    const diff = date.getDate() - day;
    return new Date(date.getFullYear(), date.getMonth(), diff);
  }

  goToPreviousWeek() {
    this.currentDate.setDate(this.currentDate.getDate() - 7);
    this.setCurrentWeek();
  }

  goToNextWeek() {
    this.currentDate.setDate(this.currentDate.getDate() + 7);
    this.setCurrentWeek();
  }
  getMonthYear(): string {
    return this.currentDate.toLocaleString('default', {
      month: 'long',
      year: 'numeric',
    });
  }
}
