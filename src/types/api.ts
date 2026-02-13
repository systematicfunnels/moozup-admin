export interface Event {
  id: number;
  eventName: string;
  eventDescription: string;
  eventStartDate: string;
  eventEndDate: string;
  eventLocation: string;
  logo?: string;
  banner?: string;
  startTime: string;
  endTime: string;
  moozupWebsite: string;
  eventWebsite: string;
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
  participationType?: {
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

export interface ApiResponse<T> {
  message?: string;
  data: T;
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
