import { ChangeDetectorRef, Component, OnInit, signal } from '@angular/core';
import { UserService } from '../../../services/UserService';
import { Coach } from '../../../models/Coach';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.css'],
})
export class AdminDashboard implements OnInit {
  coaches = signal<Coach[]>([]);
  clients = signal<any[]>([]);

  constructor(
    private userService: UserService,
    private router: Router,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadCoaches();
    this.loadClients();
  }

  viewClient(id: any) {}
  deleteClient(id: any) {}
  loadClients(): void {
    this.userService.getAllClients().subscribe({
      next: (res: any) => {
        const list = res?.$values || res?.items?.$values || [];
        this.clients.set(list);
        console.log('✅ Clients loaded:', this.clients());
      },
      error: (err) => {
        console.error('❌ Failed to load coaches:', err);
      },
    });
  }

  loadCoaches(): void {
    this.userService.getAllCoaches().subscribe({
      next: (res: any) => {
        const list = res?.$values || res?.items?.$values || [];
        this.coaches.set(list);
        console.log('✅ Coaches loaded:', this.coaches());
      },
      error: (err) => {
        console.error('❌ Failed to load coaches:', err);
      },
    });
  }

  viewCoach(id: string): void {
    this.router.navigate(['/admin/coach', id]); // Ensure this route is configured
  }

  deleteCoach(id: string): void {
    console.log('Delete ' + id);
    if (!confirm('Are you sure you want to delete this coach?')) return;

    this.userService.deleteCoach(id).subscribe({
      next: (res) => {
        console.log(res);
        this.cdRef.detectChanges();
      },
      error: (error) => {
        console.error(error);
      },
    });

    // this.userService.deleteCoach(id).subscribe({
    //   next: () => {
    //     alert('✅ Coach deleted');
    //     const updatedList = this.coaches().filter((c) => c.id !== id);
    //     this.coaches.set(updatedList);
    //   },
    //   error: (err) => {
    //     console.error('❌ Failed to delete coach:', err);
    //     alert('Delete failed');
    //   },
    // });
  }
}
