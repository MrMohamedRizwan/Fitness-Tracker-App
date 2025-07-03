import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { UserLoginModel } from '../../models/userLoginModel';
import { UserService } from '../../services/UserService';
import { Router, RouterLink } from '@angular/router';
import { ToastService } from '../../services/ToastService';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login-componet',
  imports: [FormsModule, CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login-componet.html',
  styleUrls: ['./login-componet.css'],
})
export class LoginComponet {
  user: UserLoginModel = new UserLoginModel();
  loginForm: FormGroup;

  // Alert state
  successMessage: string | null = null;
  errorMessage: string | null = null;

  constructor(
    private userService: UserService,
    private router: Router,
    private toastService: ToastService,
    private toastr: ToastrService
  ) {
    this.loginForm = new FormGroup({
      username: new FormControl('cbum@gmail.com', Validators.required),
      password: new FormControl('root@123', [Validators.required]),
    });
  }

  handleLogin() {
    this.userService.validateUser(this.loginForm.value).subscribe({
      next: () => {
        this.toastService.showToast(
          'Success',
          'Login completed successfully.',
          'success'
        );
        // this.toastr.success('Operation Successful!', 'Success');
      },
      error: (errMessage: string) => {
        this.toastService.showToast('Login Failed', errMessage, 'error');
      },
    });
  }
}
