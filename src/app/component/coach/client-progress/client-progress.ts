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
  standalone: true,
})
export class ClientProgress implements OnInit {
  allPlans = signal<any[]>([]);
  workoutPlans = signal<any[]>([]);
  dietPlans = signal<any[]>([]);
  clientDetails: any;
  client = signal<any>(null);
  clientId: any;
  dietPlansAssigned: any;
  workoutPlansAssigned: any;
  constructor(
    private route: ActivatedRoute,
    private clientService: ClientService,
    private coachServcie: CoachService,

    private router: Router
  ) {}

  ngOnInit(): void {
    // this.clientId = this.route.snapshot.params['clientId'];
    // this.clientService.getClientById(this.clientId).subscribe((res) => {
    //   this.client = res.message.$values;
    //   console.log(this.client);
    // });
    const clientId = this.route.snapshot.paramMap.get('clientId');
    this.clientId = clientId;
    this.clientService.getClientById(clientId).subscribe((res) => {
      this.client.set(res.message.$values[0]);
      this.clientDetails = res.message.$values[0];
      // console.log(this.client());
      this.getAssignedPlans();
    });
  }

  getAssignedPlans() {
    const email = this.clientDetails.email;
    this.clientService.getAssignedPlans(email).subscribe({
      next: (res) => {
        const plans = '$values' in res ? (res.$values as any[]) : [];

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
        console.error('❌ Failed to fetch plans:', err);
        this.allPlans.set([]);
        this.workoutPlans.set([]);
        this.dietPlans.set([]);
      },
    });
  }
  cancelPlan(planId: string, type: 'workout' | 'diet') {
    console.log(`❌ Cancelling ${type} plan ${planId}`);
    if (confirm('Are you sure you want to cancel this plan?')) {
      this.coachServcie.deleteAssignedPlans(planId).subscribe({
        next: (res) => {
          console.log(res);
        },
        error: (err) => {
          console.error(err);
        },
      });
      console.log(`Plan ${planId} cancelled.`);
    } else {
      console.log('Cancellation aborted by user.');
    }
    // Call API to cancel (optional)
  }
  progressButton() {
    this.router.navigate(['/clientProgress', this.clientId]);
  }

  showAllPlans() {
    const modalEl = document.getElementById('allPlansModal');
    if (modalEl) {
      // @ts-ignore
      const modal = new (window as any).bootstrap.Modal(modalEl);
      modal.show();
    }
  }
  markAsCompleted(planId: string, type: 'workout' | 'diet') {
    console.log(`✅ Marking ${type} plan ${planId} as completed`);
    this.coachServcie.markPlanAsCompleted(planId).subscribe({
      next: (res) => {
        console.log(res);
      },
      error: (err) => {
        console.error(err);
      },
    });

    // Call API to mark completed (optional)
  }

  onDateChange(event: any): void {
    console.log('Selected date:', event.value);
  }
}
