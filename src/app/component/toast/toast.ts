import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  ViewChild,
  ElementRef,
  OnChanges,
  SimpleChanges,
  AfterViewInit
} from '@angular/core';

declare var bootstrap: any;

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.html',
})
export class ToastComponent implements OnChanges, AfterViewInit {
  @Input() title = '';
  @Input() message = '';
  @Input() type: string = 'info';
  @Input() visible = false;

  @ViewChild('toastRef', { static: false }) toastRef!: ElementRef;
  private bsToast: any;

  get toastClasses(): string {
    const base = 'toast text-white border-0 fade'; // fade = transition
    const types: Record<string, string> = {
      success: 'bg-success',
      error: 'bg-danger',
      info: 'bg-primary'
    };
    return `${base} ${types[this.type]}`;
  }

  ngAfterViewInit(): void {
    if (this.toastRef?.nativeElement) {
      this.bsToast = new bootstrap.Toast(this.toastRef.nativeElement, { delay: 3000 });
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible'] && this.visible && this.bsToast) {
      this.bsToast.show();
    }
  }
}
