import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Viewprogress } from './viewprogress';

describe('Viewprogress', () => {
  let component: Viewprogress;
  let fixture: ComponentFixture<Viewprogress>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Viewprogress]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Viewprogress);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
