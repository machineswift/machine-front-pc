import {Component, OnInit} from '@angular/core';
import {MatFormFieldModule} from '@angular/material/form-field';
import {CommonModule, DatePipe, NgForOf} from '@angular/common';
import {MatInputModule} from '@angular/material/input';
import {MatIconModule} from '@angular/material/icon';
import {MatTreeModule} from '@angular/material/tree';
import {MatToolbar} from '@angular/material/toolbar';
import {MatRadioModule} from '@angular/material/radio';
import {MatCardModule} from '@angular/material/card';
import {FormBuilder, FormGroup} from '@angular/forms';
import {MatDialog} from '@angular/material/dialog';
import {MatDividerModule} from '@angular/material/divider';
import {MatOption, MatSelect} from '@angular/material/select';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatGridList, MatGridTile} from '@angular/material/grid-list';
import {FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {
  ResourceType,
  ResourceTypeIcon,
  ResourceTypeLabel
} from '../../../enums/iam/resource-type.enum';
import {
  PermissionService
} from '../../../services/iam/permission/permission.service';
import {
  PermissionDetail,
  PermissionItem
} from '../../../interfaces/iam/permission/permission.interface';
import {
  ConfirmDialogComponent
} from '../../../shared/components/confirm-dialog/confirm-dialog.component';


@Component({
  selector: 'app-menu',
  standalone: true,
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss',
  imports: [
    CommonModule,
    FormsModule,
    MatButton,
    MatCardModule,
    MatDividerModule,
    MatFormFieldModule,
    MatIconButton,
    MatIconModule,
    MatInputModule,
    DatePipe,
    MatRadioModule,
    MatToolbar,
    MatTreeModule,
    NgForOf,
    MatGridList,
    MatGridTile,
    ReactiveFormsModule,
    MatSelect,
    MatOption
  ]
})
export class MenuComponent implements OnInit {

  // State management
  isCreating = false;
  isEditing = false;
  isViewing = false;
  expandedNodes: Set<string> = new Set();

  // Data properties
  apps: PermissionItem[] = [];
  moduleList: PermissionItem[] = [];
  treePermission: PermissionItem[] = [];
  selectedDetail: PermissionDetail | null = null;
  selectedParentNode: PermissionItem | null = null;

  // Selection state
  selectedApp: string = '';
  selectedModule: string = '';
  selectedNodeId: string = '';

  // Forms
  createForm!: FormGroup;
  editForm!: FormGroup;

  // 添加资源类型选项
  resourceTypeOptions = [
    {value: ResourceType.MENU, label: ResourceTypeLabel[ResourceType.MENU]},
    {value: ResourceType.BUTTON, label: ResourceTypeLabel[ResourceType.BUTTON]}
  ];

  constructor(
    private fb: FormBuilder,
    private permissionService: PermissionService,
    private dialog: MatDialog
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadApps();
  }

  // Form operations
  private initializeForm(): void {
    this.createForm = this.fb.group({
      code: ['', Validators.required],
      name: ['', Validators.required],
      path: ['', Validators.required],
      iconUrl: [''],
      resourceType: [ResourceType.MENU, Validators.required],
      sort: [0, [Validators.required, Validators.min(0)]],
      dataMetaInto: [''],
      description: ['']
    });

    this.editForm = this.fb.group({
      id: [''],
      code: ['', Validators.required],
      name: ['', Validators.required],
      path: ['', Validators.required],
      iconUrl: [''],
      sort: [0, [Validators.required, Validators.min(0)]],
      dataMetaInto: [''],
      description: ['']
    });
  }

  startCreate(node: PermissionItem, event: Event): void {
    event.stopPropagation();
    this.isCreating = true;
    this.isEditing = false;
    this.isViewing = false;
    this.selectedParentNode = node;
    this.createForm.reset({sort: 0});
  }

  startEdit(): void {
    this.isEditing = true;
    this.isCreating = false;
    this.isViewing = false;
    this.editForm.patchValue(this.selectedDetail!);
  }

  cancelCreate(): void {
    this.isCreating = false;
    this.isEditing = false;
    this.isViewing = true;
    this.selectedParentNode = null;
    this.createForm.reset();
  }

  cancelEdit(): void {
    this.isCreating = false;
    this.isEditing = false;
    this.isViewing = true;
    this.editForm.reset();
  }

  saveNewMenu(): void {
    if (this.createForm.invalid) {
      Object.keys(this.createForm.controls).forEach(key => {
        const control = this.createForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
      return;
    }

    if (!this.selectedParentNode) {
      return;
    }

    const createData = {
      ...this.createForm.value,
      parentId: this.selectedParentNode.id
    };


    this.permissionService.createPermission(createData).subscribe({
      next: (response) => {
        this.loadSubMenus(this.selectedModule);
        this.isCreating = false;
        this.isEditing = false;
        this.isViewing = true;
        this.selectedParentNode = null;
        this.createForm.reset();

        setTimeout(() => {
          this.selectNode({id: response.id} as PermissionItem);
        }, 100);
      },
      error: (error) => {
        console.error('创建失败', error);
      }
    });
  }

  confirmDelete(node: PermissionItem, event: Event): void {
    event.stopPropagation(); // 阻止事件冒泡

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '300px',
      data: {
        title: '确认删除',
        message: `确定要删除"${node.name}"吗？`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deleteNode(node.id);
      }
    });
  }

  private deleteNode(id: string): void {
    this.permissionService.deletePermission(id).subscribe({
      next: () => {
        // 删除成功后重新加载树
        this.loadSubMenus(this.selectedModule);
      },
      error: (error) => {
        console.error('删除失败', error);
      }
    });
  }

  saveChanges(): void {
    if (!this.editForm.valid) return;

    const updateData = this.editForm.value;
    this.permissionService.updatePermission(updateData).subscribe({
      next: () => this.handleUpdateSuccess(updateData.id),
      error: this.handleError('更新失败')
    });
  }

  // Tree operations
  private handleUpdateSuccess(updatedId: string): void {
    this.loadTreeAndSelectNode(updatedId);
  }

  private loadTreeAndSelectNode(nodeId: string): void {
    this.permissionService.getTree(this.selectedModule).subscribe({
      next: (treePermission) => {
        this.treePermission = treePermission?.children || [];
        this.updateNodeSelection(nodeId);
      }
    });
  }

  private updateNodeSelection(nodeId: string): void {
    this.permissionService.getDetail(nodeId).subscribe({
      next: (detail) => {
        this.selectedDetail = detail;
        this.selectedNodeId = detail.id;
        this.isEditing = false;

        setTimeout(() => {
          this.expandedNodes.clear();
          this.findAndExpandParents(this.treePermission, detail.id);
        });
      }
    });
  }

  // Node expansion handling
  findAndExpandParents(nodes: PermissionItem[], targetId: string, parentIds: string[] = []): boolean {
    for (const node of nodes) {
      const currentPath = [...parentIds, node.id];

      if (node.id === targetId) {
        parentIds.forEach(id => this.expandedNodes.add(id));
        return true;
      }

      if (node.children?.length && this.findAndExpandParents(node.children, targetId, currentPath)) {
        return true;
      }
    }
    return false;
  }

  isExpanded(node: PermissionItem): boolean {
    return this.expandedNodes.has(node.id);
  }

  onNodeToggle(node: PermissionItem): void {
    if (this.expandedNodes.has(node.id)) {
      this.expandedNodes.delete(node.id);
    } else {
      this.expandedNodes.add(node.id);
    }
  }

  // Data loading
  private loadApps(): void {
    this.permissionService.getAppList().subscribe({
      next: (apps) => {
        this.apps = apps;
        if (apps.length > 0) {
          this.selectedApp = apps[0].id;
          this.loadModuleMenus(apps[0].id);
        }
      },
      error: this.handleError('获取应用失败')
    });
  }

  onAppChange(event: { value: string }): void {
    if (event.value) {
      this.loadModuleMenus(event.value);
    }
  }

  loadModuleMenus(appId: string): void {
    this.permissionService.getModuleList(appId).subscribe({
      next: (modules) => {
        this.moduleList = modules;
        if (modules.length > 0) {
          this.loadSubMenus(modules[0].id);
        }
      },
      error: this.handleError('获取模块失败')
    });
  }

  loadSubMenus(moduleId: string): void {
    this.selectedModule = moduleId;
    this.permissionService.getTree(moduleId).subscribe({
      next: (treePermission) => {
        this.treePermission = treePermission?.children || [];
        this.selectedDetail = null;
      },
      error: this.handleError('获取菜单失败')
    });
  }

  selectNode(node: PermissionItem): void {
    this.isViewing = true;
    this.selectedNodeId = node.id;
    this.permissionService.getDetail(node.id).subscribe({
      next: (detail) => this.selectedDetail = detail,
      error: this.handleError('获取菜单详情失败')
    });
  }

  // Utility methods
  private handleError(message: string) {
    return (error: any) => console.error(message, error);
  }

  getResourceTypeLabel(type: string): string {
    return ResourceTypeLabel[type as ResourceType];
  }

  getResourceTypeIcon(type: string): string {
    return ResourceTypeIcon[type as ResourceType];
  }

  childrenAccessor = (node: PermissionItem): PermissionItem[] => node.children ?? [];

  hasChild = (_: number, node: PermissionItem): boolean =>
    !!node.children && node.children.length > 0;

  getNodePath(node: PermissionDetail): string {
    if (!node) return '';

    const path: string[] = [node.name];
    let currentNode = this.findNodeById(this.treePermission, node.parentId);

    while (currentNode) {
      path.unshift(currentNode.name);
      currentNode = this.findNodeById(this.treePermission, currentNode.parentId);
    }

    return path.join(' / ');
  }

  private findNodeById(nodes: PermissionItem[], id: string): PermissionItem | null {
    if (!nodes) return null;

    for (const node of nodes) {
      if (node.id === id) return node;

      if (node.children) {
        const found = this.findNodeById(node.children, id);
        if (found) return found;
      }
    }

    return null;
  }
}
