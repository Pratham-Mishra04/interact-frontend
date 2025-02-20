import { RootState } from '@/store';
import { Organization, OrganizationMembership, Team } from '@/types';
import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

interface OrgSlice {
  id: string;
  userID: string;
  title: string;
  coverPic: string;
  teams: Team[];
}

interface OrganizationMembershipSlice {
  id: string;
  organizationID: string;
  userID: string;
  role: string;
  title: string;
}

export interface OrgState {
  currentOrg: OrgSlice;
  currentOrgMembership: OrganizationMembershipSlice;
}

const initialState: OrgState = {
  currentOrg: {
    id: '',
    userID: '',
    title: '',
    coverPic: 'default.jpg',
    teams: [],
  },
  currentOrgMembership: {
    id: '',
    organizationID: '',
    userID: '',
    role: '',
    title: '',
  },
};

export const orgSlice = createSlice({
  name: 'organization',
  initialState,
  reducers: {
    setCurrentOrg: (state, action: PayloadAction<Organization>) => {
      state.currentOrg.id = action.payload.id;
      state.currentOrg.userID = action.payload.userID;
      state.currentOrg.title = action.payload.title;
      state.currentOrg.coverPic = action.payload.user?.profilePic;
      state.currentOrg.teams = action.payload.teams || [];
    },
    setCurrentOrgRole: (state, action: PayloadAction<string>) => {
      state.currentOrgMembership.role = action.payload;
    },
    setCurrentOrgTeams: (state, action: PayloadAction<Team[]>) => {
      state.currentOrg.teams = action.payload;
    },
    setCurrentOrgMembership: (state, action: PayloadAction<OrganizationMembership>) => {
      state.currentOrgMembership.id = action.payload.id;
      state.currentOrgMembership.organizationID = action.payload.organizationID;
      state.currentOrgMembership.role = action.payload.role;
      state.currentOrgMembership.title = action.payload.title;
      state.currentOrgMembership.userID = action.payload.userID;
    },
    resetCurrentOrg: state => {
      state.currentOrg = {
        id: '',
        userID: '',
        title: '',
        coverPic: '',
        teams: [],
      };
      state.currentOrgMembership = {
        id: '',
        organizationID: '',
        userID: '',
        role: '',
        title: '',
      };
    },
  },
});

export const { setCurrentOrg, setCurrentOrgRole, setCurrentOrgTeams, setCurrentOrgMembership, resetCurrentOrg } =
  orgSlice.actions;

export default orgSlice.reducer;

export const orgSelector = (state: RootState) => state.organization;
export const currentOrgIDSelector = (state: RootState) => state.organization.currentOrg.id;
export const currentOrgSelector = (state: RootState) => state.organization.currentOrg;
export const currentOrgMembershipSelector = (state: RootState) => state.organization.currentOrgMembership;
export const currentOrgRoleSelector = (state: RootState) => state.organization.currentOrgMembership.role;
