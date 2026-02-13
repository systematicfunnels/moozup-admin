import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api';
import type { Event, DirectoryUser, ApiResponse, DashboardStats } from '../types/api';

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
      const response = await apiClient.get<Event[]>('/events/getEvent');
      return response.data;
    },
  });
};

export const useEventDetails = (id: string | number) => {
  return useQuery({
    queryKey: ['events', id],
    queryFn: async () => {
      const response = await apiClient.get<Event>(`/events/event/details/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useCreateEvent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await apiClient.post<{ event: Event }>('/events/createEvent', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.event;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
};

// --- Directory Hooks ---

export const useDirectory = () => {
  return useQuery({
    queryKey: ['directory'],
    queryFn: async () => {
      // Using the endpoint that returns all users
      const response = await apiClient.get<DirectoryUser[]>('/directory/allPeople');
      return response.data;
    },
  });
};

export const useCreateDirectoryUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await apiClient.post<{ user: DirectoryUser }>('/directory/people', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.user;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['directory'] });
    },
  });
};

export const useUpdateUserStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, status, communityId }: { userId: number; status: boolean; communityId?: number }) => {
      const response = await apiClient.patch<{ user: DirectoryUser }>(`/directory/people/status/${userId}`, { status, communityId });
      return response.data.user;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['directory'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
};

// --- Community Hooks ---

export const useCommunities = () => {
  return useQuery({
    queryKey: ['communities'],
    queryFn: async () => {
      const response = await apiClient.get<{ communities: any[] }>('/admin/communities');
      return response.data.communities;
    },
  });
};

export const useCreateCommunity = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await apiClient.post<{ community: any }>('/admin/communities', data);
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
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await apiClient.put<{ community: any }>(`/admin/communities/${id}`, data);
      return response.data.community;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communities'] });
    },
  });
};

export const useDeleteCommunity = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await apiClient.delete(`/admin/communities/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communities'] });
    },
  });
};

export const useParticipationTypes = () => {
  return useQuery({
    queryKey: ['participation-types'],
    queryFn: async () => {
      const response = await apiClient.get<{ participationTypes: any[] }>('/directory/get-all-participation');
      return response.data.participationTypes;
    },
  });
};

export const useEventUsers = (eventId: string | number) => {
  return useQuery({
    queryKey: ['directory', 'event', eventId],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<{ users: DirectoryUser[] }>>(`/directory/people/event/${eventId}`);
      return response.data.data.users;
    },
    enabled: !!eventId,
  });
};
