import {Router, Routes} from '@angular/router';
import {MainLayoutComponent} from './layouts/main-layout/main-layout.component';
import {authGuard} from './guards/auth.guard';
import {HomeComponent} from './pages/home/home.component';
import {inject} from '@angular/core';
import {MatSnackBar} from '@angular/material/snack-bar';
import {AuthService} from './services/iam/auth/auth.service';
import {MenuComponent} from './pages/iam/menu/menu.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent
  },
  {
    path: 'main',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        title: '菜单管理',
        path: 'iam/menu',
        component: MenuComponent
      }
    ]
  },
  {
    path: '**',
    resolve: {
      path: () => {
        return new Promise(resolve => {
          const snackBar = inject(MatSnackBar);
          const router = inject(Router);
          const authService = inject(AuthService);

          const snackBarRef = snackBar.open('很遗憾，您要找的页面没找到！  :)', '确认', {
            duration: 5000,
            horizontalPosition: 'center',
            verticalPosition: 'top'
          });

          snackBarRef.onAction().subscribe(() => {
            if (authService.isAuthenticated()) {
              // 获取上一次访问的路由
              const navigation = router.getCurrentNavigation();
              const previousUrl = navigation?.previousNavigation?.finalUrl?.toString() || '/main';

              // 如果上一个路由是 404 页面，则返回首页
              if (previousUrl.includes('**')) {
                router.navigate(['/main']);
              } else {
                router.navigate([previousUrl]);
              }
            } else {
              router.navigate(['/']);
            }
          });
        });
      }
    },
    component: HomeComponent
  }
];
