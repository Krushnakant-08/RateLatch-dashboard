'use client';

import { useQuery } from '@tanstack/react-query';
import {
  fetchPlanInfo,
  fetchPlans,
  fetchSubscription,
  type PlanInfoResponse,
  type PlanOption,
  type SubscriptionResponse,
} from '../api';
import { getToken } from '../auth';

export function usePlanInfo() {
  return useQuery<PlanInfoResponse>({
    queryKey: ['plan-info'],
    queryFn: async () => {
      const token = getToken();
      if (!token) throw new Error('Not authenticated');
      return fetchPlanInfo(token);
    },
    staleTime: 30_000,
  });
}

export function usePlans() {
  return useQuery<{ plans: PlanOption[] }>({
    queryKey: ['plans'],
    queryFn: () => fetchPlans(),
    staleTime: 5 * 60_000, // 5 min — plans rarely change
  });
}

export function useSubscription() {
  return useQuery<SubscriptionResponse>({
    queryKey: ['subscription'],
    queryFn: async () => {
      const token = getToken();
      if (!token) throw new Error('Not authenticated');
      return fetchSubscription(token);
    },
    staleTime: 30_000,
  });
}
