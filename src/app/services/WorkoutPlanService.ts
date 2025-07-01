import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { FormGroup } from '@angular/forms';

// Define interfaces for type safety

@Injectable({
  providedIn: 'root',
})
export class WorkoutPlanService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:5002/api/v1/WorkoutPlan';

  private selectedPlanSubject = new BehaviorSubject<any | null>(null);
  selectedPlan$ = this.selectedPlanSubject.asObservable();

  constructor() {}

  private getToken(): string | null {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user)?.token : null;
  }

  public addWorkoutPlan(plan: any): Observable<any> {
    const token = this.getToken();
    return this.http.post(`${this.baseUrl}/AddWorkoutPlans`, plan, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  public GetParticularWorkout(id: string): Observable<any> {
    const token = this.getToken();
    return this.http.get<any>(`${this.baseUrl}/WorkoutPlan/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  public GetAllWorkouts(): Observable<any> {
    const token = this.getToken();
    return this.http.get<any>(`${this.baseUrl}/Workout/all`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
  public updateWorkoutPlan(id: string, updatedPlan: any): Observable<any> {
    const token = this.getToken();
    return this.http.put<any>(
      `${this.baseUrl}/UpdateWorkoutPlan/${id}`,
      updatedPlan,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  }

  public deleteWorkoutPlan(id: string): Observable<any> {
    const token = this.getToken();
    // Uncomment and use the actual API call in production
    // return this.http.delete(`${this.baseUrl}/DeleteWorkoutPlan/${id}`, {
    //   headers: {
    //     Authorization: `Bearer ${token}`,
    //   },
    // });
    console.log('Delete');
    return new Observable<any>((observer) => {
      observer.next(null);
      observer.complete();
    });
  }

  public SubmitWorkoutByClient(payload: any): Observable<any> {
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
