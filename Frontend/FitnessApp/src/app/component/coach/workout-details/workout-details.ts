import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { WorkoutPlanService } from '../../../services/WorkoutPlanService';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-workout-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './workout-details.html',
  styleUrl: './workout-details.css',
})
export class WorkoutDetails implements OnInit {
  workoutId!: string;
  workout = signal<any | null>(null);
  isEditing = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private workoutService: WorkoutPlanService
  ) {}

  ngOnInit(): void {
    this.workoutId = this.route.snapshot.params['workoutId'];
    this.loadWorkout();
  }

  loadWorkout(): void {
    this.workoutService.GetParticularWorkout(this.workoutId).subscribe({
      next: (res) => {
        this.workout.set(res);
        console.log('✅ Loaded workout:', res);
      },
      error: (err) => {
        console.error('❌ Failed to load workout:', err);
        alert('Error loading workout plan.');
      },
    });
  }

  workoutData() {
    return this.workout();
  }

  editWorkout(formData: any): void {
    const updated = this.workout();
    if (!updated) return;

    const updatedWorkout = {
      ...updated,
      title: formData.title,
      description: formData.description,
      durationInWeeks: formData.durationInWeeks,
      exercises: updated.exercises?.$values || [],
    };

    this.workoutService
      .updateWorkoutPlan(this.workoutId, updatedWorkout)
      .subscribe({
        next: () => {
          alert('✅ Workout plan updated!');
          this.isEditing = false;
          this.loadWorkout(); // reload updated data
        },
        error: (err) => {
          console.error('❌ Update failed:', err);
          alert('Failed to update workout plan.');
        },
      });
  }

  cancelEdit(): void {
    this.isEditing = false;
    this.loadWorkout();
  }

  addExercise(): void {
    const current = this.workout();
    if (!current || !current.exercises?.$values) return;

    current.exercises.$values.push({
      name: '',
      sets: 0,
      reps: 0,
      restSeconds: 0,
      caloriesBurnt: 0,
      notes: '',
    });

    this.workout.set({ ...current });
  }

  removeExercise(index: number): void {
    const current = this.workout();
    if (!current || !current.exercises?.$values) return;

    current.exercises.$values.splice(index, 1);
    this.workout.set({ ...current });
  }

  deleteWorkout(): void {
    if (confirm('Are you sure you want to delete this workout plan?')) {
      this.workoutService.deleteWorkoutPlan(this.workoutId).subscribe({
        next: () => {
          alert('🗑️ Workout plan deleted!');
          this.router.navigate(['/view-workout-plan']); // adjust route
        },
        error: (err) => {
          console.error('❌ Deletion failed:', err);
          alert('Failed to delete workout.');
        },
      });
    }
  }
}
