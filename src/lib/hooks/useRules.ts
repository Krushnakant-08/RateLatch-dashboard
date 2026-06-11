'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchRules,
  createRule,
  updateRule,
  deleteRule,
  type Rule,
} from '../api';
import { getToken } from '../auth';

export function useRules() {
  return useQuery<{ rules: Rule[] }>({
    queryKey: ['rules'],
    queryFn: async () => {
      const token = getToken();
      if (!token) throw new Error('Not authenticated');
      return fetchRules(token);
    },
    staleTime: 30_000,
  });
}

export function useCreateRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      route: string;
      keyBy: string;
      maxReq: number;
      windowMs: number;
      priority: number;
    }) => {
      const token = getToken();
      if (!token) throw new Error('Not authenticated');
      return createRule(token, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rules'] });
    },
  });
}

export function useUpdateRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      ruleId,
      data,
    }: {
      ruleId: string;
      data: Partial<{
        route: string;
        keyBy: string;
        maxReq: number;
        windowMs: number;
        priority: number;
      }>;
    }) => {
      const token = getToken();
      if (!token) throw new Error('Not authenticated');
      return updateRule(token, ruleId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rules'] });
    },
  });
}

export function useDeleteRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ruleId: string) => {
      const token = getToken();
      if (!token) throw new Error('Not authenticated');
      return deleteRule(token, ruleId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rules'] });
    },
  });
}
