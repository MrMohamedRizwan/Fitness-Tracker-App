import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  NgZone,
  OnDestroy,
  OnInit,
} from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { signal, Signal } from '@angular/core';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification.html',
  styleUrl: './notification.css',
})
export class Notification implements OnInit, OnDestroy {
  notification = signal<{
    message: string;
    assignedOn: string;
    workoutPlanId: string;
    dietPlanId: string;
  } | null>(null);
  private connection!: signalR.HubConnection;
  private currentClientId = '0197939c-bd3c-7404-81ab-1aab11a7f268';

  constructor(private cdr: ChangeDetectorRef, private ngZone: NgZone) {}

  ngOnInit(): void {
    this.start();
  }

  start() {
    this.connection = new signalR.HubConnectionBuilder()
      .withUrl('http://localhost:5002/notificationHub', {
        withCredentials: true,
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000])
      .configureLogging(signalR.LogLevel.Information)
      .build();

    this.connection
      .start()
      .then(() => {
        console.log('Connected to SignalR hub.');
        return this.connection.invoke('Subscribe', this.currentClientId);
      })
      .then(() => {
        console.log('Joined group for client:', this.currentClientId);
      })
      .catch((err) => {
        console.error('SignalR connection or group join failed:', err);
      });

    this.connection.on('ReceivePlanAssignmentNotification', (data: any) => {
      this.ngZone.run(() => {
        console.log('Received notification: ☺️', data);
        this.notification.set({
          message: data.message,
          assignedOn: new Date(data.assignedOn).toLocaleString(),
          workoutPlanId: data.workoutPlanId,
          dietPlanId: data.dietPlanId,
        });
        console.log('Notification set:', this.notification);
      });
    });
  }

  ngOnDestroy(): void {
    if (this.connection) {
      this.connection.stop();
    }
  }
}
