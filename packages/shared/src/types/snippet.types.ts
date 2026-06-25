export interface Snippet {
  _id: string;
  workspace: string;
  title: string;
  description: string;
  language: string;
  code: string;
  tags: string[];
  folder: string | null;
  visibility: 'personal' | 'team';
  favoritedBy: string[];
  createdBy: string | { _id: string; displayName: string; avatar: string };
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface SnippetFolder {
  _id: string;
  workspace: string;
  name: string;
  parent: string | null;
  order: number;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export const SUPPORTED_LANGUAGES = [
  'javascript',
  'typescript',
  'python',
  'java',
  'csharp',
  'cpp',
  'c',
  'go',
  'rust',
  'ruby',
  'php',
  'swift',
  'kotlin',
  'dart',
  'html',
  'css',
  'scss',
  'sql',
  'graphql',
  'json',
  'yaml',
  'markdown',
  'bash',
  'powershell',
  'docker',
  'plaintext',
] as const;

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];
