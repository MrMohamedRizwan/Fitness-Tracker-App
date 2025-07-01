import { Component, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ClientService } from '../../../services/ClientService';
import { WorkoutPlanService } from '../../../services/WorkoutPlanService';
import { CommonModule } from '@angular/common';
import { WorkoutPlan } from '../../../models/WorkoutPlan';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-workout-details',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './workout-details.html',
  styleUrl: './workout-details.css',
})
export class WorkoutDetails {
  workoutName!: string;
  workoutForm!: FormGroup;
  workout = signal<any | null>(null);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private workoutService: WorkoutPlanService
  ) {}
  isEditing = false;

  //@Input() workoutId!: string;
  //@Input() coachId?: string;
  ngOnInit(): void {
    // this.workoutName = this.route.snapshot.params['workoutId'];
    // this.workoutService
    //   .GetParticularWorkout(this.workoutName)
    //   .subscribe((res) => {
    //     this.workout = res;
    //     console.log(this.workout);
    //   });
    this.route.params.subscribe((params) => {
      this.workoutName = params['workoutId'];
      this.workoutService
        .GetParticularWorkout(this.workoutName)
        .subscribe((res) => {
          this.workout.set(res);
          console.log(this.workout());
        });
    });
  }

  editWorkout(formData: any): void {
    const updatedWorkout = {
      ...this.workout(),
      title: formData.title,
      description: formData.description,
      durationInWeeks: formData.durationInWeeks,
      exercises: this.workout()?.exercises, // already updated via two-way binding
    };

    // this.router.navigate(['/edit-workout', this.workoutName]);
    console.log('Edit Workout');
  }

  deleteWorkout(): void {
    if (confirm('Are you sure you want to delete this workout plan?')) {
      this.workoutService.deleteWorkoutPlan(this.workoutName).subscribe(() => {
        alert('Workout plan deleted successfully!');
        // this.router.navigate(['/workouts']);
      });
    }
  }
}
