import { ChangeDetectorRef, Component, OnInit, signal } from '@angular/core';
import { Quotes } from '../quotes/quotes';
import { PlanAssignmentService } from '../../../services/PlanAssignmentService';
import { Router } from '@angular/router';
import { ClientService } from '../../../services/ClientService';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-client-dashboard',
  standalone: true,
  imports: [Quotes, CommonModule],
  templateUrl: './client-dashboard.html',
  styleUrls: ['./client-dashboard.css'], // ✅ corrected `styleUrl` → `styleUrls`
})
export class ClientDashboard implements OnInit {
  constructor(
    private clientService: ClientService,
    private planAssignmentService: PlanAssignmentService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  clientId: string | null = null;
  clientDetails: any;
  client = signal<any>(null);
  allPlans = signal<any[]>([]);
  workoutPlans = signal<any[]>([]);
  dietPlans = signal<any[]>([]);

  user = {
    name: 'Rizwan',
    height: 175,
    currentWeight: 72,
    goalWeight: 68,
  };

  ngOnInit(): void {
    this.clientService.getMyDetails().subscribe({
      next: (res) => {
        const clientData = res.message;
        if (!clientData) {
          console.error('❌ No client data found');
          return;
        }
        console.log(clientData);

        this.client.set(clientData);
        // console.
        this.clientDetails = clientData;
        this.cdr.detectChanges(); // 🔁 Ensure view updates before next logic
      },
      error: (err) => {
        console.error('❌ Error fetching client data:', err);
      },
    });
    this.getAssignedPlans(); // 🔁 safe to call now
  }

  getAssignedPlans(): void {
    this.planAssignmentService.getPlans().subscribe({
      next: (res) => {
        const plans = '$values' in res ? (res.$values as any[]) : [];
        this.allPlans.set(plans);

        const sortedByDate = plans
          .filter((p) => p.assignedOn)
          .sort(
            (a, b) =>
              new Date(b.assignedOn).getTime() -
              new Date(a.assignedOn).getTime()
          );

        const latestWorkoutPlan = sortedByDate.find(
          (p) => p.workoutPlanTitle && p.workoutPlanTitle !== 'Not Assigned'
        );
        const latestDietPlan = sortedByDate.find(
          (p) => p.dietPlanTitle && p.dietPlanTitle !== 'Not Assigned'
        );

        this.workoutPlans.set(latestWorkoutPlan ? [latestWorkoutPlan] : []);
        this.dietPlans.set(latestDietPlan ? [latestDietPlan] : []);
      },
      error: (err) => {
        console.error('❌ Failed to fetch plans:', err);
        this.allPlans.set([]);
        this.workoutPlans.set([]);
        this.dietPlans.set([]);
      },
    });
  }
}
