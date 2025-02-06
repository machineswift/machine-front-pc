import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDialog } from '@angular/material/dialog';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import { LoginComponent } from '../iam/login/login.component';
import { AuthService } from '../../services/iam/auth/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    RouterLink
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  constructor(
    private dialog: MatDialog,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {

    if (this.authService.isAuthenticated()) {
      const returnUrl = this.route.snapshot.queryParams['returnUrl'];
      if (returnUrl) {
        this.router.navigateByUrl(returnUrl);
      } else {
        this.router.navigate(['/main']);
      }
    }
  }

  openLoginDialog() {
    const dialogRef = this.dialog.open(LoginComponent, {
      width: '400px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(() => {
      if (this.authService.isAuthenticated()) {
        this.router.navigate(['/main']);
      }
    });
  }
}
