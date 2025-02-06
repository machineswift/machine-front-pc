import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from '../services/iam/auth/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const snackBar = inject(MatSnackBar);

  if (authService.isAuthenticated()) {
    return true;
  }

  const snackBarRef = snackBar.open('请先登录，是否返回首页？', '确认', {
    duration: 5000,
    horizontalPosition: 'center',
    verticalPosition: 'top'
  });

  snackBarRef.onAction().subscribe(() => {
    const returnUrl = state.url;
    router.navigate(['/'], {
      queryParams: { returnUrl }
    });
  });

  return false;
};
