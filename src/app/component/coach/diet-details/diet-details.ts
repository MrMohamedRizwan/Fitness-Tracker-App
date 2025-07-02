// diet-details.ts
import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DietPlanService } from '../../../services/DietPlanService';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-diet-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './diet-details.html',
  styleUrl: './diet-details.css',
})
export class DietDetails implements OnInit {
  dietId!: string;
  isEditing = false;
  diet = signal<any | null>(null);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dietService: DietPlanService
  ) {}

  ngOnInit(): void {
    this.dietId = this.route.snapshot.params['dietId'];
    this.loadDiet();
  }

  loadDiet(): void {
    this.dietService.GetParticularDiet(this.dietId).subscribe({
      next: (res) => {
        this.diet.set(res);
        console.log('📄 Diet plan loaded:', res);
      },
      error: (err) => {
        console.error('❌ Failed to load diet plan:', err);
        alert('Failed to load diet plan.');
      },
    });
  }

  dietData() {
    return this.diet();
  }

  saveDiet(formData: any): void {
    const updated = this.diet();
    if (!updated) return;

    const updatedDiet = {
      ...updated,
      title: formData.title,
      description: formData.description,
      durationInWeeks: formData.durationInWeeks,
      meals: updated.mealTypes?.$values || [],
    };

    this.dietService.updateDietPlan(this.dietId, updatedDiet).subscribe({
      next: () => {
        alert('✅ Diet plan updated successfully!');
        this.isEditing = false;
        this.loadDiet();
      },
      error: (err) => {
        console.error('❌ Update failed:', err);
        alert('Failed to update diet plan.');
      },
    });
  }

  cancelEdit(): void {
    this.isEditing = false;
    this.loadDiet();
  }

  addMeal(): void {
    const current = this.diet();
    if (!current || !current.mealTypes?.$values) return;

    current.mealTypes.$values.push({
      mealName: '',
      mealType: '',
      calories: 0,
      proteinGrams: 0,
      carbsGrams: 0,
      fatGrams: 0,
    });

    this.diet.set({ ...current });
  }

  removeMeal(index: number): void {
    const current = this.diet();
    if (!current || !current.mealTypes?.$values) return;

    current.mealTypes.$values.splice(index, 1);
    this.diet.set({ ...current });
  }

  deleteDiet(): void {
    if (confirm('Are you sure you want to delete this diet plan?')) {
      this.dietService.deleteDietPlan(this.dietId).subscribe({
        next: () => {
          alert('🗑️ Diet plan deleted successfully!');
          this.router.navigate(['/view-diet-plan']);
        },
        error: (err) => {
          console.error('❌ Deletion failed:', err);
          alert('Failed to delete diet plan.');
        },
      });
    }
  }
}
