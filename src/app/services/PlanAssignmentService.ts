import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PlanAssignmentService {
  private baseUrl = 'http://localhost:5002/api/v1/Client';

  constructor(private http: HttpClient) {}
  private getToken(): string | null {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user)?.token : null;
  }

  getPlans(): Observable<any[]> {
    const token = this.getToken();
    return this.http.get<any[]>(`${this.baseUrl}/assigned-plans`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
  AcceptPlan(payload: any): Observable<any[]> {
    const token = this.getToken();
    return this.http.put<any[]>(`${this.baseUrl}/UpdateStatus`, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
}
