import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import {
  UserRole,
  type AuthResponse,
  type CreateUserInput,
  type ForgotPasswordInput,
  type ForgotPasswordResponse,
  type LoginInput,
  type ResetPasswordInput,
  type ResetPasswordResponse,
  type ChangePasswordInput,
  type ChangePasswordResponse,
  type UpdateProfileInput,
  type User,
} from '@wastegrab/shared';
import { map, of, tap, catchError } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiBaseUrl}/auth`;
  private readonly requestOptions = { withCredentials: true as const };

  readonly currentUser = signal<User | null>(null);
  readonly hasLoadedSession = signal(false);
  readonly isAuthenticated = computed(() => this.currentUser() !== null);

  loadSession() {
    return this.http.get<AuthResponse>(`${this.apiUrl}/me`, this.requestOptions).pipe(
      map((response) => this.ensureValidUser(response.user)),
      tap((user) => {
        this.currentUser.set(user);
        this.hasLoadedSession.set(true);
      }),
      catchError(() => {
        this.currentUser.set(null);
        this.hasLoadedSession.set(true);
        return of(null);
      }),
    );
  }

  login(input: LoginInput) {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, input, this.requestOptions).pipe(
      map((response) => this.ensureValidUser(response.user)),
      tap((user) => this.setSession(user)),
    );
  }

  register(input: CreateUserInput) {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, input, this.requestOptions).pipe(
      map((response) => this.ensureValidUser(response.user)),
      tap((user) => this.setSession(user)),
    );
  }

  logout() {
    return this.http.post<void>(`${this.apiUrl}/logout`, {}, this.requestOptions).pipe(
      tap(() => this.clearSession()),
    );
  }

  forgotPassword(email: string) {
    const input: ForgotPasswordInput = { email };
    return this.http.post<ForgotPasswordResponse>(`${this.apiUrl}/forgot-password`, input, this.requestOptions);
  }

  resetPassword(token: string, password: string) {
    const input: ResetPasswordInput = { token, password };
    return this.http.post<ResetPasswordResponse>(`${this.apiUrl}/reset-password`, input, this.requestOptions);
  }

  completeOnboarding() {
    return this.http.post<AuthResponse>(`${this.apiUrl}/onboarding/complete`, {}, this.requestOptions).pipe(
      map((response) => this.ensureValidUser(response.user)),
      tap((user) => this.setSession(user)),
    );
  }

  uploadAvatar(file: File) {
    const payload = new FormData();
    payload.append('avatar', file);

    return this.http.patch<AuthResponse>(`${this.apiUrl}/profile/avatar`, payload, this.requestOptions).pipe(
      map((response) => this.ensureValidUser(response.user)),
      tap((user) => this.setSession(user)),
    );
  }

  updateProfile(input: UpdateProfileInput) {
    return this.http.patch<AuthResponse>(`${this.apiUrl}/profile`, input, this.requestOptions).pipe(
      map((response) => this.ensureValidUser(response.user)),
      tap((user) => this.setSession(user)),
    );
  }

  changePassword(input: ChangePasswordInput) {
    return this.http.post<ChangePasswordResponse>(`${this.apiUrl}/change-password`, input, this.requestOptions).pipe(
      tap((response) => this.setSession(this.ensureValidUser(response.user))),
    );
  }

  getDefaultRouteForRole(role: User['role']): string {
    switch (role) {
      case UserRole.ADMIN:
        return '/admin';
      case UserRole.COLLECTOR:
        return '/collector';
      case UserRole.CUSTOMER:
        return '/customer';
      default:
        throw new Error('Invalid user role.');
    }
  }

  private ensureValidUser(user: User | null): User {
    if (!user) {
      throw new Error('Invalid user data.');
    }

    if (!Object.values(UserRole).includes(user.role)) {
      throw new Error('Invalid user role.');
    }

    return user;
  }

  private setSession(user: User): void {
    this.currentUser.set(user);
    this.hasLoadedSession.set(true);
  }

  private clearSession(): void {
    this.currentUser.set(null);
    this.hasLoadedSession.set(true);
  }
}
