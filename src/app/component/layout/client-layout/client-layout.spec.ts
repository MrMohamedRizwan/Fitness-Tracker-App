import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ClientLayout } from './client-layout';
import { RouterTestingModule } from '@angular/router/testing';
import { Component } from '@angular/core';

// Dummy ClientSidebar mock
@Component({
  selector: 'app-client-sidebar',
  standalone: true,
  template: '<p>Client Sidebar Stub</p>',
})
class MockClientSidebar {}

describe('ClientLayout', () => {
  let component: ClientLayout;
  let fixture: ComponentFixture<ClientLayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientLayout, MockClientSidebar, RouterTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(ClientLayout);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the ClientLayout component', () => {
    expect(component).toBeTruthy();
  });
});
