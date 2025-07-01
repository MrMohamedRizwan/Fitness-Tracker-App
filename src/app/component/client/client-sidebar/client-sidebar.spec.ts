import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientSidebar } from './client-sidebar';

describe('ClientSidebar', () => {
  let component: ClientSidebar;
  let fixture: ComponentFixture<ClientSidebar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientSidebar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientSidebar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
