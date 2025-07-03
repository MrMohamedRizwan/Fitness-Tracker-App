import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CoachLayout } from './coach-layout';
import { RouterTestingModule } from '@angular/router/testing';
import { Component } from '@angular/core';

// Dummy CaochSidebar mock component
@Component({
  selector: 'app-caoch-sidebar',
  standalone: true,
  template: '<p>Sidebar Stub</p>',
})
class MockCaochSidebar {}

describe('CoachLayout', () => {
  let component: CoachLayout;
  let fixture: ComponentFixture<CoachLayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoachLayout, MockCaochSidebar, RouterTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(CoachLayout);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the CoachLayout component', () => {
    expect(component).toBeTruthy();
  });
});
