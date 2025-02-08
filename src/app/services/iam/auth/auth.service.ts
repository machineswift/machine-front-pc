import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';
import {map, tap} from 'rxjs/operators';
import {environment} from '../../../../environments/environment';
import {ApiResponse} from '../../../interfaces/api.interface';
import {TokenService} from './token.service';
import {HttpService} from '../../http.service';

interface AuthTokenData {
  accessToken: string;
  expiresIn: number;
  refreshToken: string;
  tokenType: string;
}

interface LoginRequest {
  userName: string;
  password: string;
  captcha: string;
  userKey: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(
    private httpService: HttpService,
    private tokenService: TokenService
  ) {
  }

  login(loginData: LoginRequest): Observable<AuthTokenData> {
    return this.httpService.post<AuthTokenData>('/machine-iam-app/iam/auth/login/username', loginData).pipe(
      tap(response => {
        const {accessToken, refreshToken} = response.data;
        this.tokenService.setTokens(accessToken, refreshToken);
      }),
      map(response => response.data)
    );
  }

  logout(): Observable<any> {
    return this.httpService.get('/machine-iam-app/iam/auth/logout').pipe(
      tap(() => {
        this.tokenService.clearTokens();
      })
    );
  }

  isAuthenticated(): boolean {
    return this.tokenService.hasValidToken();
  }
}
