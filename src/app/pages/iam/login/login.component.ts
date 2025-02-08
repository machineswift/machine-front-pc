import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators, ReactiveFormsModule} from '@angular/forms';
import {Router} from '@angular/router';
import {MatCardModule} from '@angular/material/card';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatSnackBarModule, MatSnackBar} from '@angular/material/snack-bar';
import {NgIf} from '@angular/common';
import {finalize} from 'rxjs/operators';
import {CaptchaService} from '../../../services/iam/auth/captcha.service';
import {AuthService} from '../../../services/iam/auth/auth.service';
import {MatIcon} from '@angular/material/icon';
import {MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    NgIf,
    MatIcon,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ]
})
export class LoginComponent implements OnInit {
  hidePassword = true;
  isLoading = false;
  loginForm: FormGroup;
  captchaImg: string = 'data:image/png;base64,';
  userKey: string = '';

  constructor(
    private fb: FormBuilder,
    private captchaService: CaptchaService,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<LoginComponent>  // 添加这行
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]],
      captcha: ['', [Validators.required]]
    });
  }

  closeDialog() {
    this.dialogRef.close();
  }

  ngOnInit() {
    this.refreshCaptcha();
  }

  refreshCaptcha() {
    this.captchaService.getCaptcha().subscribe(data => {
      this.captchaImg = data.captchaImg;
      this.userKey = data.userKey;
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      const loginData = {
        userName: this.loginForm.value.username,
        password: this.loginForm.value.password,
        captcha: this.loginForm.value.captcha,
        userKey: this.userKey
      };

      this.authService.login(loginData).pipe(
        finalize(() => this.isLoading = false)
      ).subscribe({
        next: (response) => {
          localStorage.setItem('accessToken', response.accessToken);
          localStorage.setItem('refreshToken', response.refreshToken);
          this.router.navigate(['/main']);
          this.dialogRef.close();
        },
        error: (error) => {
          this.snackBar.open(error.error?.message || '登录失败，请重试', '关闭', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top'
          });
          this.refreshCaptcha();
          this.loginForm.get('captcha')?.reset();
        }
      });
    }
  }
}
