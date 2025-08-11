import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ClientService } from '../../../services/ClientService';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CalenderComponent } from '../../calender-component/calender-component';
import { CoachService } from '../../../services/CoachService';

@Component({
  selector: 'app-client-progress',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatInputModule,
    CalenderComponent,
  ],
  templateUrl: './client-progress.html',
  styleUrl: './client-progress.css',
})
export class ClientProgress implements OnInit {
  allPlans = signal<any[]>([]);
  workoutPlans = signal<any[]>([]);
  dietPlans = signal<any[]>([]);
  client = signal<any>(null);

  clientId!: string;
  clientDetails: any;

  constructor(
    private route: ActivatedRoute,
    private clientService: ClientService,
    private coachService: CoachService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.clientId = this.route.snapshot.paramMap.get('clientId')!;
    this.loadClientDetails(this.clientId);
  }

  loadClientDetails(clientId: string): void {
    this.clientService.getClientById(clientId).subscribe({
      next: (res) => {
        const clientData = res.message?.$values?.[0];
        if (clientData) {
          this.client.set(clientData);
          this.clientDetails = clientData;
          this.getAssignedPlans();
        }
      },
      error: (err) => {
        console.error('❌ Failed to fetch client details:', err);
      },
    });
  }

  getAssignedPlans(): void {
    const email = this.clientDetails?.email;
    if (!email) return;

    this.clientService.getAssignedPlans(email).subscribe({
      next: (res) => {
        const plans = (res as { $values?: any[] })?.$values || [];
        this.allPlans.set(plans);

        this.workoutPlans.set(
          plans.filter(
            (p) => p.workoutPlanTitle && p.workoutPlanTitle !== 'Not Assigned'
          )
        );

        this.dietPlans.set(
          plans.filter(
            (p) => p.dietPlanTitle && p.dietPlanTitle !== 'Not Assigned'
          )
        );
      },
      error: (err) => {
        console.error('❌ Failed to fetch assigned plans:', err);
        this.allPlans.set([]);
        this.workoutPlans.set([]);
        this.dietPlans.set([]);
      },
    });
  }

  cancelPlan(planId: string, type: 'workout' | 'diet'): void {
    if (!confirm('Are you sure you want to cancel this plan?')) return;

    this.coachService.deleteAssignedPlans(planId).subscribe({
      next: (res) => {
        console.log(`✅ ${type} plan cancelled:`, res);
        this.getAssignedPlans(); // Refresh list after deletion
      },
      error: (err) => {
        console.error(`❌ Failed to cancel ${type} plan:`, err);
      },
    });
  }

  markAsCompleted(planId: string, type: 'workout' | 'diet'): void {
    this.coachService.markPlanAsCompleted(planId).subscribe({
      next: (res) => {
        console.log(`✅ ${type} plan marked as completed:`, res);
        this.getAssignedPlans(); // Refresh list
      },
      error: (err) => {
        console.error(`❌ Failed to mark ${type} plan as completed:`, err);
      },
    });
  }

  progressButton(): void {
    this.router.navigate(['/clientProgress', this.clientId]);
  }

  showAllPlans(): void {
    const modalEl = document.getElementById('allPlansModal');
    if (modalEl) {
      // @ts-ignore - using Bootstrap modal JS API
      const modal = new (window as any).bootstrap.Modal(modalEl);
      modal.show();
    }
  }

  onDateChange(event: any): void {
    console.log('📅 Selected date:', event.value);
  }
}
