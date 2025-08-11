import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, signal } from '@angular/core';
import { UserService } from '../../../services/UserService';
import { ActivatedRoute, Router } from '@angular/router';
import { Coach } from '../../../models/Coach';
import { FormsModule } from '@angular/forms';
import { CoachService } from '../../../services/CoachService';

@Component({
  selector: 'app-coach-list',
  imports: [CommonModule, FormsModule],
  templateUrl: './coach-list.html',
  styleUrl: './coach-list.css',
})
export class CoachList {
  coaches = signal<Coach[]>([]);
  clients = signal<any[]>([]);
  clientId: string | null = null;
  delegateUntilDate: string = '';
  email: string | null = '';

  constructor(
    private userService: UserService,
    private coachService: CoachService,
    private router: Router,
    private cdRef: ChangeDetectorRef,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadCoaches();
    this.route.paramMap.subscribe((params) => {
      const id = params.get('clientId');
      if (id) {
        this.clientId = id;
      }
    });
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      this.email = parsedUser.username;
    }
  }

  viewClient(id: any) {}
  deleteClient(id: any) {
    console.log('Delete ' + id);
    if (!confirm('Are you sure you want to delete this coach?')) return;

    this.userService.deleteClient(id).subscribe({
      next: (res) => {
        console.log(res);
        this.cdRef.detectChanges();
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  loadCoaches(): void {
    this.userService.getAllCoaches().subscribe({
      next: (res: any) => {
        const list = res?.$values || res?.items?.$values || [];
        this.coaches.set(list);
        console.log('Coaches loaded:', this.coaches());
      },
      error: (err) => {
        console.error('Failed to load coaches:', err);
      },
    });
  }

  delegateCoach(coachId: string): void {
    console.log('Delegating coach with ID:', coachId);
    console.log('Client ID:', this.clientId);
    if (!this.delegateUntilDate) {
      alert('Please select a date.');
      return;
    }
    const payload = {
      subCoachId: coachId,
      clientId: this.clientId,
      startDate: new Date().toISOString(),
      endDate: new Date(this.delegateUntilDate).toISOString(),
    };
    this.coachService.assignSubCoach(payload).subscribe({
      next: (res) => {
        console.log(res);
      },
      error: (err) => {
        console.error(err);
      },
    });
    if (!confirm(`Delegate coach until ${this.delegateUntilDate}?`)) return;

    // Write function to delegate coach
  }
}
