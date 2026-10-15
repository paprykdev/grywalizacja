import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import type { CreateLinkDto, Link, UpdateLinkDto } from '@repo/api';

import { apiFetch } from '@/lib/api-client';

// Query keys in one place, so invalidation can't get out of sync
export const linkKeys = {
  all: ['links'] as const,
  list: () => [...linkKeys.all, 'list'] as const,
  detail: (id: number) => [...linkKeys.all, 'detail', id] as const,
};

export function useLinks() {
  return useQuery({
    queryKey: linkKeys.list(),
    queryFn: () => apiFetch<Link[]>('/links'),
  });
}

export function useLink(id: number) {
  return useQuery({
    queryKey: linkKeys.detail(id),
    queryFn: () => apiFetch<Link>(`/links/${id}`),
  });
}

export function useCreateLink() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateLinkDto) =>
      apiFetch<Link>('/links', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: linkKeys.all });
      toast.success('Link created');
    },
  });
}

export function useUpdateLink(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateLinkDto) =>
      apiFetch<Link>(`/links/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: linkKeys.all });
      toast.success('Link updated');
    },
  });
}

export function useDeleteLink() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      apiFetch<Link>(`/links/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: linkKeys.all });
      toast.success('Link deleted');
    },
  });
}
