import { RootState } from '@/store';
import { PayloadAction, createSlice } from '@reduxjs/toolkit';

interface ConfigState {
  updatingFollowing: boolean;
  updatingLikes: boolean;
  updatingOptions: boolean;
  updateBookmark: boolean;
  lastFetchedFollowing: string;
  lastFetchedLikes: string;
  lastFetchedPostBookmarks: string;
  lastFetchedProjectBookmarks: string;
  lastFetchedOpeningBookmarks: string;
  lastFetchedEventBookmarks: string;
  lastFetchedChats: string;
  lastFetchedProjects: string;
  lastFetchedContributingProjects: string;
  lastFetchedApplications: string;
  lastFetchedUnreadNotifications: string;
  lastFetchedUnreadInvitations: string;
  lastFetchedUnreadChats: string;
  lastFetchedOrganizationMemberships: string;
  lastFetchedCommunityMemberships: string;
  lastFetchedVotedOptions: string;
  lastFetchedRegisteredEvents: string;
  lastFetchedCredits: string;
}

const getInitialDate = (): string => {
  const date = new Date();
  date.setMinutes(date.getMinutes() - 31); //+1 minutes
  return date.toUTCString();
};
const getInitialNotificationDate = (): string => {
  const date = new Date();
  date.setSeconds(date.getSeconds() - 31);
  return date.toUTCString();
};

const getInitialInvitationDate = (): string => {
  const date = new Date();
  date.setMinutes(date.getMinutes() - 3);
  return date.toUTCString();
};

const initialState: ConfigState = {
  updatingFollowing: false,
  updatingLikes: false,
  updatingOptions: false,
  updateBookmark: false,
  lastFetchedFollowing: getInitialDate(),
  lastFetchedLikes: getInitialDate(),
  lastFetchedPostBookmarks: getInitialDate(),
  lastFetchedProjectBookmarks: getInitialDate(),
  lastFetchedOpeningBookmarks: getInitialDate(),
  lastFetchedEventBookmarks: getInitialDate(),
  lastFetchedChats: getInitialDate(),
  lastFetchedProjects: getInitialDate(),
  lastFetchedContributingProjects: getInitialDate(),
  lastFetchedApplications: getInitialDate(),
  lastFetchedUnreadNotifications: getInitialNotificationDate(),
  lastFetchedUnreadInvitations: getInitialInvitationDate(),
  lastFetchedUnreadChats: getInitialInvitationDate(),
  lastFetchedOrganizationMemberships: getInitialDate(),
  lastFetchedCommunityMemberships: getInitialDate(),
  lastFetchedVotedOptions: getInitialDate(),
  lastFetchedRegisteredEvents: getInitialDate(),
  lastFetchedCredits: getInitialInvitationDate(),
};

export const configSlice = createSlice({
  name: 'config',
  initialState,
  reducers: {
    resetConfig: state => {
      state.updatingFollowing = false;
      state.updatingLikes = false;
      state.updatingOptions = false;
      state.updateBookmark = false;
      state.lastFetchedFollowing = getInitialDate();
      state.lastFetchedLikes = getInitialDate();
      state.lastFetchedPostBookmarks = getInitialDate();
      state.lastFetchedProjectBookmarks = getInitialDate();
      state.lastFetchedOpeningBookmarks = getInitialDate();
      state.lastFetchedEventBookmarks = getInitialDate();
      state.lastFetchedChats = getInitialDate();
      state.lastFetchedProjects = getInitialDate();
      state.lastFetchedContributingProjects = getInitialDate();
      state.lastFetchedApplications = getInitialDate();
      state.lastFetchedUnreadNotifications = getInitialNotificationDate();
      state.lastFetchedUnreadInvitations = getInitialInvitationDate();
      state.lastFetchedUnreadChats = getInitialInvitationDate();
      state.lastFetchedOrganizationMemberships = getInitialDate();
      state.lastFetchedCommunityMemberships = getInitialDate();
      state.lastFetchedVotedOptions = getInitialDate();
      state.lastFetchedRegisteredEvents = getInitialDate();
      state.lastFetchedCredits = getInitialInvitationDate();
    },
    setUpdatingFollowing: (state, action: PayloadAction<boolean>) => {
      state.updatingFollowing = action.payload;
    },
    setUpdatingLikes: (state, action: PayloadAction<boolean>) => {
      state.updatingLikes = action.payload;
    },
    setUpdatingOptions: (state, action: PayloadAction<boolean>) => {
      state.updatingOptions = action.payload;
    },
    setUpdateBookmark: (state, action: PayloadAction<boolean>) => {
      state.updateBookmark = action.payload;
    },
    setConfig: state => {
      state.lastFetchedFollowing = new Date().toUTCString();
      state.lastFetchedLikes = new Date().toUTCString();
      state.lastFetchedPostBookmarks = new Date().toUTCString();
      state.lastFetchedProjectBookmarks = new Date().toUTCString();
      state.lastFetchedOpeningBookmarks = new Date().toUTCString();
      state.lastFetchedEventBookmarks = new Date().toUTCString();
      state.lastFetchedChats = new Date().toUTCString();
      state.lastFetchedProjects = new Date().toUTCString();
      state.lastFetchedContributingProjects = new Date().toUTCString();
      state.lastFetchedUnreadNotifications = new Date().toUTCString();
      state.lastFetchedUnreadInvitations = new Date().toUTCString();
      state.lastFetchedOrganizationMemberships = new Date().toUTCString();
      state.lastFetchedCommunityMemberships = new Date().toUTCString();
      state.lastFetchedVotedOptions = new Date().toUTCString();
      state.lastFetchedRegisteredEvents = new Date().toUTCString();
      state.lastFetchedCredits = new Date().toUTCString();
    },
    setFetchedFollowing: (state, action: PayloadAction<string>) => {
      state.lastFetchedFollowing = action.payload;
    },
    setFetchedLikes: (state, action: PayloadAction<string>) => {
      state.lastFetchedLikes = action.payload;
    },
    setFetchedPostBookmarks: (state, action: PayloadAction<string>) => {
      state.lastFetchedPostBookmarks = action.payload;
    },
    setFetchedProjectBookmarks: (state, action: PayloadAction<string>) => {
      state.lastFetchedProjectBookmarks = action.payload;
    },
    setFetchedOpeningBookmarks: (state, action: PayloadAction<string>) => {
      state.lastFetchedOpeningBookmarks = action.payload;
    },
    setFetchedEventBookmarks: (state, action: PayloadAction<string>) => {
      state.lastFetchedEventBookmarks = action.payload;
    },
    setFetchedChats: (state, action: PayloadAction<string>) => {
      state.lastFetchedChats = action.payload;
    },
    setFetchedProjects: (state, action: PayloadAction<string>) => {
      state.lastFetchedProjects = action.payload;
    },
    setFetchedContributingProjects: (state, action: PayloadAction<string>) => {
      state.lastFetchedContributingProjects = action.payload;
    },
    setFetchedApplications: (state, action: PayloadAction<string>) => {
      state.lastFetchedApplications = action.payload;
    },
    setLastFetchedUnreadNotifications: (state, action: PayloadAction<string>) => {
      state.lastFetchedUnreadNotifications = action.payload;
    },
    setLastFetchedUnreadInvitations: (state, action: PayloadAction<string>) => {
      state.lastFetchedUnreadInvitations = action.payload;
    },
    setLastFetchedUnreadChats: (state, action: PayloadAction<string>) => {
      state.lastFetchedUnreadChats = action.payload;
    },
    setLastFetchedOrganizationMemberships: (state, action: PayloadAction<string>) => {
      state.lastFetchedOrganizationMemberships = action.payload;
    },
    setLastFetchedCommunityMemberships: (state, action: PayloadAction<string>) => {
      state.lastFetchedCommunityMemberships = action.payload;
    },
    setLastFetchedVotedOptions: (state, action: PayloadAction<string>) => {
      state.lastFetchedVotedOptions = action.payload;
    },
    setLastFetchedRegisteredEvents: (state, action: PayloadAction<string>) => {
      state.lastFetchedRegisteredEvents = action.payload;
    },
    setLastFetchedCredits: (state, action: PayloadAction<string>) => {
      state.lastFetchedCredits = action.payload;
    },
  },
});

export const {
  resetConfig,
  setUpdatingFollowing,
  setUpdatingLikes,
  setUpdatingOptions,
  setUpdateBookmark,
  setConfig,
  setFetchedChats,
  setFetchedFollowing,
  setFetchedLikes,
  setFetchedPostBookmarks,
  setFetchedProjectBookmarks,
  setFetchedOpeningBookmarks,
  setFetchedEventBookmarks,
  setFetchedProjects,
  setFetchedContributingProjects,
  setFetchedApplications,
  setLastFetchedUnreadNotifications,
  setLastFetchedUnreadInvitations,
  setLastFetchedUnreadChats,
  setLastFetchedOrganizationMemberships,
  setLastFetchedCommunityMemberships,
  setLastFetchedVotedOptions,
  setLastFetchedRegisteredEvents,
  setLastFetchedCredits,
} = configSlice.actions;

export default configSlice.reducer;

export const configSelector = (state: RootState) => state.config;
