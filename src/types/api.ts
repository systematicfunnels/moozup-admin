export interface Event {
  id: number;
  eventName: string;
  eventDescription?: string;
  eventStartDate: string;
  eventEndDate: string;
  eventLocation?: string;
  latitude?: number;
  longitude?: number;
  logo?: string;
  banner?: string;
  venueMap?: string;
  startTime?: string;
  endTime?: string;
  moozupWebsite?: string;
  eventWebsite?: string;
  facebookId?: string;
  facebookPageUrl?: string;
  twitterId?: string;
  twitterPageUrl?: string;
  twitterHashtag?: string;
  linkedInPageUrl?: string;
  meraEventsId?: string;
  ticketWidget?: string;
  streamUrl?: string;
}

export interface DirectoryUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  companyName?: string;
  jobTitle?: string;
  profilePicture?: string;
  status: boolean;
  communityId?: number;
  community?: Community;
  facebookUrl?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  webProfile?: string;
  description?: string;
  note?: string;
  uid?: string;
  city?: string;
  state?: string;
  country?: string;
  participationTypeId?: number;
  participationType?: {
    id?: number;
    personParticipationType: string;
    groupParticipationName: string;
  };
}

export interface Community {
  id: number;
  name: string;
  description?: string;
  banner?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  about?: string;
  categories: string[];
  _count?: {
    members: number;
  };
}

export interface ParticipationType {
  id: number;
  personParticipationType: string;
  groupParticipationName: string;
  priority: number;
  isVisibleInApp: boolean;
  eventId: number;
}

export interface FeatureTabSetting {
  id: string;
  EventTabs: string;
  icon: string;
  filledIcon: string;
  text: string;
  isActive: boolean;
  order: number;
  eventId: number;
  userId: number;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems?: number;
  };
}

export interface DashboardStats {
  activeEvents: number;
  totalUsers: number;
  totalMessages: number;
  pendingReports: number;
  totalPosts: number;
  recentActivity: {
    id: string;
    type: 'user_registration' | 'event_creation';
    title: string;
    description: string;
    timestamp: string;
  }[];
}

export interface NewsPost {
  id: number;
  title?: string; // Backend 'getNews' doesn't seem to include title in transformed response? Let's check model again.
  description: string; // Mapped from content
  // content: string; // REMOVED: Backend sends description, not content
  attendeeId: number;
  eventId?: number;
  communityId?: number;
  createdAt: string;
  updatedAt: string;
  likeCount: number;
  likes?: number; 
  shares: number;
  likedByCurrentUser: boolean;
  images: string[]; // Transformed to strings
  attendee: {
    id: number;
    user: {
      firstName: string;
      lastName: string;
      profilePicture?: string;
    };
  };
  comments: Comment[];
}

export interface Comment {
  id: number;
  content: string;
  attendeeId: number;
  newsId: number;
  createdAt: string;
  attendee: {
    user: {
      firstName: string;
      lastName: string;
      profilePicture?: string;
    };
  };
}

export interface ApiError {
  message: string;
  success: boolean;
  errors?: Record<string, string[]>;
}

export interface Session {
  id: number;
  title: string;
  description?: string;
  date: string;
  startTime: string;
  endTime: string;
  location?: string;
  venue?: string;
  hall?: string;
  track?: string;
  keywords?: string;
  isSpeakathon?: boolean;
  enableFeedback?: boolean;
  sessionTypeId: number;
  sessionType?: SessionType;
  sponsorId?: number;
  sponsorTypeId?: number;
  eventId: number;
  isLive?: boolean;
  wentLiveAt?: string;
}

export interface SessionType {
  id: number;
  sessionname: string;
  color: string;
  isActive: boolean;
  eventId: number;
}

export interface Sponsor {
  id: number;
  name: string;
  logo?: string;
  website?: string;
  sponsorTypeId: number;
  sponsorType?: SponsorType;
  eventId: number;
}

export interface SponsorType {
  id: number;
  type: string;
  priority: number;
  isActive: boolean;
  eventId: number;
}

export interface Exhibitor {
  id: number;
  name: string;
  logo?: string;
  website?: string;
  aboutCompany?: string;
  location?: string;
  stall?: string;
  email?: string;
  phone?: string;
  facebookPageUrl?: string;
  linkedinPageUrl?: string;
  twitterPageUrl?: string;
  exhibitorTypeId: number;
  exhibitorType?: ExhibitorType;
  eventId: number;
}

export interface ExhibitorType {
  id: number;
  type: string;
  priority: number;
  isActive: boolean;
  eventId: number;
}

export interface PollOption {
  id: number;
  text: string;
  _count?: { responses: number };
}

export interface Poll {
  id: number;
  sessionId: number;
  question: string;
  options: PollOption[];
  status: 'active' | 'closed';
  createdAt: string;
}

export interface Question {
  id: number;
  sessionId: number;
  attendeeId: number;
  content: string;
  isAnswered: boolean;
  createdAt: string;
  attendee?: {
    user: {
      firstName: string;
      lastName: string;
    };
  };
}

export interface GalleryItem {
  id: number;
  url: string;
  type: 'image' | 'video';
  imageUrl?: string;
  videoUrl?: string;
  imagelabel?: string; // Added
  Videolabel?: string; // Added (Backend casing)
  eventId: number;
  caption?: string;
}

export interface SocialPost {
  id: number;
  description: string; // Mapped from content
  // content: string; // REMOVED
  attendeeId: number;
  eventId?: number;
  communityId?: number;
  createdAt: string;
  updatedAt: string;
  likeCount: number; // Mapped from _count
  likes?: number;
  shares: number;
  likedByCurrentUser?: boolean;
  images: string[]; // Transformed to strings
  attendee: {
    id: number;
    user: {
      firstName: string;
      lastName: string;
      profilePicture?: string;
    };
  };
  comments: SocialComment[];
}

export interface SocialComment {
  id: number;
  content: string;
  attendeeId: number;
  postId: number;
  createdAt: string;
  likes: number;
  attendee: {
    user: {
      firstName: string;
      lastName: string;
      profilePicture?: string;
    };
  };
}

export interface SocialImage {
  id: number;
  postId: number;
  url: string;
  order: number;
}

export interface Chat {
  id: number;
  eventId?: number;
  communityId?: number;
  name?: string;
  type: 'direct' | 'group' | 'session';
  createdAt: string;
  updatedAt: string;
  messages?: ChatMessage[];
  participants: ChatParticipant[];
}

export interface ChatMessage {
  id: number;
  chatId: number;
  attendeeId: number;
  content?: string;
  imageUrl?: string;
  messageType: 'text' | 'image';
  createdAt: string;
  readAt?: string;
  attendee?: {
    user: {
      firstName: string;
      lastName: string;
      profilePicture?: string;
    };
  };
}

export interface ChatParticipant {
  id: number;
  chatId: number;
  attendeeId: number;
  joinedAt: string;
  lastReadAt?: string;
  attendee: {
    id: number;
    user: {
      firstName: string;
      lastName: string;
      profilePicture?: string;
    };
  };
}
