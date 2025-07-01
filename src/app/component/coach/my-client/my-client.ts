import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CoachService } from '../../../services/CoachService';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Route, Router } from '@angular/router';

@Component({
  selector: 'app-my-client',
  imports: [FormsModule, CommonModule],
  templateUrl: './my-client.html',
  standalone: true,
  styleUrl: './my-client.css',
})
export class MyClient implements OnInit {
  searchTerm: string = '';
  currentPage: number = 1;
  itemsPerPage: number = 8;
  clients: any[] = [];
  filteredClients: any[] = [];
  paginatedClients: any[] = [];

  constructor(
    private clientService: CoachService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}
  showDetails(details: any) {
    this.router.navigate(['/client-details', details.id]);
  }
  ngOnInit(): void {
    this.loadClients();
  }
  goToAssignPlan(clientId: string) {
    this.router.navigate(['/assign-plan', clientId]);
  }

  loadClients() {
    this.clientService.getClientsList().subscribe({
      next: (res) => {
        console.log('Fetched clients:', this.clients);

        this.clients = res.items.$values;
        this.filterClients();
        this.cdr.detectChanges(); // ✅ force update

        console.log('Fetched clients:', this.clients);
      },
      error: (err) => {
        console.error('Error fetching clients:', err);
      },
    });
  }

  filterClients(): void {
    this.filteredClients = this.clients.filter(
      (client) =>
        client.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        client.email.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
    this.currentPage = 1;
    this.paginateClients();
  }

  paginateClients(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    this.paginatedClients = this.filteredClients.slice(
      startIndex,
      startIndex + this.itemsPerPage
    );
  }

  nextPage(): void {
    const totalPages = Math.ceil(
      this.filteredClients.length / this.itemsPerPage
    );
    if (this.currentPage < totalPages) {
      this.currentPage++;
      this.paginateClients();
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.paginateClients();
    }
  }

  get startIndex(): number {
    return (this.currentPage - 1) * this.itemsPerPage;
  }

  get endIndex(): number {
    return Math.min(
      this.startIndex + this.itemsPerPage,
      this.filteredClients.length
    );
  }

  get totalPages(): number {
    return Math.ceil(this.filteredClients.length / this.itemsPerPage);
  }
}
