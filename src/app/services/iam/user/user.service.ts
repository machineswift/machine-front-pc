import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {TokenService} from '../auth/token.service';
import {environment} from '../../../../environments/environment';
import {ApiResponse} from '../../../interfaces/api.interface';

export interface UserInfo {
  id: string;
  userName: string;
  code: string;
  name: string;
  phone: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private baseUrl = `${environment.apiBaseUrl}/machine-iam-app`;

  constructor(private http: HttpClient,
              private tokenService: TokenService) {
  }

  getCurrentUserInfo(): Observable<UserInfo> {
    const headers = new HttpHeaders({
      'Authorization': this.tokenService.getAuthorizationHeader()
    });

    return this.http.get<ApiResponse<UserInfo>>(`${this.baseUrl}/iam/current/user_info`,
      {headers})
      .pipe(
        map(response => response.data)
      );
  }
}
