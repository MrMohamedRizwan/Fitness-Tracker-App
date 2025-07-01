import { AbstractControl, ValidationErrors } from '@angular/forms';

export function PasswordStrengthValidator(control: AbstractControl): ValidationErrors | null {
    const value: string = control.value || '';
    const minLength = 8;
    const hasNumber = /\d/.test(value);
    const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(value);

    if (value.length < minLength) {
        return { minlength: true };
    }
    if (!hasNumber) {
        return { passwordNoNumber: true };
    }
    if (!hasSymbol) {
        return { passwordNoSymbol: true };
    }
    return null;
}