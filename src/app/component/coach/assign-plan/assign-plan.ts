import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { CoachService } from '../../../services/CoachService';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from '../../../services/ToastService';

@Component({
  selector: 'app-assign-plan',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './assign-plan.html',
  styleUrl: './assign-plan.css',
})
export class AssignPlan implements OnInit {
  form: FormGroup;
  selectedClient: string = '';
  selectedWorkoutPlan: string = '';
  selectedDietPlan: string = '';
  isSubmitting = false;

  clients: any[] = [];

  workoutPlans: any[] = [];
  dueDate: any;
  dietPlans: any[] = [];

  filteredClients: any[] = [];
  filteredWorkouts: any[] = [];
  filteredDiets: any[] = [];

  searchClient = '';
  searchWorkout = '';
  searchDiet = '';

  constructor(
    private fb: FormBuilder,
    private coachService: CoachService,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    private router: Router,
    private toastService: ToastService
  ) {
    this.form = this.fb.group({});
  }

  ngOnInit(): void {
    const clientId = this.route.snapshot.paramMap.get('clientId');
    if (clientId) {
      this.selectedClient = clientId;
    }

    this.fetchClients();
    this.fetchWorkouts();
    this.fetchDiets();
  }
  selectedClientDetails: any = null;

  showDetails(details: any) {
    this.selectedClientDetails = details;

    if (details && details.email) {
      this.router.navigate(['/client-details', details.id]);
    } else if (details && details.exercises) {
      this.router.navigate(['/workout-details', details.id]);
    } else if (details && details.mealTypes) {
      this.router.navigate(['/diet-details', details.id]);
    }
    console.log('Client Details:', details);
  }
  fetchClients() {
    this.coachService.getClientsList().subscribe({
      next: (res) => {
        this.clients = res.items.$values;
        console.log('Fetched clients:', this.clients);
        this.filterList();
        this.cdr.detectChanges(); // ✅ force update
      },
      error: (err) => {
        console.error('Error fetching clients:', err);
      },
    });
  }

  fetchWorkouts() {
    this.coachService.getWorkouts().subscribe({
      next: (res) => {
        this.workoutPlans = res.items.$values;
        console.log('Fetched workoutPlans:', this.workoutPlans);
        this.filteWorkkoutList();
        this.cdr.detectChanges(); // ✅ force update
      },
      error: (err) => {
        console.error('Error fetching workoutPlans:', err);
      },
    });
  }

  fetchDiets() {
    this.coachService.getDiets().subscribe({
      next: (res) => {
        this.dietPlans = res.items.$values;
        console.log('Fetched dietPlans:', this.dietPlans);
        this.filteDietList();
        this.cdr.detectChanges(); // ✅ force update
      },
      error: (err) => {
        console.error('Error fetching dietPlans:', err);
      },
    });
  }

  filterList() {
    this.filteredClients = this.clients.filter((c) =>
      c.name.toLowerCase().includes(this.searchClient.toLowerCase())
    );
  }

  filteWorkkoutList() {
    this.filteredWorkouts = this.workoutPlans.filter((w) =>
      w.title.toLowerCase().includes(this.searchWorkout.toLowerCase())
    );
  }
  filteDietList() {
    this.filteredDiets = this.dietPlans.filter((d) =>
      d.title.toLowerCase().includes(this.searchDiet.toLowerCase())
    );
  }

  async onSubmit() {
    console.log(
      this.selectedClient,
      this.selectedWorkoutPlan,
      this.selectedDietPlan
    );
    if (
      !this.selectedClient ||
      !this.selectedWorkoutPlan ||
      !this.selectedDietPlan
    ) {
      alert('Please select a client, workout plan, and diet plan.');
      return;
    }

    this.isSubmitting = false;

    const selectedClient = this.clients.find(
      (c) => c.id === this.selectedClient
    );
    const selectedWorkout = this.workoutPlans.find(
      (w) => w.id === this.selectedWorkoutPlan
    );
    const selectedDiet = this.dietPlans.find(
      (d) => d.id === this.selectedDietPlan
    );
    const selectDueDate = this.dueDate;

    const Workoutpayload = {
      clientEmail: selectedClient.email,
      WorkoutPlanID: selectedWorkout.id,
      // DietPlanID: '',
      dueDate: selectDueDate,
    };
    const DietPayload = {
      clientEmail: selectedClient.email,
      // WorkoutPlanID: '',
      DietPlanID: selectedDiet.id,
      dueDate: selectDueDate,
    };
    // console.log(payload);

    this.coachService.assignPlanToClient(Workoutpayload).subscribe({
      next: () => {
        this.selectedClient = '';
        this.selectedWorkoutPlan = '';
        this.selectedDietPlan = '';
        this.selectedClientDetails = '';

        this.toastService.showToast('Successful', 'Plan Assigned', 'success');
        this.isSubmitting = false;
        alert('Plans successfully assigned!');
      },
      error: (err) => {
        console.error('Failed to assign plan:', err);
        this.toastService.showToast('Failed', err, 'error');
        alert('Failed to assign Workout plan. Please try again.');
      },
      complete: () => {
        this.isSubmitting = false;
      },
    });
    this.coachService.assignPlanToClient(DietPayload).subscribe({
      next: () => {
        this.toastService.showToast('Successful', 'Plan Assigned', 'success');
        this.selectedClient = '';
        this.selectedWorkoutPlan = '';
        this.selectedDietPlan = '';
        this.selectedClientDetails = '';
        this.isSubmitting = false;
        alert('Plans successfully assigned!');
      },
      error: (err) => {
        console.error('Failed to assign plan:', err);
        this.toastService.showToast('Failed', err, 'error');
        alert('Failed to assign Diet plan. Please try again.');
      },
      complete: () => {
        this.isSubmitting = false;
      },
    });
  }
}
