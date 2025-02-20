import {
  ORG_MANAGER,
  ORG_MEMBER,
  ORG_SENIOR,
  PROJECT_EDITOR,
  PROJECT_MANAGER,
  PROJECT_MEMBER,
  PROJECT_OWNER,
} from '@/config/constants';
import { OrgState } from '@/slices/orgSlice';
import { UserState } from '@/slices/userSlice';
import { store } from '@/store';
import { Organization, PermissionConfig, Project } from '@/types';
import { initialOrganization, initialOrganizationMembership, initialUser } from '@/types/initials';

interface OrgAccessState {
  user: UserState;
  organization: OrgState;
}

const checkOrgAccess = (state: OrgAccessState, accessRole: string, orgID?: string) => {
  const user = state.user || initialUser;
  const org = state.organization?.currentOrg || initialOrganization;
  const membership = state.organization?.currentOrgMembership || initialOrganizationMembership;

  if (user.id == '' || org.id == '') return false;

  if (user.id == org.userID) return true;
  if (membership.id == '' || org.id != membership.organizationID) return false;

  if (orgID && orgID != org.id) return false;

  switch (accessRole) {
    case ORG_MANAGER:
      return membership.role == ORG_MANAGER;
    case ORG_SENIOR:
      return membership.role == ORG_MANAGER || membership.role == ORG_SENIOR;
    case ORG_MEMBER:
      return true;
    default:
      return false;
  }
};

export const checkOrgAccessByOrgUserID = (state: OrgAccessState, accessRole: string, orgUserID: string) => {
  const user = state.user || initialUser;
  const org = state.organization.currentOrg || initialOrganization;
  const membership = state.organization.currentOrgMembership || initialOrganizationMembership;

  if (user.id == '' || org.id == '') return false;

  if (user.id == org.userID) return true;
  if (membership.id == '' || org.id != membership.organizationID) return false;

  if (orgUserID != org.userID) return false;

  switch (accessRole) {
    case ORG_MANAGER:
      return membership.role == ORG_MANAGER;
    case ORG_SENIOR:
      return membership.role == ORG_MANAGER || membership.role == ORG_SENIOR;
    case ORG_MEMBER:
      return true;
    default:
      return false;
  }
};

export const checkParticularOrgAccess = (accessRole: string, checkOrg: Organization | null) => {
  const user = store.getState().user || initialUser;

  if (!checkOrg) return false;
  if (user.id == '' || checkOrg.id == '') return false;

  if (user.id == checkOrg.userID) return true;

  const memberships = user.organizationMemberships;

  var checkerMembership = initialOrganizationMembership;

  memberships.forEach(m => {
    if (m.organizationID == checkOrg.id) checkerMembership = m;
  });

  if (checkerMembership.id == '') return false;

  switch (accessRole) {
    case ORG_MANAGER:
      return checkerMembership.role == ORG_MANAGER;
    case ORG_SENIOR:
      return checkerMembership.role == ORG_MANAGER || checkerMembership.role == ORG_SENIOR;
    case ORG_MEMBER:
      return true;
    default:
      return false;
  }
};

export const checkProjectAccess = (user: UserState, role: string, projectID?: string, project?: Project) => {
  if (!user) return false;

  const ownerProjects = user.ownerProjects;
  const managerProjects = user.managerProjects;
  const editorProjects = user.editorProjects;
  const memberProjects = user.memberProjects;

  if (!projectID) return false;

  const isOwner = ownerProjects.includes(projectID) || project?.userID == user.id;
  const isManager = managerProjects.includes(projectID);
  const isEditor = editorProjects.includes(projectID);
  const isMember = memberProjects.includes(projectID);

  switch (role) {
    case PROJECT_OWNER:
      return isOwner;
    case PROJECT_MANAGER:
      return isOwner || isManager;
    case PROJECT_EDITOR:
      return isOwner || isManager || isEditor;
    case PROJECT_MEMBER:
      return isOwner || isManager || isEditor || isMember;
    default:
      return false;
  }
};

//TODO take orgID from project
export const checkOrgProjectAccess = (
  state: OrgAccessState,
  projectRole: string,
  projectID: string,
  orgRole: string,
  org?: Organization | null,
  isOrgProject: boolean = false
) => {
  const projectAccess = checkProjectAccess(state.user, projectRole, projectID);
  const orgAccess = org
    ? checkParticularOrgAccess(orgRole, org)
    : isOrgProject
    ? checkOrgAccess(state, orgRole)
    : false;

  return projectAccess || orgAccess;
};

export const checkCommunityAccess = (
  user: UserState,
  communityID: string,
  action: string,
  config?: PermissionConfig
) => {
  if (!user) return false;

  const membership = user?.communityMemberships?.filter(m => m.communityID == communityID)[0];

  if (membership) {
    const requiredRole = config ? config[action] : undefined;

    if (!requiredRole) return false;

    return compareRoleLevel(membership.role, requiredRole);
  }

  return false;
};

export const checkCommunityStaticAccess = (user: UserState, communityID: string, requiredRole: string) => {
  if (!user) return false;

  const membership = user?.communityMemberships?.filter(m => m.communityID == communityID)[0];

  if (membership) return compareRoleLevel(membership.role, requiredRole);
  return false;
};

function compareRoleLevel(userRole: string, requiredRole: string): boolean {
  const roleHierarchy: { [key: string]: number } = {
    member: 0,
    moderator: 1,
    senior: 1,
    editor: 1,
    admin: 2,
    manager: 2,
    owner: 3,
  };

  return roleHierarchy[userRole.toLowerCase()] >= roleHierarchy[requiredRole.toLowerCase()];
}

export default checkOrgAccess;
