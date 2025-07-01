import { Component, OnInit, signal } from '@angular/core';
import { DietPlanService } from '../../../services/DietPlanService';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-view-diet-plan',
  imports: [CommonModule, FormsModule],
  templateUrl: './view-diet-plan.html',
  styleUrl: './view-diet-plan.css',
})
export class ViewDietPlan implements OnInit {
  constructor(private dietService: DietPlanService, private router: Router) {}

  plans = signal<any[] | null>(null);
  searchTerm: string = '';

  ngOnInit(): void {
    this.dietService.GetAllDiets().subscribe((res) => {
      this.plans.set(res.items.$values);
      console.log(this.plans());
    });
  }

  filteredPlans(): any[] {
    const allPlans = this.plans();
    if (!allPlans) return [];

    if (!this.searchTerm.trim()) return allPlans;

    const term = this.searchTerm.toLowerCase();
    return allPlans.filter(
      (plan: { title: string; description: string }) =>
        plan.title?.toLowerCase().includes(term) ||
        plan.description?.toLowerCase().includes(term)
    );
  }

  showDetails(plan: any): void {
    this.router.navigate(['/diet-details', plan.id]);
  }
}
