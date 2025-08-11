import { HttpHeaders, HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable()
export class CoachService {
  private http = inject(HttpClient);
  constructor(private router: Router) {}
  public getClientsList(): Observable<any> {
    const token = localStorage.getItem('user')
      ? JSON.parse(localStorage.getItem('user')!).token
      : null;

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const url = `http://localhost:5002/api/v1/Coach/ClientWithoutPlansAssigned?pageNumber=1&pageSize=100&searchTerm=all`;
    return this.http.get<any>(url, { headers });
  }

  public deleteAssignedPlans(id: any): Observable<any> {
    const token = this.getToken();
    return this.http.delete(
      `http://localhost:5002/api/v1/Coach/Delete-Assigned-Plans/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
  }

  public getDiets(): Observable<any> {
    const token = localStorage.getItem('user')
      ? JSON.parse(localStorage.getItem('user')!).token
      : null;

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const url = `http://localhost:5002/api/v1/DietPlan/diet/all`;
    return this.http.get<any>(url, { headers });
  }

  public getWorkouts(): Observable<any> {
    const token = localStorage.getItem('user')
      ? JSON.parse(localStorage.getItem('user')!).token
      : null;

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const url = `http://localhost:5002/api/v1/WorkoutPlan/Workout/all`;
    return this.http.get<any>(url, { headers });
  }
  public getAssignedPlansChart(): Observable<any> {
    const token = this.getToken();
    return this.http.get<any>(
      'http://localhost:5002/api/v1/Coach/assignedPlansByWeek',
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  }

  public assignPlanToClient(payload: any) {
    const token = localStorage.getItem('user')
      ? JSON.parse(localStorage.getItem('user')!).token
      : null;
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post(
      `http://localhost:5002/api/v1/Coach/AssignPlan`,
      payload,
      { headers }
    );
  }

  public markPlanAsCompleted(id: any) {
    const token = this.getToken();
    console.log('Mark Plan As completer', token);

    return this.http.put<any>(
      `http://localhost:5002/api/v1/Coach/${id}/completed`,
      {},
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

  public assignSubCoach(payload: any) {
    const token = this.getToken();

    return this.http.post<any>(
      `http://localhost:5002/api/v1/Coach/assignSubCoach`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  }
}
