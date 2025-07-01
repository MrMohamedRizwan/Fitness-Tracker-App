import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
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
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './create-plan.html',
  styleUrl: './create-plan.css',
})
export class CreatePlan {
  planForm: FormGroup;
  planType = '';
  submitted = false;

  constructor(
    private fb: FormBuilder,
    private workoutService: WorkoutPlanService,
    private dietService: DietPlanService
  ) {
    this.planForm = this.fb.group({
      planType: ['workout', Validators.required],
      durationInWeeks: ['4', Validators.required],
      planName: ['Full Body Weight Loss Plan', Validators.required],
      description: [
        'A 4-week program focusing on overall strength and conditioning for beginners.',
        Validators.required,
      ],
      exercises: this.fb.array([
        this.fb.group({
          name: ['Push-ups', Validators.required],
          sets: ['3'],
          reps: ['15'],
          restSeconds: ['60'],
          notes: ['Keep your back straight and go all the way down.'],
        }),
      ]),
      meals: this.fb.array([
        this.fb.group({
          name: ['Enter Meal Name', Validators.required],
          mealType: [''],
          calories: [''],
          protein: [''],
          carbs: [''],
          fats: [''],
        }),
      ]),
    });

    // this.addExercise();
    // this.addMeal();
  }

  get exercises() {
    return this.planForm.get('exercises') as FormArray;
  }

  get meals() {
    return this.planForm.get('meals') as FormArray;
  }

  addExercise() {
    this.exercises.push(
      this.fb.group({
        name: ['', Validators.required],
        sets: [''],
        reps: [''],
        restSeconds: [''],
        notes: [''],
      })
    );
  }

  removeExercise(index: number) {
    this.exercises.removeAt(index);
  }

  addMeal() {
    this.meals.push(
      this.fb.group({
        name: ['', Validators.required],
        mealType: [''],
        calories: [''],
        protein: [''],
        carbs: [''],
        fats: [''],
      })
    );
  }

  removeMeal(index: number) {
    this.meals.removeAt(index);
  }

  onPlanTypeChange(value: string) {
    this.planType = value;
  }
  resetForm() {
    this.planForm.reset();
    this.planForm.get('planType')?.setValue(this.planType);
    this.exercises.clear();
    this.meals.clear();
    this.addExercise();
    this.addMeal();
    this.submitted = false;
  }

  onSubmit() {
    this.submitted = true;

    if (this.planForm.valid) {
      const formValue = this.planForm.value;

      const planPayload = {
        title: formValue.planName,
        description: formValue.description,
        durationInWeeks: Number(formValue.durationInWeeks),
        exercises: formValue.exercises,
        meals: formValue.meals,
      };
      console.log(this.planType);

      if (this.planForm.get('planType')?.value === 'workout') {
        this.workoutService.addWorkoutPlan(planPayload).subscribe({
          next: () => {
            alert('Workout plan created successfully.');
            this.resetForm();
          },
          error: (err) => console.error('Workout plan creation failed:', err),
        });
      } else {
        console.log('DietPlan API');

        this.dietService.addDietPlan(planPayload).subscribe({
          next: () => {
            alert('Diet plan created successfully.');
            this.resetForm();
          },
          error: (err) => console.error('Diet plan creation failed:', err),
        });

        alert(
          `${
            this.planType === 'workout' ? 'Workout' : 'Diet'
          } plan created successfully.`
        );
        // this.planForm.reset();
        // this.planForm.get('planType')?.setValue(this.planType);
        // this.exercises.clear();
        // this.meals.clear();
        // this.addExercise();
        // this.addMeal();
        // console.log('Submitted');

        // this.submitted = false;
      }
    }
  }
}
