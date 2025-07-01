import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyClient } from './my-client';

describe('MyClient', () => {
  let component: MyClient;
  let fixture: ComponentFixture<MyClient>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyClient]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyClient);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
