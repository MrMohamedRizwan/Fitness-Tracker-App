import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  effect,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { Quotes } from '../quotes/quotes';
import { PlanAssignmentService } from '../../../services/PlanAssignmentService';
import { Router } from '@angular/router';
import { ClientService } from '../../../services/ClientService';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../../services/NotificationService';
import { ProgressService } from '../../../services/ProgressService';

@Component({
  selector: 'app-client-dashboard',
  standalone: true,
  imports: [Quotes, CommonModule],
  templateUrl: './client-dashboard.html',
  styleUrls: ['./client-dashboard.css'], // ✅ corrected `styleUrl` → `styleUrls`
})
export class ClientDashboard implements OnInit, OnDestroy, AfterViewInit {
  notificationList: string[] = [];
  constructor(
    private clientService: ClientService,
    private planAssignmentService: PlanAssignmentService,
    private progressSevice: ProgressService,
    private router: Router,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) {
    effect(() => {
      const notification = this.notificationService.notification();
      if (notification) {
        // ✅ Avoid change detection conflict
        setTimeout(() => {
          this.notificationList.push(notification.message);
          this.progressList = [notification.message, ...this.progressList];
          this.cdr.detectChanges();
        });
      }
    });
  }

  private reminderInterval: any;
  setupDrinkWaterReminder() {
    this.reminderInterval = setInterval(() => {
      const reminder = 'Drink water';
      this.notificationList.push(reminder);
      this.progressList = [reminder, ...this.progressList];
      this.cdr.detectChanges();
    }, 60 * 1000);
  }

  signalRNotification() {
    const notification = this.notificationService.notification();
    if (notification) {
      setTimeout(() => {
        this.notificationList.push(notification.message);
        this.progressList = [notification.message, ...this.progressList];
        this.cdr.detectChanges();
      });
    }
  }
  clientId: string | null = null;
  progressList = ['Welcome'];
  ngAfterViewInit(): void {
    const now = new Date();
    // Example: Show reminder at 10 AM
    console.log('Current time:', now.toLocaleTimeString());
    if (now.getHours() === 10) {
      this.progressList = ['Drink water', ...this.progressList];
      this.cdr.detectChanges();
    }
  }
  clientDetails: any;
  client = signal<any>(null);
  allPlans = signal<any[]>([]);
  workoutPlans = signal<any[]>([]);
  dietPlans = signal<any[]>([]);
  weightChange: any;
  user = {
    name: 'Rizwan',
    height: 175,
    currentWeight: 72,
    goalWeight: 68,
  };
  selectedWorkoutDetails: any = null;
  showWorkoutDetails(details: any) {
    this.selectedWorkoutDetails = details;
    console.log('Workout Details:', details);
    this.router.navigate([
      '/client-workout-plan',
      details.workoutPlanID,
      details.planAssignmentId,
    ]);
  }
  selectedDietDetails: any = null;
  showDietDetails(details: any) {
    this.selectedDietDetails = details;
    console.log('Diet Details:', details);
    this.router.navigate([
      '/client-diet-plan',
      details.dietPlanId,
      details.planAssignmentId,
    ]);
  }
  acceptPlan(details: any, val: any) {
    console.log(details.planAssignmentId);
    const payload = {
      PlanAssignmentID: details.planAssignmentId,
      status: 'On Progress',
    };
    this.planAssignmentService.AcceptPlan(payload).subscribe({
      next: (res) => {
        console.log(`${res} Response`);
        // Set the accepted plan assignment in sessionStorage
        if (val == 1) {
          sessionStorage.setItem(
            'WorkoutPlanAssignment',
            JSON.stringify({
              PlanAssignmentID: details.planAssignmentId,
              WorkoutPlanID: details.workoutPlanID,
            })
          );
        } else {
          sessionStorage.setItem(
            'DietPlanAssignment',
            JSON.stringify({
              DietPlanAssignmentID: details.planAssignmentId,
              DietPlanID: details.dietPlanId,
            })
          );
        }
      },
    });
  }
  getProgresss() {
    this.progressSevice.getAllProgress().subscribe((res) => {
      this.weightChange = res.$values[0].weightChangeSummary;
      console.log(this.weightChange);
    });
  }
  ngOnInit(): void {
    this.setupDrinkWaterReminder();
    this.getProgresss();
    this.signalRNotification();
    this.clientService.getMyDetails().subscribe({
      next: (res) => {
        const clientData = res.message;
        if (!clientData) {
          console.error('❌ No client data found');
          return;
        }
        console.log(clientData);

        this.client.set(clientData);
        // console.
        this.clientDetails = clientData;
        this.cdr.detectChanges(); // 🔁 Ensure view updates before next logic
      },
      error: (err) => {
        console.error('❌ Error fetching client data:', err);
      },
    });
    this.getAssignedPlans(); // 🔁 safe to call now
  }

  ngOnDestroy(): void {
    this.notificationService.stopConnection(); // optional cleanup

    if (this.reminderInterval) {
      clearInterval(this.reminderInterval);
    }
  }

  getAssignedPlans(): void {
    this.planAssignmentService.getPlans().subscribe({
      next: (res) => {
        const plans = '$values' in res ? (res.$values as any[]) : [];
        this.allPlans.set(plans);

        const sortedByDate = plans
          .filter((p) => p.assignedOn)
          .sort(
            (a, b) =>
              new Date(b.assignedOn).getTime() -
              new Date(a.assignedOn).getTime()
          );

        const latestWorkoutPlan = sortedByDate.find(
          (p) => p.workoutPlanTitle && p.workoutPlanTitle !== 'Not Assigned'
        );
        const latestDietPlan = sortedByDate.find(
          (p) => p.dietPlanTitle && p.dietPlanTitle !== 'Not Assigned'
        );

        this.workoutPlans.set(latestWorkoutPlan ? [latestWorkoutPlan] : []);
        this.dietPlans.set(latestDietPlan ? [latestDietPlan] : []);
      },
      error: (err) => {
        console.error('❌ Failed to fetch plans:', err);
        this.allPlans.set([]);
        this.workoutPlans.set([]);
        this.dietPlans.set([]);
      },
    });
  }
}
