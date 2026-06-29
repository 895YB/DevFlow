import { useState } from 'react';
import { apiClient } from '@/lib/api-client';

export interface SuggestedTask {
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  estimatedHours: number;
}

export interface SearchItem {
  id: string;
  content: string;
}

export interface SearchResult {
  id: string;
  relevance: number;
  snippet: string;
}

function useAiMutation<TInput, TOutput>(
  endpoint: string,
  buildPayload: (input: TInput) => Record<string, unknown>,
) {
  const [data, setData] = useState<TOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async (input: TInput) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.post<{ success: boolean; data: TOutput }>(
        endpoint,
        buildPayload(input),
        { timeout: 120_000 },
      );
      setData(res.data.data);
      return res.data.data;
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Request failed';
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setData(null);
    setError(null);
  };

  return { data, loading, error, run, reset };
}

export function useSummarize() {
  return useAiMutation<string, { summary: string }>(
    '/ai/summarize',
    (content) => ({ content }),
  );
}

export function useExplainCode() {
  return useAiMutation<
    { code: string; language?: string },
    { explanation: string; suggestions: string[] }
  >('/ai/explain-code', ({ code, language }) => ({ code, language }));
}

export function useSuggestTasks() {
  return useAiMutation<
    { requirement: string; projectContext?: string },
    { tasks: SuggestedTask[] }
  >('/ai/suggest-tasks', ({ requirement, projectContext }) => ({
    requirement,
    projectContext,
  }));
}

export function useSemanticSearch() {
  return useAiMutation<
    { query: string; items: SearchItem[] },
    { results: SearchResult[] }
  >('/ai/semantic-search', ({ query, items }) => ({ query, items }));
}
