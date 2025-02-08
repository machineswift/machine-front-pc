import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../interfaces/api.interface';

interface CaptchaData {
  userKey: string;
  captchaImg: string;
}

@Injectable({
  providedIn: 'root'
})
export class CaptchaService {
  private apiUrl = `${environment.apiBaseUrl}/machine-iam-app/iam/auth/pic_captcha`;

  constructor(private http: HttpClient) {}

  getCaptcha(): Observable<CaptchaData> {
    return this.http.get<ApiResponse<CaptchaData>>(this.apiUrl).pipe(
      map(response => response.data)
    );
  }
}
