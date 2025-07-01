import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CaochSidebar } from './caoch-sidebar';

describe('CaochSidebar', () => {
  let component: CaochSidebar;
  let fixture: ComponentFixture<CaochSidebar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CaochSidebar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaochSidebar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
