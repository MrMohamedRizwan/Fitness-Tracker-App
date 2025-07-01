import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyPlans } from './my-plans';

describe('MyPlans', () => {
  let component: MyPlans;
  let fixture: ComponentFixture<MyPlans>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyPlans]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyPlans);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
