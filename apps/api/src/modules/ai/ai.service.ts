import Anthropic from '@anthropic-ai/sdk';
import { env } from '../../config/env.js';
import { AppError } from '../../utils/app-error.js';

const MODEL = 'claude-opus-4-8';

function getClient(): Anthropic {
  if (!env.ANTHROPIC_API_KEY) {
    throw AppError.internal('AI service is not configured (ANTHROPIC_API_KEY missing)');
  }
  return new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
}

export type ChatMessage = { role: 'user' | 'assistant'; content: string };

export function streamChat(messages: ChatMessage[], system?: string) {
  const client = getClient();
  return client.messages.stream({
    model: MODEL,
    max_tokens: 8192,
    thinking: { type: 'adaptive' },
    ...(system ? { system } : {}),
    messages,
  });
}

export async function summarize(content: string): Promise<string> {
  const client = getClient();
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 2048,
    thinking: { type: 'adaptive' },
    system:
      'You are a document summarization assistant. Summarize the provided content concisely, highlighting key points and actionable insights. Return only the summary text, no preamble.',
    messages: [{ role: 'user', content }],
  });

  const text = response.content.find((b): b is Anthropic.TextBlock => b.type === 'text');
  return text?.text ?? '';
}

export interface CodeExplanation {
  explanation: string;
  suggestions: string[];
}

export async function explainCode(code: string, language?: string): Promise<CodeExplanation> {
  const client = getClient();
  const langHint = language ? ` The code is written in ${language}.` : '';
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 2048,
    thinking: { type: 'adaptive' },
    system: `You are a code explanation assistant.${langHint} Analyze the code and respond with a JSON object with two keys: "explanation" (string — what the code does) and "suggestions" (array of strings — improvement recommendations). Return valid JSON only, no markdown fences.`,
    messages: [{ role: 'user', content: code }],
  });

  const textBlock = response.content.find((b): b is Anthropic.TextBlock => b.type === 'text');
  try {
    return JSON.parse(textBlock?.text ?? '{}') as CodeExplanation;
  } catch {
    return { explanation: textBlock?.text ?? '', suggestions: [] };
  }
}

export interface SuggestedTask {
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  estimatedHours: number;
}

export async function suggestTasks(
  requirement: string,
  projectContext?: string,
): Promise<{ tasks: SuggestedTask[] }> {
  const client = getClient();
  const contextBlock = projectContext ? `\n\nProject context: ${projectContext}` : '';
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 2048,
    thinking: { type: 'adaptive' },
    system:
      'You are a project planning assistant. Break the user\'s requirement into actionable tasks. Respond with a JSON object containing a "tasks" array. Each task must have: "title" (short name), "description" (1-2 sentences), "priority" ("high" | "medium" | "low"), "estimatedHours" (number). Return valid JSON only, no markdown fences.',
    messages: [{ role: 'user', content: requirement + contextBlock }],
  });

  const textBlock = response.content.find((b): b is Anthropic.TextBlock => b.type === 'text');
  try {
    return JSON.parse(textBlock?.text ?? '{}') as { tasks: SuggestedTask[] };
  } catch {
    return { tasks: [] };
  }
}

export interface SearchItem {
  id: string;
  content: string;
  metadata?: Record<string, unknown>;
}

export interface SearchResult {
  id: string;
  relevance: number;
  snippet: string;
}

export async function semanticSearch(
  query: string,
  items: SearchItem[],
): Promise<{ results: SearchResult[] }> {
  const client = getClient();
  const itemsText = items
    .map((item, i) => `[${i}] id=${item.id}\n${item.content}`)
    .join('\n\n');

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 2048,
    thinking: { type: 'adaptive' },
    system:
      'You are a semantic search engine. Given a query and a list of items, rank them by semantic relevance. Respond with a JSON object containing a "results" array. Each entry must have: "id" (original item id), "relevance" (0–1 float, 1 = most relevant), "snippet" (brief excerpt or reason why it matches). Only include items with relevance > 0.1. Sort descending by relevance. Return valid JSON only, no markdown fences.',
    messages: [{ role: 'user', content: `Query: ${query}\n\nItems:\n${itemsText}` }],
  });

  const textBlock = response.content.find((b): b is Anthropic.TextBlock => b.type === 'text');
  try {
    return JSON.parse(textBlock?.text ?? '{}') as { results: SearchResult[] };
  } catch {
    return { results: [] };
  }
}
