import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-client-sidebar',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './client-sidebar.html',
  styleUrl: './client-sidebar.css',
})
export class ClientSidebar {
  constructor(private router: Router) {
    console.log('ClientSideBar');
  }
  links = [
    { to: '/client-dashboard', icon: 'bi bi-speedometer2', label: 'Dashboard' },

    {
      to: '/myPlans',
      icon: 'bi bi-journal-medical',
      label: 'My Plans',
    },

    {
      to: '/progress',
      icon: 'bi bi-graph-up-arrow', // progress icon
      label: 'Progress',
    },
    {
      to: '/stats-analytics',
      icon: 'bi bi-bar-chart-line-fill',
      label: 'Stats & Analytics',
    },
    {
      to: '/chatClient',
      icon: 'bi bi-chat-fill',
      label: 'Chat with coach',
    },
  ];

  handleLogout() {
    localStorage.clear(); // Or call your auth service
    this.router.navigate(['/']);
  }
}
