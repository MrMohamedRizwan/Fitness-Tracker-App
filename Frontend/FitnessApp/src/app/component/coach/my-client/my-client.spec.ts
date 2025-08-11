import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { MyClient } from './my-client';
import { CoachService } from '../../../services/CoachService';
import { of, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

describe('MyClient Component', () => {
  let component: MyClient;
  let fixture: ComponentFixture<MyClient>;
  let coachServiceSpy: jasmine.SpyObj<CoachService>;
  let routerSpy: jasmine.SpyObj<Router>;

  const mockClients = {
    items: {
      $values: [
        { id: '1', name: 'Alice Johnson', email: 'alice@example.com' },
        { id: '2', name: 'Bob Smith', email: 'bob@example.com' },
        { id: '3', name: 'Charlie Brown', email: 'charlie@example.com' },
      ],
    },
  };

  beforeEach(async () => {
    coachServiceSpy = jasmine.createSpyObj('CoachService', ['getClientsList']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [MyClient, CommonModule, FormsModule],
      providers: [
        { provide: CoachService, useValue: coachServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MyClient);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should load clients on init', fakeAsync(() => {
    coachServiceSpy.getClientsList.and.returnValue(of(mockClients));

    component.ngOnInit();
    tick();

    expect(coachServiceSpy.getClientsList).toHaveBeenCalled();
    expect(component.clients.length).toBe(3);
    expect(component.filteredClients.length).toBe(3);
    expect(component.paginatedClients.length).toBe(3); // since 3 < 8
  }));

  it('should handle error during loadClients', fakeAsync(() => {
    spyOn(console, 'error');
    coachServiceSpy.getClientsList.and.returnValue(
      throwError(() => 'Network error')
    );

    component.loadClients();
    tick();

    expect(console.error).toHaveBeenCalledWith(
      'Error fetching clients:',
      'Network error'
    );
  }));

  it('should filter clients by name', () => {
    component.clients = mockClients.items.$values;
    component.searchTerm = 'alice';

    component.filterClients();

    expect(component.filteredClients.length).toBe(1);
    expect(component.filteredClients[0].name).toBe('Alice Johnson');
  });

  it('should navigate to assign plan', () => {
    component.goToAssignPlan('123');
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/assign-plan', '123']);
  });

  it('should navigate to client details', () => {
    const mockClient = { id: '999' };
    component.showDetails(mockClient);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/client-details', '999']);
  });

  it('should paginate to next and previous page', () => {
    const fakeClients = Array.from({ length: 20 }, (_, i) => ({
      id: `${i}`,
      name: `Client ${i}`,
      email: `client${i}@example.com`,
    }));
    component.clients = fakeClients;
    component.filteredClients = fakeClients;
    component.paginateClients();

    expect(component.paginatedClients.length).toBe(8);
    expect(component.currentPage).toBe(1);

    component.nextPage();
    expect(component.currentPage).toBe(2);
    expect(component.paginatedClients.length).toBe(8);

    component.prevPage();
    expect(component.currentPage).toBe(1);
  });

  // it('should not go beyond last page', () => {
  //   const fakeClients = Array.from({ length: 10 }, (_, i) => ({
  //     id: `${i}`,
  //     name: `Client ${i}`,
  //     email: `client${i}@example.com`,
  //   }));
  //   component.filteredClients = fakeClients;
  //   component.itemsPerPage = 8;
  //   component.currentPage = 2;

  //   component.nextPage(); // Should not increase beyond 2
  //   expect(component.currentPage).toBe(2);

  //   component.prevPage();
  //   expect(component.currentPage).toBe(1);
  // });
});
