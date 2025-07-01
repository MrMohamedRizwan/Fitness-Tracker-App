import { Component, OnInit, signal } from '@angular/core';
import { DietPlanService } from '../../../services/DietPlanService';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WorkoutPlanService } from '../../../services/WorkoutPlanService';

@Component({
  selector: 'app-diet-plan',
  imports: [CommonModule, FormsModule],
  templateUrl: './diet-plan.html',
  styleUrl: './diet-plan.css',
})
export class DietPlan implements OnInit {
  planAssignmentId: any;
  DietPlan = signal<any>(null);
  completedMeals = signal<Set<string>>(new Set());
  showAddForm = signal(false);
  newMeal = {
    mealType: '',
    mealName: '',
    calories: 0,
  };

  constructor(
    private route: ActivatedRoute,
    private dietPlanService: DietPlanService
  ) {}

  ngOnInit(): void {
    const dietPlanId = this.route.snapshot.paramMap.get('dietPlanId');
    this.planAssignmentId =
      this.route.snapshot.paramMap.get('planAssignemnetId');
    this.getDietPlanDetails(dietPlanId);
  }
  addNewMeal(): void {
    const plan = this.DietPlan();
    const meal = {
      id: crypto.randomUUID(),
      ...this.newMeal,
      proteinGrams: 0,
      carbsGrams: 0,
      fatGrams: 0,
    };

    if (!plan.mealTypes?.$values) {
      plan.mealTypes = { $values: [] };
    }

    plan.mealTypes.$values.push(meal);
    this.DietPlan.set({ ...plan });

    this.newMeal = { mealType: '', mealName: '', calories: 0 };
    this.showAddForm.set(false);
  }

  deleteMeal(id: string): void {
    const plan = this.DietPlan();
    plan.mealTypes.$values = plan.mealTypes.$values.filter(
      (m: any) => m.id !== id
    );
    this.DietPlan.set({ ...plan });

    const updated = new Set(this.completedMeals());
    updated.delete(id);
    this.completedMeals.set(updated);
  }

  getDietPlanDetails(dietPlanId: any) {
    this.dietPlanService.GetParticularDiet(dietPlanId).subscribe({
      next: (res) => this.DietPlan.set(res),
      error: (err) => console.error(err),
    });
  }

  toggleMeal(mealId: string): void {
    const updated = new Set(this.completedMeals());
    updated.has(mealId) ? updated.delete(mealId) : updated.add(mealId);
    this.completedMeals.set(updated);
  }

  isCompleted(mealId: string): boolean {
    return this.completedMeals().has(mealId);
  }

  submitDiet(): void {
    const plan = this.DietPlan();
    const completedSet = this.completedMeals();
    const meals = plan?.mealTypes?.$values || [];

    const completedMeals = meals.filter((meal: any) =>
      completedSet.has(meal.id)
    );

    const totalCalories = completedMeals.reduce(
      (sum: number, meal: any) => sum + (meal.calories || 0),
      0
    );

    const completedData = completedMeals.map((meal: any) => ({
      mealId: meal.id,
      name: meal.name,
      foodItems: meal.foodItems,
      calories: meal.calories,
      timeOfDay: meal.timeOfDay,
    }));

    const payload = {
      PlanAssignmentId: this.planAssignmentId,
      completedOn: new Date().toISOString(),
      totalMeals: completedMeals.length,
      caloriesTaken: totalCalories,
      ExercisesJSON: JSON.stringify([]),
      DietMealJSON: JSON.stringify(completedData),
    };

    console.log('Diet Submission Payload:', payload);

    this.dietPlanService.SubmitDietByClient(payload).subscribe({
      next: (res) => console.log('Submitted successfully', res),
      error: (err) => console.error(err),
    });
  }
}
