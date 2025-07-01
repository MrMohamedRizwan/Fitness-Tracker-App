import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { UserService } from '../../services/UserService';
import { UsernameValidation } from '../../misc/usernameValidator';
import { PasswordStrengthValidator } from '../../misc/PasswordValidator';
import { passwordsMatchValidator } from '../../misc/passwordMatchValidation';
import { User } from '../../models/userSignupModel';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../services/ToastService';

@Component({
  selector: 'app-signup-component',
  imports: [FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './signup-component.html',
  styleUrl: './signup-component.css',
})
export class SignupComponent implements OnInit {
  signupForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router,
    private toastService: ToastService
  ) {
    this.signupForm = new FormGroup(
      {
        name: new FormControl('roshan', [
          Validators.required,
          UsernameValidation,
        ]),
        email: new FormControl('roshan@gmail.com', [
          Validators.required,
          Validators.email,
        ]),
        age: new FormControl('22', [Validators.required]),
        phone: new FormControl('1234567890', [
          Validators.required,
          Validators.pattern('^\\+?[0-9]{10,15}$'),
        ]),
        password: new FormControl('root@123', [
          Validators.required,
          PasswordStrengthValidator,
        ]),
        confirmPassword: new FormControl('root@123', [Validators.required]),
        role: new FormControl('', [Validators.required]),
        yearsOfExperience: new FormControl('32', [
          Validators.required,
          Validators.min(18),
        ]),
      },
      { validators: passwordsMatchValidator }
    );
  }
  ngOnInit(): void {
    this.signupForm.get('name')?.valueChanges.subscribe((value) => {
      console.log(
        'passwod changed:',
        value,
        'Errors:',
        this.signupForm.get('password')?.errors
      );
    });
  }

  submitForm() {
    // if (this.signupForm.valid) {
    const user: User = this.signupForm.value;
    // console.log('User submitted:', user);
    this.userService.addUser(user).subscribe({
      next: (response) => {
        // this.toastService.showToast(
        //   'Login Successful',
        //   'You have been logged in.',
        //   'success'
        // );
        // this.router.navigate(['/'])
      },
      error: (error) => {
        console.error('Error adding user:', error);
        // this.toastService.showToast('SignUp Failed', error, 'error');
      },
    });
    // }
  }
}
