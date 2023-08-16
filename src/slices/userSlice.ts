import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '@/store';
import { PostBookmark, ProjectBookmark, User } from '@/types';

export interface ChatSlice {
  userID: string;
  chatID: string;
}
interface UserState {
  id: string;
  name: string;
  username: string;
  email: string;
  phoneNo: string;
  following: string[];
  likedPosts: string[];
  likedProjects: string[];
  likedComments: string[];
  postBookmarks: PostBookmark[];
  projectBookmarks: ProjectBookmark[];
  contributingProjects: string[];
  chats: ChatSlice[];
  profilePic: string;
  isLoggedIn: boolean;
  isVerified: boolean;
}

const initialState: UserState = {
  id: '',
  name: '',
  username: '',
  email: '',
  phoneNo: '',
  isLoggedIn: false,
  profilePic: '',
  following: [],
  likedPosts: [],
  likedProjects: [],
  likedComments: [],
  postBookmarks: [],
  projectBookmarks: [],
  chats: [],
  contributingProjects: [],
  isVerified: false,
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.id = action.payload.id;
      state.name = action.payload.name;
      state.username = action.payload.username;
      state.email = action.payload.email;
      state.profilePic = action.payload.profilePic;
      state.isLoggedIn = true;
      state.phoneNo = action.payload.phoneNo;
      state.isVerified = action.payload.isVerified;
      state.chats = [];
      state.contributingProjects = [];
      state.following = [];
      state.likedComments = [];
      state.likedPosts = [];
      state.likedProjects = [];
      state.postBookmarks = [];
      state.projectBookmarks = [];
    },
    setProfilePic: (state, action: PayloadAction<string>) => {
      state.profilePic = action.payload;
    },
    setFollowing: (state, action: PayloadAction<string[]>) => {
      state.following = action.payload;
    },
    setLikedPosts: (state, action: PayloadAction<string[]>) => {
      state.likedPosts = action.payload;
    },
    setLikedProjects: (state, action: PayloadAction<string[]>) => {
      state.likedProjects = action.payload;
    },
    setLikedComments: (state, action: PayloadAction<string[]>) => {
      state.likedComments = action.payload;
    },
    setPostBookmarks: (state, action: PayloadAction<PostBookmark[]>) => {
      state.postBookmarks = action.payload;
    },
    setProjectBookmarks: (state, action: PayloadAction<ProjectBookmark[]>) => {
      state.projectBookmarks = action.payload;
    },
    setChats: (state, action: PayloadAction<ChatSlice[]>) => {
      state.chats = action.payload;
    },
    setContributingProjects: (state, action: PayloadAction<string[]>) => {
      state.contributingProjects = action.payload;
    },
    setEmail: (state, action: PayloadAction<string>) => {
      state.email = action.payload;
    },
    setPhoneNumber: (state, action: PayloadAction<string>) => {
      state.phoneNo = action.payload;
    },
    setVerificationStatus: (state, action: PayloadAction<boolean>) => {
      state.isVerified = action.payload;
    },
  },
});

export const {
  setUser,
  setProfilePic,
  setFollowing,
  setLikedPosts,
  setLikedProjects,
  setLikedComments,
  setPostBookmarks,
  setProjectBookmarks,
  setChats,
  setContributingProjects,
  setEmail,
  setPhoneNumber,
  setVerificationStatus,
} = userSlice.actions;

export default userSlice.reducer;

export const userSelector = (state: RootState) => state.user;

export const userIDSelector = (state: RootState) => state.user.id;

export const profilePicSelector = (state: RootState) => state.user.profilePic;