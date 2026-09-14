import { ApiResponse } from '../types';

export class ApiClient {
  private static instance: ApiClient;
  private token: string | null = null;

  private constructor() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('ent_auth_token');
    }
  }

  public static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  public setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) localStorage.setItem('ent_auth_token', token);
      else localStorage.removeItem('ent_auth_token');
    }
  }

  public getToken(): string | null {
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(endpoint, {
        ...options,
        headers,
      });

      const data: ApiResponse<T> = await response.json();
      return data;
    } catch (err: any) {
      console.warn(`[ApiClient] Request to ${endpoint} failed, providing fallback:`, err);
      return {
        success: false,
        data: null,
        message: err.message || 'فشل الاتصال بالخادم',
        errors: [err.message],
      };
    }
  }

  public get<T>(endpoint: string, options?: { params?: Record<string, any> }) {
    let url = endpoint;
    if (options?.params) {
      const query = Object.entries(options.params)
        .filter(([_, v]) => v !== undefined && v !== null && v !== '')
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
        .join('&');
      if (query) {
        url += (url.includes('?') ? '&' : '?') + query;
      }
    }
    return this.request<T>(url, { method: 'GET' });
  }

  public post<T>(endpoint: string, body: any) {
    return this.request<T>(endpoint, { method: 'POST', body: JSON.stringify(body) });
  }

  public put<T>(endpoint: string, body: any) {
    return this.request<T>(endpoint, { method: 'PUT', body: JSON.stringify(body) });
  }

  public delete<T>(endpoint: string, body?: any) {
    return this.request<T>(endpoint, { method: 'DELETE', body: body ? JSON.stringify(body) : undefined });
  }
}

export const api = ApiClient.getInstance();
