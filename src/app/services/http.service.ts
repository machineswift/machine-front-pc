import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../interfaces/api.interface';

@Injectable({
  providedIn: 'root'
})
export class HttpService {
  constructor(private http: HttpClient) {}

  get<T>(path: string, params?: any): Observable<ApiResponse<T>> {
    const url = `${environment.apiBaseUrl}${path}`;
    return this.http.get<ApiResponse<T>>(url,
      { params: new HttpParams({ fromObject: params || {} }) });
  }

  post<T>(path: string, body: any): Observable<ApiResponse<T>> {
    const url = `${environment.apiBaseUrl}${path}`;
    return this.http.post<ApiResponse<T>>(url, body);
  }

  put<T>(path: string, body: any): Observable<ApiResponse<T>> {
    const url = `${environment.apiBaseUrl}${path}`;
    return this.http.put<ApiResponse<T>>(url, body);
  }

  delete<T>(path: string): Observable<ApiResponse<T>> {
    const url = `${environment.apiBaseUrl}${path}`;
    return this.http.delete<ApiResponse<T>>(url);
  }
}
