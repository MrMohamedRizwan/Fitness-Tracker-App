import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { WorkoutPlanService } from '../../../services/WorkoutPlanService';
import { Router } from '@angular/router';

@Component({
  selector: 'app-view-plan',
  imports: [CommonModule, FormsModule],
  templateUrl: './view-plan.html',
  styleUrl: './view-plan.css',
})
export class ViewPlan implements OnInit {
  constructor(
    private workoutService: WorkoutPlanService,
    private router: Router
  ) {}
  plans = signal<any | null>(null);
  searchTerm: string = '';

  ngOnInit(): void {
    var x = this.workoutService.GetAllWorkouts().subscribe((res) => {
      this.plans.set(res.items.$values);
      console.log(this.plans());
    });
    console.log(x);
  }
  showDetails(details: any) {
    this.router.navigate(['/workout-details', details.id]);
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
}
