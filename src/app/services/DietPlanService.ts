// src/app/services/diet-plan.service.ts

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DietPlanService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:5002/api/v1/DietPlan/';

  constructor() {}

  private getToken(): string | null {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user)?.token : null;
  }

  public addDietPlan(plan: any): Observable<any> {
    const token = this.getToken();
    return this.http.post(
      `http://localhost:5002/api/v1/DietPlan/AddDiet`,
      plan,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  }
  public GetAllDiets(): Observable<any> {
    const token = this.getToken();
    return this.http.get<any>(`${this.baseUrl}diet/all`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
  public GetParticularDiet(id: string): Observable<any> {
    const token = this.getToken();
    return this.http.get(`${this.baseUrl}dietplan/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
  public deleteDietPlan(id: string): Observable<any> {
    const token = this.getToken();
    return this.http.get(`${this.baseUrl}dietplan/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
  public SubmitDietByClient(payload: any): Observable<any> {
    const token = this.getToken();
    return this.http.post<any>(
      `http://localhost:5002/api/v1/Workout`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  }
}
