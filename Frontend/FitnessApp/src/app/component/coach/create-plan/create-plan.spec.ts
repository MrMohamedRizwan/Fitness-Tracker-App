import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { WorkoutPlanService } from '../../../services/WorkoutPlanService';
import { DietPlanService } from '../../../services/DietPlanService';

@Component({
  selector: 'app-create-diet-plan',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './create-plan.html',
  styleUrl: './create-plan.css',
})
export class CreatePlan {
  planForm: FormGroup;
  planType = 'workout'; // Default value
  submitted = false;

  constructor(
    private fb: FormBuilder,
    private workoutService: WorkoutPlanService,
    private dietService: DietPlanService
  ) {
    this.planForm = this.fb.group({
      planType: [this.planType, Validators.required],
      durationInWeeks: ['4', Validators.required],
      planName: ['Full Body Weight Loss Plan', Validators.required],
      description: [
        'A 4-week program focusing on overall strength and conditioning for beginners.',
        Validators.required,
      ],
      exercises: this.fb.array([this.createExerciseGroup()]),
      meals: this.fb.array([this.createMealGroup()]),
    });
  }

  get exercises(): FormArray {
    return this.planForm.get('exercises') as FormArray;
  }

  get meals(): FormArray {
    return this.planForm.get('meals') as FormArray;
  }

  createExerciseGroup(): FormGroup {
    return this.fb.group({
      name: ['', Validators.required],
      sets: [''],
      reps: [''],
      restSeconds: [''],
      caloriesBurnt: [''],
      notes: [''],
    });
  }

  createMealGroup(): FormGroup {
    return this.fb.group({
      mealName: ['', Validators.required],
      mealType: [''],
      calories: [''],
      proteinGrams: [''],
      carbsGrams: [''],
      fatGrams: [''],
    });
  }

  addExercise(): void {
    this.exercises.push(this.createExerciseGroup());
  }

  removeExercise(index: number): void {
    this.exercises.removeAt(index);
  }

  addMeal(): void {
    this.meals.push(this.createMealGroup());
  }

  removeMeal(index: number): void {
    this.meals.removeAt(index);
  }

  onPlanTypeChange(value: string): void {
    this.planType = value;
    this.planForm.get('planType')?.setValue(value);
  }

  resetForm(): void {
    this.planForm.reset();
    this.planForm.get('planType')?.setValue(this.planType);

    this.exercises.clear();
    this.meals.clear();

    this.addExercise();
    this.addMeal();

    this.submitted = false;
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.planForm.invalid) return;

    const { planName, description, durationInWeeks, exercises, meals } =
      this.planForm.value;

    const planPayload = {
      title: planName,
      description,
      durationInWeeks: Number(durationInWeeks),
      exercises,
      meals,
    };

    const isWorkout = this.planForm.get('planType')?.value === 'workout';

    const serviceCall = isWorkout
      ? this.workoutService.addWorkoutPlan(planPayload)
      : this.dietService.addDietPlan(planPayload);

    serviceCall.subscribe({
      next: () => {
        alert(`${isWorkout ? 'Workout' : 'Diet'} plan created successfully.`);
        this.resetForm();
      },
      error: (err) => {
        console.error(
          `${isWorkout ? 'Workout' : 'Diet'} plan creation failed:`,
          err
        );
      },
    });
  }
}
