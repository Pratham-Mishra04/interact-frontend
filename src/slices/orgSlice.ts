import { RootState } from '@/store';
import { Organization, OrganizationMembership } from '@/types';
import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

interface OrgSlice {
  id: string;
  userID: string;
  title: string;
  coverPic: string;
}

interface OrganizationMembershipSlice {
  id: string;
  organizationID: string;
  userID: string;
  role: string;
  title: string;
}

interface OrgState {
  currentOrg: OrgSlice;
  currentOrgMembership: OrganizationMembershipSlice;
}

const initialState: OrgState = {
  currentOrg: {
    id: '',
    userID: '',
    title: '',
    coverPic: 'default.jpg',
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

export const { setCurrentOrg, setCurrentOrgMembership, resetCurrentOrg } = orgSlice.actions;

export default orgSlice.reducer;

export const currentOrgIDSelector = (state: RootState) => state.organization.currentOrg.id;
export const currentOrgSelector = (state: RootState) => state.organization.currentOrg;
export const currentOrgMembershipSelector = (state: RootState) => state.organization.currentOrgMembership;
