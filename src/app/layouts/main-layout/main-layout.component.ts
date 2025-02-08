import {Component, OnInit} from '@angular/core';
import {Router, RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatToolbarModule} from '@angular/material/toolbar';
import {AuthService} from '../../services/iam/auth/auth.service';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatListModule} from '@angular/material/list';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatMenuModule} from '@angular/material/menu';
import {MatDividerModule} from '@angular/material/divider';
import {NgFor} from '@angular/common';
import {UserInfo, UserService} from '../../services/iam/user/user.service'
import {PermissionItem} from '../../interfaces/iam/permission/permission.interface';
import {MatTreeModule} from '@angular/material/tree';
import {PermissionService} from '../../services/iam/permission/permission.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss'],
  imports: [
    MatToolbarModule,
    MatButtonModule,
    MatDividerModule,
    MatExpansionModule,
    MatIconModule,
    MatMenuModule,
    MatListModule,
    MatSidenavModule,
    MatTreeModule,
    RouterOutlet,
    RouterLink,
    NgFor,
    RouterLinkActive
  ]
})
export class MainLayoutComponent implements OnInit {

  currentUser: UserInfo | null = null;
  moduleItems: PermissionItem[] = [];
  menuItems: PermissionItem[] = [];
  selectedModule: string = '';

  constructor(
    private router: Router,
    private authService: AuthService,
    private userService: UserService,
    private menuService: PermissionService
  ) {
  }

  ngOnInit() {
    this.loadModules();
    this.loadUserInfo();
  }

  private loadUserInfo() {
    this.userService.getCurrentUserInfo().subscribe({
      next: (userInfo) => {
        this.currentUser = userInfo;
      },
      error: (error) => {
        console.error('获取用户信息失败', error);
      }
    });
  }

  private loadModules() {
    this.menuService.getModuleList('manage').subscribe({
      next: (modules) => {
        this.moduleItems = modules;
        if (modules.length > 0) {
          this.loadSubMenus(modules[0].id);
        }
      },
      error: (error) => {
        console.error('获取菜单失败', error);
      }
    });
  }

  loadSubMenus(moduleId: string) {
    this.selectedModule = moduleId;
    this.menuService.getTree(moduleId).subscribe({
      next: (subMenus) => {
        const filterMenus = (items: PermissionItem[]): PermissionItem[] => {
          return items
            .filter(item => item.resourceType === 'MENU')
            .map(item => ({
              ...item,
              children: item.children ? filterMenus(item.children) : []
            }));
        };

        this.menuItems = filterMenus(subMenus.children || []);
      },
      error: (error) => {
        console.error('获取子菜单失败', error);
      }
    });
  }

  logout() {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: (error) => {
        console.error('登出失败', error);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        this.router.navigate(['/']);
      }
    });
  }

  childrenAccessor = (node: PermissionItem) => node.children ?? [];
  hasChild = (_: number, node: PermissionItem) => !!node.children && node.children.length > 0;
}
