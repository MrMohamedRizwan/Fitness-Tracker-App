import { Component } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ToastService } from '../services/ToastService';

@Component({
  selector: 'app-toasssss',
  imports: [],
  templateUrl: './toasssss.html',
  styleUrl: './toasssss.css',
})
export class Toasssss {
  constructor(private toastr: ToastService) {}

  showSuccess(): void {
    console.log('TOast');
    // this.toastr.success('Operation Successful!', 'Success');
    this.toastr.showToast('fnuhabudbh', 'duagugda', 'error');
  }
}
