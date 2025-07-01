import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { debounceTime } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { Coach } from '../../../models/Coach';
import { UserService } from '../../../services/UserService';
import { ClientUpdateRequestDTO } from '../../../models/ClientUpdateModel';

@Component({
  selector: 'app-client-details',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './client-details.html',
})
export class ClientDetails implements OnInit {
  updateForm!: FormGroup;
  coaches: Coach[] = [];
  filteredCoaches: Coach[] = [];

  successMessage = '';
  errorMessage = '';

  constructor(private fb: FormBuilder, private userService: UserService) {}

  ngOnInit(): void {
    this.updateForm = this.fb.group({
      gender: ['', Validators.required],
      goal: ['', Validators.required],
      height: ['', [Validators.required, Validators.min(50)]],
      weight: ['', [Validators.required, Validators.min(30)]],
      coachSearch: [''],
      coachId: ['', Validators.required],
    });

    this.loadCoaches();

    this.updateForm
      .get('coachSearch')
      ?.valueChanges.pipe(debounceTime(300))
      .subscribe((value) => {
        this.filteredCoaches = this.coaches.filter((coach) =>
          coach.name.toLowerCase().includes(value.toLowerCase())
        );
      });
  }

  loadCoaches() {
    this.userService.getAllCoaches().subscribe({
      next: (res: any) => {
        // Correctly access nested coach array
        this.coaches = res?.items?.$values || [];
        console.log('Coaches loaded:', this.coaches);
        this.filteredCoaches = this.coaches;
      },
      error: () => {
        this.errorMessage = 'Failed to load coaches.';
      },
    });
  }

  selectCoach(coach: Coach) {
    this.updateForm.patchValue({ coachId: coach.id });
  }

  onSubmit() {
    if (this.updateForm.invalid) return;

    console.log('Form submitted:', this.updateForm.value);
    const { gender, goal, height, weight, coachId } = this.updateForm.value;
    const data: ClientUpdateRequestDTO = {
      gender,
      goal,
      height,
      weight,
      coachId,
    };

    this.userService.UpdateClientDetails(data).subscribe({
      next: (res) => {
        this.successMessage = res.message;
        this.errorMessage = '';
      },
      error: (err) => {
        this.successMessage = '';
        this.errorMessage = err?.error?.message || 'Update failed';
      },
    });
  }
}
