import { ChangeDetectorRef, Component, OnInit, signal } from '@angular/core';
import { PlanAssignmentService } from '../../../services/PlanAssignmentService';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-my-plans',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './my-plans.html',
  styleUrls: ['./my-plans.css'],
})
export class MyPlans implements OnInit {
  // Signals to track plan data
  allPlans = signal<any[]>([]);
  workoutPlans = signal<any[]>([]);
  dietPlans = signal<any[]>([]);

  constructor(
    private planAssignmentService: PlanAssignmentService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.fetchPlanAssignment();
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
      error: (err) => {
        console.error('❌ Failed to Accept plans:', err);
        alert(err);
      },
    });
  }

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

  fetchPlanAssignment() {
    this.planAssignmentService.getPlans().subscribe({
      next: (res) => {
        const plans = '$values' in res ? (res.$values as any[]) : [];

        this.allPlans.set(plans);

        this.workoutPlans.set(
          plans.filter(
            (p) => p.workoutPlanTitle && p.workoutPlanTitle !== 'Not Assigned'
          )
        );

        this.dietPlans.set(
          plans.filter(
            (p) => p.dietPlanTitle && p.dietPlanTitle !== 'Not Assigned'
          )
        );
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
