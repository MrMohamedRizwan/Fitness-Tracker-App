import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { WorkoutPlanService } from '../../../services/WorkoutPlanService';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-workout-plan',
  imports: [CommonModule],
  templateUrl: './workout-plan.html',
  styleUrl: './workout-plan.css',
})
export class WorkoutPlan implements OnInit {
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private workoutPlanService: WorkoutPlanService
  ) {}
  planAssignmentId: any;
  Workouts = signal<any>(null);
  completedExercises = signal<Set<string>>(new Set());

  ngOnInit(): void {
    const workoutPlanId = this.route.snapshot.paramMap.get('workoutPlanId');
    this.planAssignmentId =
      this.route.snapshot.paramMap.get('planAssignemnetId');
    console.log(this.planAssignmentId);
    this.getWorkoutPlanDetails(workoutPlanId);
  }

  getWorkoutPlanDetails(workoutPlanId: any) {
    this.workoutPlanService.GetParticularWorkout(workoutPlanId).subscribe({
      next: (res) => {
        this.Workouts.set(res);
      },
      error: (err) => {
        console.error(err);
      },
    });
  }

  toggleExercise(exId: string): void {
    const updated = new Set(this.completedExercises());
    updated.has(exId) ? updated.delete(exId) : updated.add(exId);
    this.completedExercises.set(updated);
  }

  isCompleted(exId: string): boolean {
    return this.completedExercises().has(exId);
  }

  submitWorkout(): void {
    const workout = this.Workouts();
    const completedSet = this.completedExercises();
    const exercises = workout?.exercises?.$values || [];

    const completedExercises = exercises.filter((ex: any) =>
      completedSet.has(ex.id)
    );

    const totalCalories = completedExercises.reduce(
      (sum: number, ex: any) => sum + (ex.caloriesBurnt || 0) * ex.sets,
      0
    );

    const completedData = completedExercises.map((ex: any) => ({
      exerciseId: ex.id,
      name: ex.name,
      sets: ex.sets,
      reps: ex.reps,
      restSeconds: ex.restSeconds,
      calories: ex.caloriesBurnt || 0,
    }));

    const payload = {
      PlanAssignmentId: this.planAssignmentId,
      completedOn: new Date().toISOString(),
      totalExercises: completedExercises.length,
      caloriesBurnt: totalCalories,
      ExercisesJSON: JSON.stringify(completedData),
      DietMealJSON: JSON.stringify([]),
    };
    console.log('Workout Submission Payload:', payload);

    this.workoutPlanService.SubmitWorkoutByClient(payload).subscribe({
      next: (res) => {
        console.log(res);
        this.router.navigate(['client-dashboard']);
      },
      error: (err) => {
        console.error(err);
      },
    });

    // alert(
    //   `Workout submitted!\nCalories Burnt: ${totalCalories}\nExercises Completed: ${completedExercises.length}`
    // );

    // Example API call
    // this.workoutLogService.submitWorkout(payload).subscribe(...)
  }
}
