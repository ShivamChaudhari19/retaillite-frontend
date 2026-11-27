import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { AuthSession } from '@/shared/types';

// const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1.0';
const API_BASE_URL = 'http://localhost:8080/api/v1.0';

/** Read `exp` from a JWT without verifying it. Non-JWT tokens are treated as non-expiring. */
const isTokenExpired = (token: string): boolean => {
  try {
    const payload = token.split('.')[1];
    if (!payload) return false;
    const json = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    return typeof json.exp === 'number' && json.exp * 1000 <= Date.now();
  } catch {
    return false;
  }
};

const redirectToLogin = () => {
  if (window.location.pathname !== '/login') {
    window.location.replace('/login');
  }
};

class ApiClient {
  private client: AxiosInstance;
  private authSession: AuthSession | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 15000,
      // headers: {
      //   'Content-Type': 'application/json',
      // },
    });

    this.setupInterceptors();
    this.loadAuthSession();
  }

  private setupInterceptors(): void {
    // Request: attach token, and drop an expired session before calling the server.
    // (Spring Security often answers an expired/missing token with 403 "Access Denied",
    //  not 401, so we can't rely on the response status alone.)
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = this.authSession?.token;
        if (token) {
          if (isTokenExpired(token)) {
            this.clearAuthSession();
            redirectToLogin();
            return Promise.reject(new axios.Cancel('Session expired'));
          }
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response: a 401 on a normal request means the session is invalid.
    // A 401 from the login call itself just means wrong credentials - the Login
    // page must stay mounted so it can show that message (previously the page
    // reloaded and the message was lost).
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        const isLoginCall = error.config?.url?.includes('/auth/login');
        if (error.response?.status === 401 && !isLoginCall) {
          this.clearAuthSession();
          redirectToLogin();
        }
        return Promise.reject(error);
      }
    );
  }

  setAuthSession(session: AuthSession): void {
    this.authSession = session;
    localStorage.setItem('auth_session', JSON.stringify(session));
  }

  private loadAuthSession(): void {
    try {
      const stored = localStorage.getItem('auth_session');
      if (stored) {
        const session = JSON.parse(stored) as AuthSession;
        if (session?.token && !isTokenExpired(session.token)) {
          this.authSession = session;
        } else {
          this.clearAuthSession();
        }
      }
    } catch (e) {
      console.error('Failed to load auth session:', e);
      this.clearAuthSession();
    }
  }

  clearAuthSession(): void {
    this.authSession = null;
    localStorage.removeItem('auth_session');
  }

  getAuthSession(): AuthSession | null {
    return this.authSession;
  }

  isAuthenticated(): boolean {
    return !!this.authSession?.token && !isTokenExpired(this.authSession.token);
  }

  getClient(): AxiosInstance {
    return this.client;
  }
}

export const apiClient = new ApiClient();
