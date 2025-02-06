import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { TokenService } from '../services/iam/auth/token.service';

export const AuthInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  const tokenService = inject(TokenService);
  const router = inject(Router);
  
  const token = tokenService.getAuthorizationHeader();
  
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: token
      }
    });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        tokenService.clearTokens();
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};