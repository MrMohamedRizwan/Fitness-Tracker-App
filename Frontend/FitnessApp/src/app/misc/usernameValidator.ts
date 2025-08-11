import { AbstractControl, ValidationErrors } from '@angular/forms';

export function UsernameValidation(control: AbstractControl): ValidationErrors | null {
  const banned = ['coach', 'client'];
  if (control.value && banned.some(word => control.value.toLowerCase().includes(word))) {
    return { bannedUsername: true };
  }
  return null;
}