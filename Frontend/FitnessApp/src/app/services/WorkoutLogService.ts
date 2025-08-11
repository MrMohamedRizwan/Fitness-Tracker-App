import { inject, Inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { UserLoginModel } from '../models/userLoginModel';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { ClientUpdateRequestDTO } from '../models/ClientUpdateModel';

@Injectable()
export class WorkoutLogService {
  private http = inject(HttpClient);
  constructor(private router: Router) {}
  public getWorkoutLog(clientId: any): Observable<any> {
    const token = this.getToken();
    return this.http.get(
      `http://localhost:5002/api/v1/Workout/client/${clientId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  }
  public getWorkoutLogByid(id: any): Observable<any> {
    const token = this.getToken();
    return this.http.get(`http://localhost:5002/api/v1/Workout/${id}`, {
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
