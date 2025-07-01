import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Toasssss } from './toasssss';

describe('Toasssss', () => {
  let component: Toasssss;
  let fixture: ComponentFixture<Toasssss>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Toasssss]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Toasssss);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
