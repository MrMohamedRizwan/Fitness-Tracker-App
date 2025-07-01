import { Injectable } from '@angular/core';
import { BehaviorSubject, timer } from 'rxjs';

interface ToastData {
  title: string;
  message: string;
  type:string;
  visible: boolean;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private toastSubject = new BehaviorSubject<ToastData>({
    title: '',
    message: '',
    type: '',
    visible: false
  });

  toast$ = this.toastSubject.asObservable();

  showToast(title: string, message: string, type: string) {
    this.toastSubject.next({ title, message, type, visible: true });

    // Auto-dismiss after 5 seconds
    timer(1000).subscribe(() => {
      this.toastSubject.next({ ...this.toastSubject.value, visible: false });
    });
  }
}
