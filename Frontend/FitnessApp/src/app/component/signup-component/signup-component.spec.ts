import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { SignupComponent } from './signup-component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { UserService } from '../../services/UserService';
import { ToastService } from '../../services/ToastService';

describe('SignupComponent', () => {
  let component: SignupComponent;
  let fixture: ComponentFixture<SignupComponent>;
  let mockUserService: any;
  let mockToastService: any;
  let mockRouter: any;

  beforeEach(async () => {
    mockUserService = {
      addUser: jasmine.createSpy('addUser').and.returnValue(of({})),
    };

    mockToastService = {
      showToast: jasmine.createSpy('showToast'),
    };

    mockRouter = {
      navigate: jasmine.createSpy('navigate'),
    };

    await TestBed.configureTestingModule({
      imports: [SignupComponent, ReactiveFormsModule, FormsModule],
      providers: [
        { provide: UserService, useValue: mockUserService },
        { provide: ToastService, useValue: mockToastService },
        { provide: Router, useValue: mockRouter },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SignupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form with default values', () => {
    const form = component.signupForm;
    expect(form).toBeDefined();
    expect(form.get('name')?.value).toBe('roshan');
    expect(form.get('email')?.value).toBe('roshan@gmail.com');
    expect(form.get('password')?.value).toBe('root@123');
  });

  it('should mark form invalid if required fields are missing', () => {
    component.signupForm.patchValue({ name: '', email: '', password: '' });
    expect(component.signupForm.valid).toBeFalse();
  });

  it('should call userService.addUser on valid form submission', () => {
    component.signupForm.patchValue({
      role: 'Client', // ensure required field is filled
    });

    component.submitForm();

    expect(mockUserService.addUser).toHaveBeenCalledWith(
      component.signupForm.value
    );
  });

  it('should handle error response from userService', () => {
    mockUserService.addUser.and.returnValue(throwError(() => 'Signup Failed'));
    spyOn(console, 'error');

    component.submitForm();

    expect(console.error).toHaveBeenCalledWith(
      'Error adding user:',
      'Signup Failed'
    );
    // expect(mockToastService.showToast).toHaveBeenCalledWith('SignUp Failed', 'Signup Failed', 'error');
  });
});
