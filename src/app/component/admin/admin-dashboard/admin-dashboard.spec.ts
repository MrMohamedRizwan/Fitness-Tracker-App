import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { AdminDashboard } from './admin-dashboard';
import { UserService } from '../../../services/UserService';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { Coach } from '../../../models/Coach';
import { ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';

describe('AdminDashboard', () => {
  let component: AdminDashboard;
  let fixture: ComponentFixture<AdminDashboard>;

  const mockRouter = {
    navigate: jasmine.createSpy('navigate'),
  };

  const mockUserService = {
    getAllCoaches: jasmine.createSpy('getAllCoaches'),
    getAllClients: jasmine.createSpy('getAllClients'),
    deleteCoach: jasmine.createSpy('deleteCoach'),
    deleteClient: jasmine.createSpy('deleteClient'),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminDashboard, CommonModule],
      providers: [
        { provide: UserService, useValue: mockUserService },
        { provide: Router, useValue: mockRouter },
        ChangeDetectorRef,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminDashboard);
    component = fixture.componentInstance;
  });

  beforeEach(() => {
    // Reset spies and return default mocks
    mockUserService.getAllCoaches.calls.reset();
    mockUserService.getAllClients.calls.reset();
    mockUserService.deleteCoach.calls.reset();
    mockUserService.deleteClient.calls.reset();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should call loadCoaches and loadClients on init', fakeAsync(() => {
    mockUserService.getAllCoaches.and.returnValue(of({ $values: [] }));
    mockUserService.getAllClients.and.returnValue(of({ $values: [] }));

    fixture.detectChanges(); // triggers ngOnInit
    tick();

    expect(mockUserService.getAllCoaches).toHaveBeenCalled();
    expect(mockUserService.getAllClients).toHaveBeenCalled();
  }));

  it('should load coaches from service', fakeAsync(() => {
    const mockCoaches: Coach[] = [{ id: '1', name: 'Coach A' } as Coach];
    mockUserService.getAllCoaches.and.returnValue(of({ $values: mockCoaches }));

    component.loadCoaches();
    tick();

    expect(component.coaches()).toEqual(mockCoaches);
  }));

  it('should load clients from service', fakeAsync(() => {
    const mockClients = [{ id: 'c1', name: 'Client A' }];
    mockUserService.getAllClients.and.returnValue(of({ $values: mockClients }));

    component.loadClients();
    tick();

    expect(component.clients()).toEqual(mockClients);
  }));

  it('should call deleteCoach if confirmed', fakeAsync(() => {
    spyOn(window, 'confirm').and.returnValue(true);
    mockUserService.deleteCoach.and.returnValue(of({}));

    component.deleteCoach('1');
    tick();

    expect(mockUserService.deleteCoach).toHaveBeenCalledWith('1');
  }));

  it('should not call deleteCoach if confirm is cancelled', () => {
    spyOn(window, 'confirm').and.returnValue(false);

    component.deleteCoach('1');

    expect(mockUserService.deleteCoach).not.toHaveBeenCalled();
  });

  it('should call deleteClient if confirmed', fakeAsync(() => {
    spyOn(window, 'confirm').and.returnValue(true);
    mockUserService.deleteClient.and.returnValue(of({}));

    component.deleteClient('c1');
    tick();

    expect(mockUserService.deleteClient).toHaveBeenCalledWith('c1');
  }));

  it('should navigate to coach view page', () => {
    component.viewCoach('123');
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/admin/coach', '123']);
  });

  it('should handle loadCoaches error', fakeAsync(() => {
    spyOn(console, 'error');
    mockUserService.getAllCoaches.and.returnValue(
      throwError(() => 'Load Error')
    );

    component.loadCoaches();
    tick();

    expect(console.error).toHaveBeenCalledWith(
      '❌ Failed to load coaches:',
      'Load Error'
    );
  }));

  it('should handle loadClients error', fakeAsync(() => {
    spyOn(console, 'error');
    mockUserService.getAllClients.and.returnValue(
      throwError(() => 'Client Error')
    );

    component.loadClients();
    tick();

    expect(console.error).toHaveBeenCalledWith(
      '❌ Failed to load coaches:',
      'Client Error'
    );
  }));
});
