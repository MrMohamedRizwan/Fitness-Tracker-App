import { Component, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DietPlanService } from '../../../services/DietPlanService';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-diet-details',
  imports: [CommonModule, FormsModule],
  templateUrl: './diet-details.html',
  styleUrl: './diet-details.css',
})
export class DietDetails {
  dietName!: string;

  dietId!: string;
  diet = signal<any | null>(null);
  isEditing = false;

  constructor(
    private route: ActivatedRoute,
    private dietService: DietPlanService
  ) {}

  ngOnInit(): void {
    this.dietName = this.route.snapshot.params['dietId'];
    this.dietService.GetParticularDiet(this.dietName).subscribe((res) => {
      this.diet.set(res);
      console.log(this.diet);
    });
  }
  saveDiet(): void {
    console.log('Save edited diet:', this.diet());
    // Call update API here if needed
    this.isEditing = false;
  }

  deleteDiet(): void {
    if (confirm('Are you sure you want to delete this diet plan?')) {
      this.dietService.deleteDietPlan(this.dietId).subscribe(() => {
        alert('Diet plan deleted successfully!');
        // redirect if needed
      });
    }
  }
}
