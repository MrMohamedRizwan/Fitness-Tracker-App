import { TestBed, ComponentFixture } from '@angular/core/testing';
import { LoginComponet } from './login-componet';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { UserService } from '../../services/UserService';
import { ToastService } from '../../services/ToastService';
import { ToastrService } from 'ngx-toastr';
import { of, throwError } from 'rxjs';

describe('LoginComponet', () => {
  let component: LoginComponet;
  let fixture: ComponentFixture<LoginComponet>;
  let userServiceSpy: jasmine.SpyObj<UserService>;
  let toastServiceSpy: jasmine.SpyObj<ToastService>;
  let toastrSpy: jasmine.SpyObj<ToastrService>;

  beforeEach(async () => {
    userServiceSpy = jasmine.createSpyObj('UserService', ['validateUser']);
    toastServiceSpy = jasmine.createSpyObj('ToastService', ['showToast']);
    toastrSpy = jasmine.createSpyObj('ToastrService', ['success']);

    await TestBed.configureTestingModule({
      imports: [
        LoginComponet,
        ReactiveFormsModule,
        FormsModule,
        RouterTestingModule, // ✅ include this to provide real Router & RouterLink
      ],
      providers: [
        { provide: UserService, useValue: userServiceSpy },
        { provide: ToastService, useValue: toastServiceSpy },
        { provide: ToastrService, useValue: toastrSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponet);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should call validateUser and show success toast on successful login', () => {
    userServiceSpy.validateUser.and.returnValue(of({}));

    component.handleLogin();

    expect(userServiceSpy.validateUser).toHaveBeenCalled();
    expect(toastServiceSpy.showToast).toHaveBeenCalledWith(
      'Success',
      'Login completed successfully.',
      'success'
    );
  });

  it('should show error toast on login failure', () => {
    userServiceSpy.validateUser.and.returnValue(
      throwError(() => 'Invalid credentials')
    );

    component.handleLogin();

    expect(userServiceSpy.validateUser).toHaveBeenCalled();
    expect(toastServiceSpy.showToast).toHaveBeenCalledWith(
      'Login Failed',
      'Invalid credentials',
      'error'
    );
  });
});
