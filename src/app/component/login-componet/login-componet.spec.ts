// import { ComponentFixture, TestBed } from '@angular/core/testing';
// import { LoginComponet } from './login-componet';
// import { ReactiveFormsModule, FormsModule } from '@angular/forms';
// import { UserService } from '../../services/UserService';
// import { ToastService } from '../../services/ToastService';
// import { Router } from '@angular/router';
// import { of, throwError } from 'rxjs';
// import { ToastrService, ToastrModule } from 'ngx-toastr';

// describe('LoginComponet', () => {
//   let component: LoginComponet;
//   let fixture: ComponentFixture<LoginComponet>;
//   let userServiceSpy: jasmine.SpyObj<UserService>;
//   let toastServiceSpy: jasmine.SpyObj<ToastService>;
//   let routerSpy: jasmine.SpyObj<Router>;

//   beforeEach(async () => {
//     const userSpy = jasmine.createSpyObj('UserService', ['validateUser']);
//     const toastSpy = jasmine.createSpyObj('ToastService', ['showToast']);
//     const routerMock = jasmine.createSpyObj('Router', ['navigate']);

//     await TestBed.configureTestingModule({
//       imports: [
//         LoginComponet,
//         ReactiveFormsModule,
//         FormsModule,
//         ToastrModule.forRoot(), // ✅ FIX: Add this
//       ],
//       providers: [
//         { provide: UserService, useValue: userSpy },
//         { provide: ToastService, useValue: toastSpy },
//         { provide: Router, useValue: routerMock },
//         ToastrService, // ✅ Needed if your ToastService depends on this
//       ],
//     }).compileComponents();

//     fixture = TestBed.createComponent(LoginComponet);
//     component = fixture.componentInstance;
//     userServiceSpy = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
//     toastServiceSpy = TestBed.inject(
//       ToastService
//     ) as jasmine.SpyObj<ToastService>;
//     routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;

//     fixture.detectChanges();
//   });

//   it('should create the component', () => {
//     expect(component).toBeTruthy();
//   });

//   it('should initialize the login form with default values', () => {
//     expect(component.loginForm).toBeTruthy();
//     expect(component.loginForm.controls['username'].value).toBe(
//       'cbum@gmail.com'
//     );
//     expect(component.loginForm.controls['password'].value).toBe('root@123');
//   });

//   it('should call UserService and show success toast on valid login', () => {
//     userServiceSpy.validateUser.and.returnValue(of({ token: 'abc123' }));

//     component.handleLogin();

//     expect(userServiceSpy.validateUser).toHaveBeenCalledWith({
//       username: 'cbum@gmail.com',
//       password: 'root@123',
//     });
//     expect(toastServiceSpy.showToast).toHaveBeenCalledWith(
//       'Login Successful',
//       'You have been logged in.',
//       'success'
//     );
//   });

//   it('should show error toast on failed login', () => {
//     userServiceSpy.validateUser.and.returnValue(
//       throwError(() => 'Invalid credentials')
//     );

//     component.handleLogin();

//     expect(userServiceSpy.validateUser).toHaveBeenCalled();
//     expect(toastServiceSpy.showToast).toHaveBeenCalledWith(
//       'Login Failed',
//       'Invalid credentials',
//       'error'
//     );
//   });
// });
