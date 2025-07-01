import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { jwtDecode } from 'jwt-decode';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const token = this.getToken();

    if (!token) {
      this.router.navigate(['/']);
      return false;
    }

    const decoded: any = jwtDecode(token);
    const userRole = decoded.role || decoded.Role || decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];

    const expectedRoles: string[] = route.data['roles'];

    if (expectedRoles && expectedRoles.includes(userRole)) {
      return true;
    }

    // unauthorized
    this.router.navigate(['/unauthorized']);
    return false;
  }

  private getToken(): string | null {
    const user = localStorage.getItem('user');
    const token= user ? JSON.parse(user).token : null;
    console.log('User from localStorage:',token);
    return token;
  }
}
