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
      const responseData = response.data;
      
      if (!responseData) return undefined;

      // Handle different response structures
      if (responseData && typeof responseData === 'object' && 'activeEvents' in responseData) {
        return responseData as unknown as DashboardStats;
      }
      
      return responseData.data;
    },
  });
};

// --- Events Hooks ---

export const useEvents = () => {
  return useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<Event[]>>('/events');
      return response.data.data || [];
    },
  });
};

export const useEventDetails = (id: string | number) => {
  return useQuery({
    queryKey: ['events', id],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<Event>>(`/events/${id}`);
      return response.data.data;
    },
    enabled: !!id,
  });
};

export const useCreateEvent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ data, onProgress }: { data: FormData; onProgress?: (percent: number) => void }) => {
      const response = await apiClient.post<ApiResponse<{ event: Event }>>('/events', data, {
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
      const response = await apiClient.put<ApiResponse<{ event: Event }>>(`/events/${id}`, data, {
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
      const response = await apiClient.delete(`/events/${id}`);
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
      const response = await apiClient.get<ApiResponse<Session[]>>(`/agenda/events/${eventId}/sessions`);
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
      const response = await apiClient.get<ApiResponse<SessionType[]>>(`/agenda/events/${eventId}/types`);
      if (Array.isArray(response.data)) return response.data;
      return response.data.data || [];
    },
    enabled: !!eventId,
  });
};

export const useCreateSessionType = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ eventId, data }: { eventId: number | string; data: { sessionname: string; color: string } }) => {
      // Backend returns the created session type object directly, not wrapped in { data: ... }
      const response = await apiClient.post<SessionType>(`/agenda/events/${eventId}/types`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['session-types', variables.eventId] });
    },
  });
};

export const useCreateSession = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Partial<Session>) => {
      // Backend returns { message: '...', session: ... }
      const response = await apiClient.post<any>(`/agenda/events/${data.eventId}/sessions`, data);
      return response.data.session || response.data.data || response.data;
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
      const response = await apiClient.put<ApiResponse<Session>>(`/agenda/sessions/${id}`, data);
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
      await apiClient.delete(`/agenda/sessions/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
  });
};

// --- Sponsors Hooks ---

export const useSponsorTypes = (eventId: number | string | undefined) => {
  return useQuery({
    queryKey: ['sponsor-types', eventId],
    queryFn: async () => {
      if (!eventId) return [];
      const response = await apiClient.get<ApiResponse<SponsorType[]>>(`/directory/events/${eventId}/sponsor-types`);
      if (Array.isArray(response.data)) return response.data;
      return response.data.data || [];
    },
    enabled: !!eventId,
  });
};

export const useCreateSponsorType = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ eventId, data }: { eventId: number | string; data: { type: string } }) => {
      const response = await apiClient.post<SponsorType>('/directory/sponsor-types', { ...data, eventId: Number(eventId) });
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['sponsor-types', variables.eventId] });
    },
  });
};

export const useUpdateSponsorType = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<SponsorType> }) => {
      const response = await apiClient.put<SponsorType>(`/directory/sponsor-types/${id}`, data);
      return response.data;
    },
    onSuccess: (data) => {
      if (data.eventId) {
        queryClient.invalidateQueries({ queryKey: ['sponsor-types', data.eventId] });
      }
    },
  });
};

export const useDeleteSponsorType = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id }: { id: number; eventId: number }) => {
      const response = await apiClient.delete(`/directory/sponsor-types/${id}`);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['sponsor-types', variables.eventId] });
    },
  });
};

export const useSponsors = (eventId: number | string | undefined) => {
  return useQuery({
    queryKey: ['sponsors', eventId],
    queryFn: async () => {
      if (!eventId) return [];
      const response = await apiClient.get<ApiResponse<Sponsor[]>>(`/directory/events/${eventId}/sponsors`);
      if (Array.isArray(response.data.data)) {
        return response.data.data;
      }
      return [] as Sponsor[];
    },
    enabled: !!eventId,
  });
};

export const useCreateSponsor = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ data, eventId }: { data: FormData; eventId: number }) => {
      const response = await apiClient.post<ApiResponse<Sponsor>>(`/directory/events/${eventId}/sponsors`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
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
    mutationFn: async ({ id, data }: { id: number; data: FormData }) => {
      const response = await apiClient.put<ApiResponse<Sponsor>>(`/directory/sponsors/${id}`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.data;
    },
    onSuccess: (data) => {
      const eventId = data.sponsorType?.eventId || data.eventId;
      if (eventId) {
        queryClient.invalidateQueries({ queryKey: ['sponsors', eventId] });
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
    queryFn: async (): Promise<DirectoryUser[]> => {
      if (!eventId) return [];
      const response = await apiClient.get<unknown>(`/directory/events/${eventId}/people`);
      
      const responseData = response.data;
      
      // Handle both raw array and wrapped response format
      if (Array.isArray(responseData)) {
        return responseData as DirectoryUser[];
      }
      
      // Handle paginated response
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data = responseData as any;
      if (data?.data?.users && Array.isArray(data.data.users)) {
        return data.data.users as DirectoryUser[];
      }
      
      return (data?.data || []) as DirectoryUser[];
    },
    enabled: !!eventId,
  });
};

export const useUpdateUserStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, status, communityId }: { userId: number; status: boolean; communityId?: number }) => {
      const response = await apiClient.patch(`/directory/people/${userId}/status`, { status, communityId });
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
    mutationFn: async ({ data, eventId }: { data: FormData; eventId?: number | string }) => {
      let url = '/directory/people';
      if (eventId) {
        url = `/directory/events/${eventId}/people`;
      }
      
      const response = await apiClient.post<ApiResponse<DirectoryUser>>(url, data, {
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

export const useUpdateDirectoryUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: FormData }) => {
      const response = await apiClient.put<ApiResponse<DirectoryUser>>(`/directory/people/${id}`, data, {
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

export const useDeleteDirectoryUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/directory/people/${id}`);
      return id;
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
    queryFn: async (): Promise<Exhibitor[]> => {
      if (!eventId) return [];
      const response = await apiClient.get<unknown>(`/directory/events/${eventId}/exhibitors`);
      const responseData = response.data;
      
      if (Array.isArray(responseData)) return responseData as Exhibitor[];
      
      // Handle paginated response
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data = responseData as any;
      if (data?.data?.exhibitors && Array.isArray(data.data.exhibitors)) {
        return data.data.exhibitors as Exhibitor[];
      }
      
      return (data?.data || []) as Exhibitor[];
    },
    enabled: !!eventId,
  });
};

export const useExhibitorTypes = (eventId: number | string | undefined) => {
  return useQuery({
    queryKey: ['exhibitor-types', eventId],
    queryFn: async () => {
      if (!eventId) return [];
      const response = await apiClient.get<ApiResponse<ExhibitorType[]>>(`/directory/events/${eventId}/exhibitor-types`);
      if (Array.isArray(response.data)) return response.data;
      return response.data.data || [];
    },
    enabled: !!eventId,
  });
};

export const useCreateExhibitor = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ data, eventId }: { data: FormData; eventId: number }) => {
      const response = await apiClient.post<ApiResponse<Exhibitor>>(`/directory/events/${eventId}/exhibitors`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
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
    mutationFn: async ({ id, data }: { id: number; data: FormData }) => {
      const response = await apiClient.put<ApiResponse<Exhibitor>>(`/directory/exhibitors/${id}`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
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
      const response = await apiClient.get<ApiResponse<Poll[]>>(`/engage/events/${eventId}/polls`);
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
      const response = await apiClient.get<ApiResponse<GalleryItem[]>>(`/gallery/events/${eventId}`);
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
      const response = await apiClient.post<ApiResponse<GalleryItem>>('/gallery', formData, {
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
      await apiClient.delete(`/gallery/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gallery'] });
    },
  });
};

export const useUpdateGalleryItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: { imageLabel?: string; videoLabel?: string } }) => {
      const response = await apiClient.put(`/gallery/${id}`, data);
      return response.data;
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
      const response = await apiClient.get<unknown>('/community');
      const responseData = response.data;

      if (Array.isArray(responseData)) {
        return responseData as Community[];
      }
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data = responseData as any;

      if (data?.communities && Array.isArray(data.communities)) {
        return data.communities as Community[];
      }

      if (data?.data && Array.isArray(data.data)) {
        return data.data as Community[];
      }
      
      return [] as Community[];
    },
  });
};

export const useCommunityDetails = (id: string | number) => {
  return useQuery({
    queryKey: ['communities', id],
    queryFn: async () => {
      const response = await apiClient.get<any>(`/community/${id}`);
      return response.data.community;
    },
    enabled: !!id,
  });
};

export const useCreateCommunity = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: FormData) => {
      const response = await apiClient.post<any>('/community', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.community;
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
      const response = await apiClient.put<any>(`/community/${id}`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.community;
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
    queryKey: ['participationTypes', eventId],
    queryFn: async () => {
      if (!eventId) return [];
      const response = await apiClient.get<unknown>(`/directory/events/${eventId}/participation-types`);
      const responseData = response.data;

      if (Array.isArray(responseData)) {
        return responseData as ParticipationType[];
      }
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data = responseData as any;
      if (data?.data && Array.isArray(data.data)) {
        return data.data as ParticipationType[];
      }
      
      return [] as ParticipationType[];
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
        ? `/news/events/${params.eventId}/posts` 
        : `/news/communities/${params.communityId}/posts`;
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
      const eventId = formData.get('eventId');
      const communityId = formData.get('communityId');
      
      let endpoint = '';
      if (eventId) {
        endpoint = `/news/events/${eventId}/posts`;
      } else if (communityId) {
        endpoint = `/news/communities/${communityId}/posts`;
      } else {
        throw new Error('Either eventId or communityId is required');
      }

      const response = await apiClient.post<{ data: NewsPost }>(endpoint, formData, {
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

export const useUpdateNewsPost = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: FormData }) => {
      const response = await apiClient.put<{ data: NewsPost }>(`/news/posts/${id}`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      const eventId = variables.data.get('eventId');
      const communityId = variables.data.get('communityId');
      queryClient.invalidateQueries({ queryKey: ['news', { eventId: eventId ? Number(eventId) : undefined, communityId: communityId ? Number(communityId) : undefined }] });
    },
  });
};

export const useDeleteNewsPost = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/news/posts/${id}`);
      return id;
    },
    onSuccess: () => {
      // Invalidate all news queries since we don't know the eventId/communityId easily without passing it
      queryClient.invalidateQueries({ queryKey: ['news'] });
    },
  });
};

// --- Social Hooks ---

export const useSocialPosts = (params: { eventId?: number; communityId?: number }) => {
  return useQuery({
    queryKey: ['social', params],
    queryFn: async () => {
      const endpoint = params.eventId 
        ? `/social/events/${params.eventId}/posts` 
        : `/social/communities/${params.communityId}/posts`;
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
      let endpoint = '';
      if (data.eventId) {
        endpoint = `/social/events/${data.eventId}/posts`;
      } else if (data.communityId) {
        endpoint = `/social/communities/${data.communityId}/posts`;
      } else {
        throw new Error('Either eventId or communityId is required');
      }
      
      const response = await apiClient.post<{ data: SocialPost }>(endpoint, { content: data.content });
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['social', { eventId: variables.eventId, communityId: variables.communityId }] });
    },
  });
};

export const useUpdateSocialPost = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: { content: string; eventId?: number; communityId?: number } }) => {
      const response = await apiClient.put<{ data: SocialPost }>(`/social/posts/${id}`, data);
      return response.data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['social', { eventId: data.eventId, communityId: data.communityId }] });
    },
  });
};

export const useDeleteSocialPost = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/social/posts/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social'] });
    },
  });
};

// --- Feature Settings Hooks ---

export const useFeatureSettings = (eventId: number | string | undefined) => {
  return useQuery({
    queryKey: ['feature-settings', eventId],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<FeatureTabSetting[]>>(`/feature-settings/events/${eventId}`);
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