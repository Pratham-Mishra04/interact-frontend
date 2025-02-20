import {
  COMMUNITY_ADMIN,
  COMMUNITY_MEMBER,
  COMMUNITY_MODERATOR,
  ORG_MANAGER,
  ORG_MEMBER,
  ORG_SENIOR,
  PROJECT_EDITOR,
  PROJECT_MANAGER,
  PROJECT_MEMBER,
} from '@/config/constants';

export const getResourcesAccessList = (resourceType: string) => {
  if (resourceType == 'org') {
    return [ORG_MEMBER, ORG_SENIOR, ORG_MANAGER];
  } else if (resourceType == 'project') {
    return [PROJECT_MEMBER, PROJECT_EDITOR, PROJECT_MANAGER];
  } else if (resourceType == 'community') {
    return [COMMUNITY_MEMBER, COMMUNITY_ADMIN, COMMUNITY_MODERATOR];
  }

  return [];
};

export const formatPrice = (price: number) => {
  if (price < 1000) return price;
  return parseFloat((price / 1000).toFixed(1)) + 'K';
};
