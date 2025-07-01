import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class ProgressService {
  private baseUrl = 'http://localhost:5002/api/v1/Progress';

  constructor(private http: HttpClient) {}

  getAllProgress() {
    const token = this.getToken();
    return this.http.get<any>(`${this.baseUrl}/my`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  getAllProgressOfClient(clientId: any) {
    const token = this.getToken();
    return this.http.get<any>(`${this.baseUrl}/client/${clientId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  getProgressGraph(clientId: any) {
    const token = this.getToken();
    return this.http.get<any>(`${this.baseUrl}/getProgressLogs/${clientId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  createProgress(formData: FormData) {
    const token = this.getToken();

    return this.http.post(`${this.baseUrl}/progress`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
  private getToken(): string | null {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user)?.token : null;
  }
}
