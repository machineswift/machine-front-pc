import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {TokenService} from '../auth/token.service';
import {environment} from '../../../../environments/environment';
import {ApiResponse} from '../../../interfaces/api.interface';
import {PermissionDetail, PermissionItem} from '../../../interfaces/iam/permission/permission.interface';

@Injectable({
  providedIn: 'root'
})
export class PermissionService {
  private baseUrl = `${environment.apiBaseUrl}/xijie-iam-app`;

  constructor(private http: HttpClient,
              private tokenService: TokenService) {
  }

  createPermission(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/iam/permission/create`, data);
  }

  deletePermission(id: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/iam/permission/delete`, { id });
  }

  updatePermission(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/iam/permission/update`, data);
  }

  getDetail(id: string): Observable<PermissionDetail> {
    return this.http.post<ApiResponse<PermissionDetail>>(`${this.baseUrl}/iam/permission/detail`, { id }).pipe(
      map(response => response.data)
    );
  }

  getAppList(): Observable<PermissionItem[]> {
    const headers = new HttpHeaders({
      'Authorization': this.tokenService.getAuthorizationHeader()
    });

    return this.http.post<ApiResponse<PermissionItem[]>>(`${this.baseUrl}/iam/permission/list_app`,
      {status: 'ENABLE'},
      {headers}
    ).pipe(
      map(response => response.data)
    );
  }

  getModuleList(appId: string): Observable<PermissionItem[]> {
    const headers = new HttpHeaders({
      'Authorization': this.tokenService.getAuthorizationHeader()
    });

    return this.http.post<ApiResponse<PermissionItem[]>>(`${this.baseUrl}/iam/permission/list_sub`,
      {id: appId},
      {headers}
    ).pipe(
      map(response => response.data)
    );
  }

  getTree(permissionId: string): Observable<PermissionItem> {
    const headers = new HttpHeaders({
      'Authorization': this.tokenService.getAuthorizationHeader()
    });

    return this.http.post<ApiResponse<PermissionItem>>(`${this.baseUrl}/iam/permission/tree`,
      {id: permissionId},
      {headers}
    ).pipe(
      map(response => response.data)
    );
  }
}
