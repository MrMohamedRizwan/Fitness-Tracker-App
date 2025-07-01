import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ClientService {
  private baseUrl = 'http://localhost:5002/api/v1/Client';

  constructor(private http: HttpClient) {}

  getClientById(id: any): Observable<any> {
    const token = this.getToken();
    return this.http.get(`${this.baseUrl}/get-client/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
  getMyDetails(): Observable<any> {
    const token = this.getToken();
    return this.http.get(`${this.baseUrl}/my-details`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  }

  getAssignedPlans(email: any) {
    const token = this.getToken();
    return this.http.get(
      `http://localhost:5002/api/v1/Coach/getAssignedPlan/${email}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  }
  private getToken(): string | null {
    const user = localStorage.getItem('user');
    if (user) {
      const parsedUser = JSON.parse(user);
      return parsedUser?.token || null;
    }
    return null;
  }
}
