import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin-sidebar',
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-sidebar.html',
  styleUrl: './admin-sidebar.css',
})
export class AdminSidebar {
  constructor(private router: Router) {}

  links = [
    { to: '/coaches', icon: 'bi bi-activity', label: 'Coaches' },
    { to: '/clients', icon: 'bi bi-people-fill', label: 'My Clients' },
  ];

  handleLogout() {
    localStorage.clear(); // Or call your auth service
    this.router.navigate(['/']);
  }
}
