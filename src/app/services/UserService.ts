import { inject, Inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { UserLoginModel } from '../models/userLoginModel';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { ClientUpdateRequestDTO } from '../models/ClientUpdateModel';

@Injectable()
export class UserService {
  private http = inject(HttpClient);
  constructor(private router: Router) {}

  public validateUser(credentials: UserLoginModel): Observable<any> {
    return new Observable<boolean>((observer) => {
      this.http
        .post('http://localhost:5002/api/v1/Authentication', credentials)
        .subscribe({
          next: (response: any) => {
            localStorage.setItem('user', JSON.stringify(response));

            // ✅ Extract token and decode it
            const token = response.token;
            const decoded: any = jwtDecode(token);
            const role =
              decoded?.role ||
              decoded?.Role ||
              decoded?.[
                'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'
              ];
            console.log('Decoded role:', role);
            // ✅ Navigate based on role
            if (role == 'Coach') {
              this.router.navigate(['/coach-dashboard']);
            } else if (role == 'Client') {
              this.router.navigate(['/client-dashboard']);
            } else {
              this.router.navigate(['/admin-dashboard']);
            }

            observer.next(true);
            observer.complete();
          },
          error: (error: any) => {
            // console.error('User validation failed:', error?.error?.errorMessage );
            observer.error(
              error?.error?.errorMessage || 'User validation failed'
            );
          },
        });
    });
  }

  public addUser(user: any): Observable<any> {
    return new Observable<any>((observer) => {
      this.http
        .post(`http://localhost:5002/api/v1/${user.role}`, user)
        .subscribe({
          next: (response) => {
            localStorage.setItem('user', JSON.stringify(response));
            console.log('User added successfully:', response);
            if (user.role === 'Coach')
              this.router.navigate(['/coach-dashboard']);
            else if (user.role === 'Client')
              this.router.navigate(['/update-details']);
            observer.next(true);
            observer.complete();
          },
          error: (error) => {
            console.error('Error adding user:', error);
            observer.error(error?.error);
          },
        });
    });
  }
  // src/app/services/UserService.ts
  getAllCoaches(): Observable<any[]> {
    const token = this.getToken();
    return this.http.get<any[]>(
      'http://localhost:5002/api/v1/Coach/getAllCoaches',
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  }

  getAllClients(): Observable<any[]> {
    const token = this.getToken();
    return this.http.get<any[]>(
      'http://localhost:5002/api/v1/Client/getAllClients?pageNumber=1&pageSize=100',
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  }
  deleteCoach(id: any): Observable<any[]> {
    {
      const token = this.getToken();
      return this.http.delete<any[]>(
        `http://localhost:5002/api/v1/Admin/Delete-Coach/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    }
  }
  deleteClient(id: any): Observable<any[]> {
    {
      const token = this.getToken();
      return this.http.delete<any[]>(
        `http://localhost:5002/api/v1/Admin/Delete-Client/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    }
  }

  public UpdateClientDetails(data: ClientUpdateRequestDTO): Observable<any> {
    return new Observable((observer) => {
      // ✅ Get the token from localStorage
      const token = this.getToken();
      // console.log('Token:', token);
      this.http
        .put<{ message: string }>(
          `http://localhost:5002/api/v1/Client/update-client-details`,
          data,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
        .subscribe({
          next: (response) => {
            console.log('Client update successful:', response);
            this.router.navigate(['/client-dashboard']);
            observer.next(response.message);
            observer.complete();
          },
          error: (error) => {
            console.error('Client update failed:', error);
            observer.error(error?.error?.message || 'Update failed');
          },
        });
    });
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
