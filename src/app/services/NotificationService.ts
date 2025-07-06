import { Injectable, NgZone, signal, WritableSignal } from '@angular/core';
import * as signalR from '@microsoft/signalr';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private connection!: signalR.HubConnection;
  private currentClientId: string = '';

  // Use WritableSignal instead of Signal
  notification: WritableSignal<{
    message: string;
    assignedOn: string;
    workoutPlanId: string;
    dietPlanId: string;
  } | null> = signal(null);

  constructor(private ngZone: NgZone) {
    this.extractClientIdFromToken();
    if (this.currentClientId) {
      this.startConnection();
      this.joinCoachGroup(this.currentClientId);
    }
  }

  private extractClientIdFromToken(): void {
    const userItem = localStorage.getItem('user');
    console.log('📦 Raw user item from localStorage:', userItem);

    if (!userItem) return;

    try {
      const parsedUser = JSON.parse(userItem);
      const jwt = parsedUser?.token;

      if (!jwt) {
        console.warn('⚠️ No token found in parsed user object.');
        return;
      }

      const payloadBase64 = jwt.split('.')[1];
      const decodedPayload = atob(payloadBase64);
      const payload = JSON.parse(decodedPayload);

      // Depending on how your token is structured, adjust this:
      this.currentClientId =
        payload.UserId || payload.clientId || payload.sub || '';

      console.log('✅ Extracted clientId:', this.currentClientId);
    } catch (e) {
      console.error('❌ Failed to parse or decode token:', e);
    }
  }
  public joinCoachGroup(coachId: string): void {
    if (
      this.connection &&
      this.connection.state === signalR.HubConnectionState.Connected
    ) {
      this.connection
        .invoke('JoinCoachGroup', coachId)
        .then(() => console.log('✅ Joined coach group:', coachId))
        .catch((err) => console.error('❌ Failed to join coach group:', err));
    }
  }

  private startConnection(): void {
    this.connection = new signalR.HubConnectionBuilder()
      .withUrl('http://localhost:5002/notificationHub', {
        withCredentials: true,
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000])
      .configureLogging(signalR.LogLevel.Information)
      .build();
    this.connection.on('ProgressUploaded', (data: any) => {
      this.ngZone.run(() => {
        console.log('📥 Progress uploaded notification received:', data);
        this.notification.set({
          message: data.clientName,
          assignedOn: '',
          workoutPlanId: '',
          dietPlanId: '',
        });
        // alert(
        //   `Client ${data.clientName} uploaded progress:\nHeight: ${data.height} cm\nWeight: ${data.weight} kg`
        // );
      });
    });
    this.connection
      .start()
      .then(() => this.connection.invoke('Subscribe', this.currentClientId))
      .catch((err) =>
        console.error('❌ SignalR connection or subscription failed:', err)
      );

    this.connection.on('ReceivePlanAssignmentNotification', (data: any) => {
      this.ngZone.run(() => {
        this.notification.set({
          message: data.message,
          assignedOn: new Date(data.assignedOn).toLocaleString(),
          workoutPlanId: data.workoutPlanId,
          dietPlanId: data.dietPlanId,
        });
      });
    });
  }

  public stopConnection(): void {
    if (this.connection) {
      this.connection.stop();
    }
  }
}
