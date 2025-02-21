export const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
export const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL;
export const FRONTEND_URL = process.env.NEXT_PUBLIC_FRONTEND_URL;
export const GC_API = 'https://storage.googleapis.com'
export const BUCKET = process.env.NEXT_PUBLIC_GCP_BUCKET;

export const LOGIN_URL = `/login`
export const SIGNUP_URL = `/signup`

export const USER_URL = `/users`;
export const POST_URL = `/posts`;
export const PROJECT_URL = `/projects`;
export const FEED_URL = `/feed`;
export const APPLICATION_URL = `/applications`;
export const BOOKMARK_URL = `/bookmarks`;
export const COMMENT_URL = `/comments`;
export const EXPLORE_URL = `/explore`;
export const INVITATION_URL = `/invitations`;
export const MESSAGING_URL = `/messaging`;
export const NOTIFICATION_URL = `/notifications`;
export const OPENING_URL = `/openings`;
export const WORKSPACE_URL = `/workspace`;
export const MEMBERSHIP_URL = `/membership`;
export const SHARE_URL = `/share`;
export const CONNECTION_URL = `/connection`;
export const TASK_URL = `/tasks`;
export const EVENT_URL = `/events`;
export const ORG_URL = `/org`;
export const COMMUNITY_URL = `/community`;

export const USER_PROFILE_PIC_URL = `${GC_API}/${BUCKET}/users/profilePics`;
export const USER_COVER_PIC_URL = `${GC_API}/${BUCKET}/users/coverPics`;
export const PROJECT_PIC_URL = `${GC_API}/${BUCKET}/projects`;
export const EVENT_PIC_URL = `${GC_API}/${BUCKET}/events`;
export const POST_PIC_URL = `${GC_API}/${BUCKET}/posts`;
export const GROUP_CHAT_PIC_URL = `${GC_API}/${BUCKET}/chats`;
export const APPLICATION_RESUME_URL = `${GC_API}/${BUCKET}/users/resumes`;
export const RESOURCE_URL = `${GC_API}/${BUCKET}/resources`;
export const COMMUNITY_PROFILE_PIC_URL = `${GC_API}/${BUCKET}/communities/profilePics`;
export const COMMUNITY_COVER_PIC_URL = `${GC_API}/${BUCKET}/communities/coverPics`;

export const LANDING_RESOURCE_URL = `${GC_API}/${BUCKET}/landing`;