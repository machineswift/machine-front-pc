export interface PermissionItem {
  id: string;
  parentId: string;
  name: string;
  sort: number;
  children?: PermissionItem[];
  code: string;
  status: string;
  resourceType: string;
  path: string;
  iconUrl: string;
  dataMetaInto: string;
  description: string;
}

export interface PermissionDetail extends PermissionItem {
  createName: string;
  createBy: string;
  createTime: number;
  updateName: string;
  updateBy: string;
  updateTime: number;
}
