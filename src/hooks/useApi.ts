import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api';
import type { 
  Event, 
  DirectoryUser, 
  ApiResponse, 
  DashboardStats, 
  NewsPost,
  SocialPost,
  Session,
  SessionType,
  Sponsor,
  SponsorType,
  Exhibitor,
  ExhibitorType,
  Poll,
  Question,
  GalleryItem,
  Community,
  ParticipationType,
  FeatureTabSetting
} from '../types/api';

// --- Dashboard Hooks ---

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<DashboardStats>>('/dashboard/stats');
      return response.data.data;
    },
  });
};

// --- Events Hooks ---

export const useEvents = () => {
  return useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<Event[]>>('/events/getEvent');
      return response.data.data || [];
    },
  });
};

export const useEventDetails = (id: string | number) => {
  return useQuery({
    queryKey: ['events', id],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<Event>>(`/events/event/details/${id}`);
      return response.data.data;
    },
    enabled: !!id,
  });
};

export const useCreateEvent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ data, onProgress }: { data: FormData; onProgress?: (percent: number) => void }) => {
      const response = await apiClient.post<ApiResponse<{ event: Event }>>('/events/createEvent', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
          onProgress?.(percent);
        },
      });
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
};

export const useUpdateEvent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data, onProgress }: { id: number; data: FormData; onProgress?: (percent: number) => void }) => {
      const response = await apiClient.put<ApiResponse<{ event: Event }>>(`/events/updateEvent/${id}`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
          onProgress?.(percent);
        },
      });
      return response.data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      if (data?.event?.id) {
        queryClient.invalidateQueries({ queryKey: ['events', data.event.id] });
      }
    },
  });
};

export const useDeleteEvent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await apiClient.delete(`/events/deleteEvent/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
};

// --- Agenda Hooks ---

export const useSessions = (eventId: number | string | undefined) => {
  return useQuery({
    queryKey: ['sessions', eventId],
    queryFn: async () => {
      if (!eventId) return [];
      const response = await apiClient.get<ApiResponse<Session[]>>(`/agenda/getAllSessions/${eventId}`);
      // Handle potential raw array response
      if (Array.isArray(response.data)) return response.data;
      return response.data.data || [];
    },
    enabled: !!eventId,
  });
};

export const useSessionTypes = (eventId: number | string | undefined) => {
  return useQuery({
    queryKey: ['session-types', eventId],
    queryFn: async () => {
      if (!eventId) return [];
      const response = await apiClient.get<ApiResponse<SessionType[]>>(`/agenda/getAllSessionTypes?eventId=${eventId}`);
      if (Array.isArray(response.data)) return response.data;
      return response.data.data || [];
    },
    enabled: !!eventId,
  });
};

export const useCreateSession = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Partial<Session>) => {
      const response = await apiClient.post<ApiResponse<Session>>('/agenda/createSession', data);
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      if (variables.eventId) {
        queryClient.invalidateQueries({ queryKey: ['sessions', variables.eventId] });
      }
    },
  });
};

export const useUpdateSession = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Session> }) => {
      const response = await apiClient.put<ApiResponse<Session>>(`/agenda/updateSession/${id}`, data);
      return response.data.data;
    },
    onSuccess: (data) => {
      if (data.eventId) {
        queryClient.invalidateQueries({ queryKey: ['sessions', data.eventId] });
      }
    },
  });
};

export const useDeleteSession = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/agenda/deleteSession/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
  });
};

// --- Sponsors Hooks ---

export const useSponsors = (eventId: number | string | undefined) => {
  return useQuery({
    queryKey: ['sponsors', eventId],
    queryFn: async () => {
      if (!eventId) return [];
      const response = await apiClient.get<any>(`/directory/sponsors?eventId=${eventId}`);
      // Handle response format from getAllSponsors: { message, data: { sponsors: [], pagination: {} } }
      if (response.data?.data?.sponsors && Array.isArray(response.data.data.sponsors)) {
        return response.data.data.sponsors as Sponsor[];
      }
      return [] as Sponsor[];
    },
    enabled: !!eventId,
  });
};

export const useSponsorTypes = (eventId: number | string | undefined) => {
  return useQuery({
    queryKey: ['sponsor-types', eventId],
    queryFn: async () => {
      if (!eventId) return [];
      const response = await apiClient.get<ApiResponse<SponsorType[]>>(`/directory/sponsor-types/event/${eventId}`);
      if (Array.isArray(response.data)) return response.data;
      return response.data.data || [];
    },
    enabled: !!eventId,
  });
};

export const useCreateSponsor = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Partial<Sponsor>) => {
      const response = await apiClient.post<ApiResponse<Sponsor>>('/directory/sponsors', data);
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      if (variables.eventId) {
        queryClient.invalidateQueries({ queryKey: ['sponsors', variables.eventId] });
      }
    },
  });
};

export const useUpdateSponsor = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Sponsor> }) => {
      const response = await apiClient.put<ApiResponse<Sponsor>>(`/directory/sponsors/${id}`, data);
      return response.data.data;
    },
    onSuccess: (data) => {
      if (data.eventId) {
        queryClient.invalidateQueries({ queryKey: ['sponsors', data.eventId] });
      }
    },
  });
};

export const useDeleteSponsor = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/directory/sponsors/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sponsors'] });
    },
  });
};

// --- Directory Hooks ---

export const useDirectory = (eventId: number | string | undefined) => {
  return useQuery({
    queryKey: ['directory', eventId],
    queryFn: async () => {
      if (!eventId) return [];
      const response = await apiClient.get<ApiResponse<DirectoryUser[]> | DirectoryUser[]>(`/directory/people/event/${eventId}`);
      
      // Handle both raw array and wrapped response format
      if (Array.isArray(response.data)) {
        return response.data;
      }
      return response.data.data || [];
    },
    enabled: !!eventId,
  });
};

export const useUpdateUserStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, status, communityId }: { userId: number; status: boolean; communityId?: number }) => {
      const response = await apiClient.patch(`/directory/people/status/${userId}`, { status, communityId });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['directory'] });
    },
  });
};

export const useCreateDirectoryUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: FormData) => {
      const response = await apiClient.post<ApiResponse<DirectoryUser>>('/directory/people', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['directory'] });
    },
  });
};



// --- Exhibitors Hooks ---

export const useExhibitors = (eventId: number | string | undefined) => {
  return useQuery({
    queryKey: ['exhibitors', eventId],
    queryFn: async () => {
      if (!eventId) return [];
      const response = await apiClient.get<ApiResponse<Exhibitor[]>>(`/directory/exhibitors?eventId=${eventId}`);
      if (Array.isArray(response.data)) return response.data;
      return response.data.data || [];
    },
    enabled: !!eventId,
  });
};

export const useExhibitorTypes = (eventId: number | string | undefined) => {
  return useQuery({
    queryKey: ['exhibitor-types', eventId],
    queryFn: async () => {
      if (!eventId) return [];
      const response = await apiClient.get<ApiResponse<ExhibitorType[]>>(`/directory/exhibitor-types/event/${eventId}`);
      if (Array.isArray(response.data)) return response.data;
      return response.data.data || [];
    },
    enabled: !!eventId,
  });
};

export const useCreateExhibitor = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Partial<Exhibitor>) => {
      const response = await apiClient.post<ApiResponse<Exhibitor>>('/directory/exhibitors', data);
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      if (variables.eventId) {
        queryClient.invalidateQueries({ queryKey: ['exhibitors', variables.eventId] });
      }
    },
  });
};

export const useUpdateExhibitor = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Exhibitor> }) => {
      const response = await apiClient.put<ApiResponse<Exhibitor>>(`/directory/exhibitors/${id}`, data);
      return response.data.data;
    },
    onSuccess: (data) => {
      if (data.eventId) {
        queryClient.invalidateQueries({ queryKey: ['exhibitors', data.eventId] });
      }
    },
  });
};

export const useDeleteExhibitor = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/directory/exhibitors/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exhibitors'] });
    },
  });
};

// --- Engagement Hooks ---

export const usePolls = (eventId: number | string | undefined) => {
  return useQuery({
    queryKey: ['polls', eventId],
    queryFn: async () => {
      if (!eventId) return [];
      const response = await apiClient.get<ApiResponse<Poll[]>>(`/engage/polls?eventId=${eventId}`);
      if (Array.isArray(response.data)) return response.data;
      return response.data.data || [];
    },
    enabled: !!eventId,
  });
};

export const useQuestions = (eventId: number | string | undefined) => {
  return useQuery({
    queryKey: ['questions', eventId],
    queryFn: async () => {
      if (!eventId) return [];
      // Backend doesn't support getting questions by eventId yet.
      // Returning empty array to prevent 404.
      return [] as Question[];
    },
    enabled: !!eventId,
  });
};

export const useCreatePoll = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Partial<Poll> & { eventId?: number }) => {
      const response = await apiClient.post<ApiResponse<Poll>>(`/engage/session/${data.sessionId}/poll`, data);
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      if (variables.eventId) {
        queryClient.invalidateQueries({ queryKey: ['polls', variables.eventId] });
      }
    },
  });
};

// --- Gallery Hooks ---

export const useGalleryItems = (eventId: number | string | undefined) => {
  return useQuery({
    queryKey: ['gallery', eventId],
    queryFn: async () => {
      if (!eventId) return [];
      const response = await apiClient.get<ApiResponse<GalleryItem[]>>(`/gallery/event/${eventId}`);
      if (Array.isArray(response.data)) return response.data;
      return response.data.data || [];
    },
    enabled: !!eventId,
  });
};

export const useUploadGalleryItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await apiClient.post<ApiResponse<GalleryItem>>('/gallery/createGallery', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      const eventId = variables.get('eventId');
      if (eventId) {
        queryClient.invalidateQueries({ queryKey: ['gallery', Number(eventId)] });
      }
    },
  });
};

export const useDeleteGalleryItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/gallery/deleteGalleryItems/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gallery'] });
    },
  });
};

// --- Community Hooks ---

export const useCommunities = () => {
  return useQuery({
    queryKey: ['communities'],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<Community[]>>('/community');
      if (Array.isArray(response.data)) return response.data;
      return response.data.data || [];
    },
  });
};

export const useCommunityDetails = (id: string | number) => {
  return useQuery({
    queryKey: ['communities', id],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<Community>>(`/community/${id}`);
      return response.data.data;
    },
    enabled: !!id,
  });
};

export const useCreateCommunity = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: FormData) => {
      const response = await apiClient.post<ApiResponse<Community>>('/community', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communities'] });
    },
  });
};

export const useUpdateCommunity = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: FormData }) => {
      const response = await apiClient.put<ApiResponse<Community>>(`/community/${id}`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['communities'] });
      if (data?.id) {
        queryClient.invalidateQueries({ queryKey: ['communities', data.id] });
      }
    },
  });
};

export const useDeleteCommunity = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/community/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communities'] });
    },
  });
};

export const useParticipationTypes = (eventId: number | string | undefined) => {
  return useQuery({
    queryKey: ['participation-types', eventId],
    queryFn: async () => {
      if (!eventId) return [];
      const response = await apiClient.get<ApiResponse<ParticipationType[]>>(`/directory/participation-type/event/${eventId}`);
      if (Array.isArray(response.data)) return response.data;
      return response.data.data || [];
    },
    enabled: !!eventId,
  });
};

// --- News Hooks ---

export const useNewsPosts = (params: { eventId?: number; communityId?: number }) => {
  return useQuery({
    queryKey: ['news', params],
    queryFn: async () => {
      const endpoint = params.eventId 
        ? `/news/event/${params.eventId}` 
        : `/news/community/${params.communityId}`;
      const response = await apiClient.get<{ posts: NewsPost[] }>(endpoint);
      return response.data.posts;
    },
    enabled: !!params.eventId || !!params.communityId,
  });
};

export const useCreateNewsPost = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await apiClient.post<{ data: NewsPost }>('/news', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      const eventId = variables.get('eventId');
      const communityId = variables.get('communityId');
      queryClient.invalidateQueries({ queryKey: ['news', { eventId: eventId ? Number(eventId) : undefined, communityId: communityId ? Number(communityId) : undefined }] });
    },
  });
};

// --- Social Hooks ---

export const useSocialPosts = (params: { eventId?: number; communityId?: number }) => {
  return useQuery({
    queryKey: ['social', params],
    queryFn: async () => {
      const endpoint = params.eventId 
        ? `/social/event/${params.eventId}` 
        : `/social/community/${params.communityId}`;
      const response = await apiClient.get<{ posts: SocialPost[] }>(endpoint);
      return response.data.posts;
    },
    enabled: !!params.eventId || !!params.communityId,
  });
};

export const useCreateSocialPost = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { content: string; eventId?: number; communityId?: number }) => {
      const response = await apiClient.post<{ data: SocialPost }>('/social', data);
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['social', { eventId: variables.eventId, communityId: variables.communityId }] });
    },
  });
};

// --- Feature Settings Hooks ---

export const useFeatureSettings = (eventId: number | string | undefined) => {
  return useQuery({
    queryKey: ['feature-settings', eventId],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<FeatureTabSetting[]>>(`/feature-settings/${eventId}`);
      if (Array.isArray(response.data)) {
        return response.data;
      }
      return response.data.data;
    },
    enabled: !!eventId,
  });
};

export const useUpdateFeatureSetting = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { eventId: number; EventTabs: string; isActive: boolean; icon?: string; filledIcon?: string; text?: string; order?: number; userId?: number }) => {
      const response = await apiClient.post<ApiResponse<FeatureTabSetting>>('/feature-settings', data);
      return response.data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['feature-settings', data.eventId] });
    },
  });
};