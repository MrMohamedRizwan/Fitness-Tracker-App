import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DietPlanService } from '../../../services/DietPlanService';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-diet-details',
  imports: [CommonModule],
  templateUrl: './diet-details.html',
  styleUrl: './diet-details.css',
})
export class DietDetails {
  dietName!: string;
  diet: any;

  constructor(
    private route: ActivatedRoute,
    private dietService: DietPlanService
  ) {}

  ngOnInit(): void {
    this.dietName = this.route.snapshot.params['dietId'];
    this.dietService.GetParticularDiet(this.dietName).subscribe((res) => {
      this.diet = res;
      console.log(this.diet);
    });
  }
}
