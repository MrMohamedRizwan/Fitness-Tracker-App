import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoginComponet } from "./component/login-componet/login-componet";
import { Notification } from "./component/notification/notification";
import {  ToastComponent } from "./component/toast/toast";
import { ToastService } from './services/ToastService';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, LoginComponet, Notification, ToastComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  toast = { title: '', message: '', type: 'info', visible: false };

  constructor(private toastService: ToastService) {
    this.toastService.toast$.subscribe(data => this.toast = data);
  }
  protected title = 'FitnessApp';
}
