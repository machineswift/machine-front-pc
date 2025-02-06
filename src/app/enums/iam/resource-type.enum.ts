export enum ResourceType {
  APP = 'APP',
  MODULE = 'MODULE',
  MENU = 'MENU',
  BUTTON = 'BUTTON'
}

export const ResourceTypeLabel: { [key in ResourceType]: string } = {
  [ResourceType.APP]: '应用',
  [ResourceType.MODULE]: '模块',
  [ResourceType.MENU]: '菜单',
  [ResourceType.BUTTON]: '按钮'
};

export const ResourceTypeIcon: { [key in ResourceType]: string } = {
  [ResourceType.APP]: 'apps',
  [ResourceType.MODULE]: 'folder',
  [ResourceType.MENU]: 'menu',
  [ResourceType.BUTTON]: 'smart_button'
};
