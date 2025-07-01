import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginComponet } from './login-componet';

describe('LoginComponet', () => {
  let component: LoginComponet;
  let fixture: ComponentFixture<LoginComponet>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginComponet]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoginComponet);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
