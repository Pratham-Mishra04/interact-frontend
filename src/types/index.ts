export interface TypingStatus {
  user: User;
  chatID: string;
}

export interface Education {
  university: string;
  degree: string;
  description: string;
}

export interface GenericBookmark {
  id: string;
  userID: string;
  title: string;
  createdAt: Date;
}

export interface PostBookmark {
  id: string;
  userID: string;
  title: string;
  createdAt: Date;
  postItems: PostBookmarkItem[];
}

export interface PostBookmarkItem {
  id: string;
  postBookmarkID: string;
  postID: string;
  post: Post;
}

export interface ProjectBookmark {
  id: string;
  userID: string;
  title: string;
  createdAt: Date;
  projectItems: ProjectBookmarkItem[];
}

export interface ProjectBookmarkItem {
  id: string;
  projectBookmarkID: string;
  projectID: string;
  project: Project;
}

export interface OpeningBookmark {
  id: string;
  userID: string;
  title: string;
  createdAt: Date;
  openingItems: OpeningBookmarkItem[];
}

export interface OpeningBookmarkItem {
  id: string;
  openingBookmarkID: string;
  openingID: string;
  opening: Opening;
}

export interface EventBookmark {
  id: string;
  userID: string;
  title: string;
  createdAt: Date;
  eventItems: EventBookmarkItem[];
}

export interface EventBookmarkItem {
  id: string;
  eventBookmarkID: string;
  eventID: string;
  event: Event;
}

export interface Achievement {
  id: string;
  title: string;
  skills: string[];
}

export interface Membership {
  id: string;
  projectID: string;
  project: Project;
  userID: string;
  user: User;
  teams: Team[];
  role: string;
  title: string;
  active: boolean;
  createdAt: Date;
}

export interface Opening {
  id: string;
  projectID: string;
  project: Project | null;
  organizationID: string;
  organization: Organization | null;
  userID: string;
  user: User;
  title: string;
  description: string;
  applications: [];
  noApplications: number;
  noImpressions: number;
  tags: string[];
  active: boolean;
  createdAt: Date;
}

export interface Profile {
  id: string;
  userID: string;
  achievements: Achievement[];
  school: string;
  degree: string;
  yearOfGraduation: number;
  description: string;
  areasOfCollaboration: string[];
  hobbies: string[];
  location: string;
  phoneNo: string;
  email: string;
}

export interface User {
  id: string;
  tags: string[];
  links: string[];
  email: string;
  name: string;
  resume: string;
  active: boolean;
  profilePic: string;
  profilePicBlurHash: string;
  coverPic: string;
  coverPicBlurHash: string;
  username: string;
  phoneNo: string;
  bio: string;
  title: string;
  tagline: string;
  profile: Profile;
  followers: User[];
  following: User[];
  memberships: Membership[];
  posts: Post[];
  projects: Project[];
  noFollowers: number;
  noFollowing: number;
  noImpressions: number;
  noProjects: number;
  noCollaborativeProjects: number;
  isFollowing?: boolean;
  isOnboardingComplete: boolean;
  passwordChangedAt: Date;
  lastViewed: Project[];
  isVerified: boolean;
  githubUsername: string;
  isOrganization: boolean;
  organization: Organization | null;
  createdAt: string;
}

export interface OrganizationMembership {
  id: string;
  organizationID: string;
  organization: Organization;
  userID: string;
  user: User;
  teams: Team[];
  role: string;
  title: string;
  createdAt: Date;
}

export interface Organization {
  id: string;
  userID: string;
  user: User;
  title: string;
  memberships: OrganizationMembership[];
  invitations: Invitation[];
  teams: Team[];
  noMembers: number;
  noEvents: number;
  noProjects: number;
  createdAt: Date;
}

export interface Project {
  id: string;
  slug: string;
  userID: string;
  title: string;
  tagline: string;
  coverPic: string;
  blurHash: string;
  description: string;
  page: string;
  user: User;
  likedBy: User[];
  comments: Comment[];
  noLikes: number;
  noShares: number;
  noComments: number;
  noImpressions: number;
  tags: string[];
  category: string;
  memberships: Membership[];
  invitations: Invitation[];
  openings: Opening[];
  chats: Chat[];
  hashes: string[];
  isPrivate: boolean;
  views: number;
  totalNoViews: number;
  noMembers: number;
  privateLinks: string[];
  links: string[];
  organizationID: string;
  organization: Organization | null;
  createdAt: Date;
}

export interface PostTag {
  id: string;
  userID: string;
  user: User;
  postID: string;
}
export interface Post {
  id: string;
  userID: string;
  rePostID: string;
  rePost: Post | null;
  images: string[];
  content: string;
  user: User;
  noLikes: number;
  noShares: number;
  noComments: number;
  noImpressions: number;
  noReposts: number;
  isRePost: boolean;
  postedAt: Date;
  tags: string[];
  hashes: string[];
  isEdited: boolean;
  taggedUsers: User[];
}

export interface Comment {
  id: string;
  userID: string;
  user: User;
  postID: string;
  post: Post;
  projectID: string;
  project: Project;
  eventID: string;
  event: Event | null;
  applicationID: string;
  application: Application | null;
  announcementID: string;
  announcement: Announcement | null;
  taskID: string;
  task: Task | null;
  parentCommentID: string;
  isRepliedComment: boolean;
  level: number;
  content: string;
  noLikes: number;
  noReplies: number;
  likedBy: string[];
  taggedUsers: User[];
  createdAt: Date;
}

export interface Application {
  id: string;
  openingID: string;
  opening: Opening;
  projectID: string;
  project: Project | null;
  organizationID: string;
  organization: Organization | null;
  userID: string;
  user: User;
  email: string;
  status: number;
  content: string;
  resume: string;
  links: string[];
  score: number;
  createdAt: Date;
  noComments: number;
}

export interface Notification {
  id: string;
  notificationType: number;
  projectID: string;
  project: Project;
  postID: string;
  post: Post;
  userID: string;
  user: User;
  senderID: string;
  sender: User;
  openingID: string;
  opening: Opening;
  applicationID: string;
  application: Application;
  eventID: string;
  event: Event;
  announcementID: string;
  announcement: Announcement;
  commentID: string;
  comment: Comment;
  taskID: string;
  task: Task;
  impressionCount: number;
  isRead: boolean;
  createdAt: Date;
}

export interface Message {
  id: string;
  content: string;
  chatID: string;
  chat: Chat | null;
  userID: string;
  user: User;
  postID: string;
  post: Post;
  projectID: string;
  project: Project;
  openingID: string;
  opening: Opening;
  profileID: string;
  profile: User;
  announcementID: string;
  announcement: Announcement;
  eventID: string;
  event: Event | null;
  messageID: string;
  message: Message | null;
  readBy: MessageReadStatus[];
  createdAt: Date;
}

export interface MessageReadStatus {
  messageID: string;
  userID: string;
  user: User | null;
  readAt: Date;
}

export interface Chat {
  id: string;
  title: string;
  description: string;
  isGroup: boolean;
  isAdminOnly: boolean;
  isAccepted: boolean;
  userID: string;
  user: User;
  coverPic: string;
  organizationID: string;
  organization: Organization | null;
  projectID: string;
  project: Project | null;
  createdAt: Date;
  messages: Message[];
  latestMessageID: string;
  latestMessage: Message;
  noMembers: number;
  memberships: ChatMembership[];
  invitations: Invitation[];
}

export interface ChatMembership {
  id: string;
  userID: string;
  user: User;
  chatID: string;
  isAdmin: boolean;
  lastReadMessageID: string;
  lastReadMessage: Message;
  isBlocked: boolean;
  createdAt: Date;
}

export interface Invitation {
  id: string;
  userID: string;
  user: User;
  senderID: string;
  sender: User;
  projectID: string;
  project: Project;
  organizationID: string;
  organization: Organization;
  chatID: string;
  chat: Chat;
  eventID: string;
  event: Event | null;
  title: string;
  status: number;
  isRead: boolean;
  createdAt: Date;
}

export interface SubTask {
  id: string;
  taskID: string;
  deadline: Date;
  title: string;
  description: string;
  tags: string[];
  users: User[];
  isCompleted: boolean;
  priority: PRIORITY;
  difficulty: DIFFICULTY;
}

export type PRIORITY = 'low' | 'medium' | 'high';
export type DIFFICULTY = 'basic' | 'proficient' | 'expert';

export interface Task {
  id: string;
  userID: string;
  user: User;
  projectID: string;
  project: Project | undefined;
  organizationID: string;
  organization: Organization | undefined;
  deadline: Date;
  title: string;
  description: string;
  tags: string[];
  users: User[];
  isCompleted: boolean;
  subTasks: SubTask[];
  priority: PRIORITY;
  noComments: number;
  difficulty: DIFFICULTY;
  histories: TaskHistory[];
  prID: '';
  prLink: '';
  prStatus: number;
}

export interface TaskHistory {
  id: string;
  historyType: number;
  taskID: string;
  task: Task;
  userID: string;
  user: User;
  assigneeID?: string;
  assignee: User;
  subTaskID?: string;
  subTask: SubTask;
  commentID?: string;
  comment: Comment;
  deletedText: string;
  createdAt: Date;
}

export interface ResourceBucket {
  id: string;
  title: string;
  description: string;
  organizationID: string;
  noFiles: number;
  viewAccess: string;
  editAccess: string;
  resourceFiles: ResourceFile[];
  createdAt: Date;
}
export interface ResourceFile {
  id: string;
  title: string;
  description: string;
  createdAt: Date;
  resourceBucketID: string;
  userID: string;
  user: User;
  path: string;
  type: string;
  isFileUploaded: boolean;
}
export interface ProjectHistory {
  id: string;
  projectID: string;
  senderID: string;
  sender: User;
  historyType: number;
  userID: string;
  user: User;
  openingID: string;
  opening: Opening;
  applicationID: string;
  application: Application;
  invitationID: string;
  invitation: Invitation;
  taskID: string;
  task: Task;
  membershipID: string;
  membership: Membership;
  deletedText: string;
  createdAt: Date;
}

export interface Event {
  id: string;
  organizationID: string;
  organization: Organization;
  coHosts: Organization[];
  title: string;
  tagline: string;
  description: string;
  tags: string[];
  links: string[];
  coordinators: User[];
  startTime: Date;
  endTime: Date;
  location: string;
  category: string;
  coverPic: string;
  blurHash: string;
  noLikes: number;
  noShares: number;
  noComments: number;
  noImpressions: number;
  noViews: number;
  meetingID: string;
  meeting: Meeting | null;
  hackathonID: string;
  hackathon: Hackathon | null;
  createdAt: Date;
  userID: string; //Dummy for type fixes in comment_box
}

export interface EventHistory {
  id: string;
  eventID: string;
  userID: string;
  user: User;
  title: boolean;
  tagline: boolean;
  description: boolean;
  tags: boolean;
  links: boolean;
  startTime: boolean;
  endTime: boolean;
  location: boolean;
  category: boolean;
  coverPic: boolean;
  createdAt: Date;
}

export interface OrganizationHistory {
  id: string;
  organizationID: string;
  historyType: number;
  userID: string;
  user: User;
  postID?: string;
  post?: Post;
  eventID?: string;
  event?: Event;
  projectID?: string;
  project?: Project;
  taskID?: string;
  task?: Task;
  invitationID?: string;
  invitation?: Invitation;
  pollID?: string;
  poll?: Poll;
  announcementID?: string;
  announcement?: Announcement;
  openingID?: string;
  opening?: Opening;
  applicationID?: string;
  application?: Application;
  membershipID?: string;
  membership?: OrganizationMembership;
  meetingID?: string;
  meeting?: Meeting;
  resourceBucketID: string;
  resourceBucket?: ResourceBucket;
  teamID?: string;
  team?: Team;
  createdAt: Date;
  deletedText: String;
}

export interface College {
  name: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  fuzzy: string;
}

export interface Review {
  id: string;
  userID: string;
  user: User;
  organizationID: string;
  content: string;
  rating: number;
  noUpVotes: number;
  noDownVotes: number;
  isAnonymous: boolean;
  createdAt: Date;
}

export interface ReviewCounts {
  1: number;
  2: number;
  3: number;
  4: number;
  5: number;
}

export interface ReviewData {
  total: number;
  average: number;
  counts: ReviewCounts;
}

export interface Option {
  id: string;
  pollID: string;
  content: string;
  noVotes: number;
  votedBy: User[];
}

export interface Poll {
  id: string;
  organizationID: string;
  organization: Organization | null;
  title: string;
  content: string;
  options: Option[];
  isMultiAnswer: boolean;
  isOpen: boolean;
  totalVotes: number;
  createdAt: Date;
}

export interface Announcement {
  id: string;
  organizationID: string;
  organization: Organization | null;
  title: string;
  content: string;
  noLikes: number;
  noShares: number;
  noComments: number;
  createdAt: Date;
  isEdited: boolean;
  isOpen: boolean;
  taggedUsers: User[];
  userID: string; //Dummy for type fixes in comment_box
}

export interface Meeting {
  id: string;
  dyteID: string;
  eventID: string;
  title: string;
  description: string;
  tags: string[];
  startTime: Date;
  endTime: Date;
  frequency: string;
  day: string;
  date: number;
  isOnline: boolean;
  isOpenForMembers: boolean;
  isLive: boolean;
  allowExternalParticipants: boolean;
  organizationID: string;
  organization: Organization;
  userID: string;
  user: User;
  participants: User[];
  rsvp: User[];
  createdAt: Date;
  nextSessionTime: Date;
  sessions: Session[];
}

export interface Session {
  id: string;
  meetingID: string;
  isLive: boolean;
  startedAt: Date;
  endedAt: Date;
  createdAt: Date;
  chatDownloadURL: string;
  chatDownloadURLExpiry: string;
  transcriptDownloadURL: string;
  transcriptDownloadURLExpiry: string;
}

export interface Team {
  id: string;
  title: string;
  description: string;
  color: string;
  memberships: Membership[];
  noUsers: number;
  tags: string[];
  createdAt: Date;
}

export interface Recording {
  id: string;
  download_url?: string | null;
  download_url_expiry?: Date | null;
  audio_download_url?: string | null;
  file_size?: number | null;
  session_id: string;
  output_file_name: string;
  status: string;
  invoked_time: Date;
  started_time: Date;
  stopped_time: Date;
  recording_duration: number;
}

export interface Hackathon {
  id: string;
  organizationID: string;
  organization: Organization;
  title: string;
  tagline?: string;
  coverPic: string;
  blurHash: string;
  description: string;
  tags?: string[];
  links?: string[];
  startTime: Date;
  endTime: Date;
  location: string;
  minTeamSize: number;
  maxTeamSize: number;
  createdAt: Date;
  noParticipants: number;
  participants: User[];
  coordinators: User[];
  judges: User[];
  isEnded?: boolean;
  eventID: string;
  history: HackathonHistory[];
}

export interface HackathonTrack {
  id: string;
  hackathonID: string;
  title: string;
  description?: string;
  prizes: HackathonPrize[];
}

export interface HackathonPrize {
  id: string;
  hackathonID: string;
  title: string;
  trackID?: string;
  track?: HackathonTrack;
  description?: string;
  amount: number;
}

export interface HackathonSponsor {
  id: string;
  hackathonID: string;
  name: string;
  coverPic: string;
  blurHash: string;
  link?: string;
  title?: string;
  description?: string;
}

export interface HackathonFAQ {
  id: string;
  hackathonID: string;
  question: string;
  answer: string;
}

export interface HackathonTeam {
  id: string;
  hackathonID: string;
  title: string;
  token: string;
  idea?: string;
  userID: string;
  user: User;
  projectID?: string;
  project?: Project;
  members: User[];
  isEliminated: boolean;
  noComments: number;
  createdAt: Date;
  comments: Comment[];
}

export interface HackathonRound {
  id: string;
  hackathonID: string;
  title: string;
  index: number;
  isIdeation: boolean;
  startTime: Date;
  endTime: Date;
  judgingStartTime: Date;
  judgingEndTime: Date;
  metrics: HackathonRoundScoreMetric[];
}

export interface HackathonRoundScoreMetric {
  hackathonRoundID: string;
  title: string;
  description?: string;
  type: string;
  options?: string[];
}

export interface HackathonRoundTeamScoreCard {
  id: string;
  hackathonRoundID: string;
  hackathonTeamID: string;
  scores: HackathonRoundTeamScore[];
  overallScore: number;
}

export interface HackathonRoundTeamScore {
  id: string;
  hackathonRoundTeamScoreCardID: string;
  hackathonRoundScoreMetricID: string;
  score: string;
}

export interface HackathonHistory {
  id: string;
  hackathonID: string;
  historyType: number;
  senderID: string;
  sender: User;
  userID?: string;
  user?: User;
  deletedText?: string;
  createdAt: Date;
}
