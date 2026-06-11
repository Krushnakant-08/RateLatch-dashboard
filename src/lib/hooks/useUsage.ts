'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchUsage, type UsageResponse } from '../api';
import { getToken } from '../auth';

export function useUsage(hours: number = 24) {
  return useQuery<UsageResponse>({
    queryKey: ['usage', hours],
    queryFn: async () => {
      const token = getToken();
      if (!token) throw new Error('Not authenticated');
      return fetchUsage(token, { hours });
    },
    refetchInterval: 30_000, // Poll every 30 seconds
    staleTime: 10_000,
  });
}
