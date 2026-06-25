import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type {
  PomodoroSession,
  DailyPlan,
  PomodoroStats,
  CreateSessionInput,
  CreatePlanItemInput,
  UpdatePlanItemInput,
} from '@devflow/shared';

const base = '/productivity';

// ─── Pomodoro Sessions ────────────────────────────────────────────────────────

export function useSessions(params?: { type?: string; from?: string; to?: string }) {
  return useQuery({
    queryKey: ['pomodoro-sessions', params],
    queryFn: async () => {
      const { data } = await apiClient.get(`${base}/sessions`, { params });
      return data.data as PomodoroSession[];
    },
  });
}

export function useCreateSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateSessionInput) => {
      const { data } = await apiClient.post(`${base}/sessions`, input);
      return data.data as PomodoroSession;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pomodoro-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['pomodoro-stats'] });
    },
  });
}

export function useCompleteSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (sessionId: string) => {
      const { data } = await apiClient.patch(`${base}/sessions/${sessionId}`);
      return data.data as PomodoroSession;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pomodoro-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['pomodoro-stats'] });
    },
  });
}

export function usePomodoroStats() {
  return useQuery({
    queryKey: ['pomodoro-stats'],
    queryFn: async () => {
      const { data } = await apiClient.get(`${base}/stats`);
      return data.data as PomodoroStats;
    },
  });
}

// ─── Daily Planner ───────────────────────────────────────────────────────────

export function useDailyPlan(date: string) {
  return useQuery({
    queryKey: ['daily-plan', date],
    queryFn: async () => {
      const { data } = await apiClient.get(`${base}/planner/${date}`);
      return data.data as DailyPlan;
    },
    enabled: !!date,
  });
}

export function useAddPlanItem(date: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreatePlanItemInput) => {
      const { data } = await apiClient.post(`${base}/planner/${date}/items`, input);
      return data.data as DailyPlan;
    },
    onSuccess: (plan) => {
      queryClient.setQueryData(['daily-plan', date], plan);
    },
  });
}

export function useUpdatePlanItem(date: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ itemId, input }: { itemId: string; input: UpdatePlanItemInput }) => {
      const { data } = await apiClient.patch(
        `${base}/planner/${date}/items/${itemId}`,
        input,
      );
      return data.data as DailyPlan;
    },
    onSuccess: (plan) => {
      queryClient.setQueryData(['daily-plan', date], plan);
    },
  });
}

export function useRemovePlanItem(date: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (itemId: string) => {
      const { data } = await apiClient.delete(`${base}/planner/${date}/items/${itemId}`);
      return data.data as DailyPlan;
    },
    onSuccess: (plan) => {
      queryClient.setQueryData(['daily-plan', date], plan);
    },
  });
}
