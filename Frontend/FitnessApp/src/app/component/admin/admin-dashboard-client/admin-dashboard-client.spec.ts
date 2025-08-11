import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminDashboardClient } from './admin-dashboard-client';

describe('AdminDashboardClient', () => {
  let component: AdminDashboardClient;
  let fixture: ComponentFixture<AdminDashboardClient>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminDashboardClient]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminDashboardClient);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
