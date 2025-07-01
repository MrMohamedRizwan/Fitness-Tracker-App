import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-caoch-sidebar',
  imports: [CommonModule, RouterModule],
  templateUrl: './caoch-sidebar.html',
  styleUrl: './caoch-sidebar.css',
})
export class CaochSidebar {
  constructor(private router: Router) {}

  links = [
    { to: '/coach-dashboard', icon: 'bi bi-activity', label: 'Dashboard' },
    { to: '/clients-list', icon: 'bi bi-people-fill', label: 'My Clients' },
    {
      to: '/assign-plan',
      icon: 'bi bi-plus-circle-fill',
      label: 'Assign Plan',
    },
    {
      to: '/create-plan',
      icon: 'bi bi-file-earmark-text-fill',
      label: 'Create Plan',
    },
    {
      to: '/view-workout-plan',
      icon: 'bi bi-eye-fill', // Changed to an "eye" icon for viewing
      label: 'View Workout Plans',
    },
    {
      to: '/view-diet-plan',
      icon: 'bi bi-eye-fill', // Changed to an "eye" icon for viewing
      label: 'View Diet Plans',
    },
  ];

  handleLogout() {
    localStorage.clear(); // Or call your auth service
    this.router.navigate(['/']);
  }
}
