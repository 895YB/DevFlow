import { useRef, useState, useEffect } from 'react';
import { Send, Square, Trash2, Zap, Loader2, AlertCircle, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAiChat } from '../hooks/use-ai-chat';
import {
  useSummarize,
  useExplainCode,
  useSuggestTasks,
  useSemanticSearch,
  type SearchItem,
  type SuggestedTask,
  type SearchResult,
} from '../hooks/use-ai-tools';

const PRIORITY_COLORS: Record<SuggestedTask['priority'], string> = {
  high: 'text-red-500',
  medium: 'text-yellow-500',
  low: 'text-green-500',
};

// ---------- Chat Tab ----------

function ChatTab() {
  const { messages, streaming, error, send, stop, clear } = useAiChat();
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    setInput('');
    void send(text);
  };

  return (
    <div className="flex flex-col h-[600px]">
      {/* Message list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 rounded-xl border border-border bg-muted/20">
        {messages.length === 0 && (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            Start a conversation — ask anything about your projects or tasks.
          </div>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap ${
                msg.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-foreground'
              }`}
            >
              {msg.content}
              {msg.role === 'assistant' && streaming && i === messages.length - 1 && (
                <span className="inline-block ml-1 w-1.5 h-3.5 bg-current opacity-70 animate-pulse rounded-sm" />
              )}
            </div>
          </div>
        ))}
        {error && (
          <div className="flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input row */}
      <div className="mt-3 flex gap-2">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Message the AI… (Shift+Enter for newline)"
          rows={2}
          className="resize-none flex-1"
          disabled={streaming}
        />
        <div className="flex flex-col gap-1.5">
          {streaming ? (
            <Button size="icon" variant="destructive" onClick={stop} title="Stop">
              <Square className="h-4 w-4" />
            </Button>
          ) : (
            <Button size="icon" onClick={handleSend} disabled={!input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          )}
          <Button size="icon" variant="ghost" onClick={clear} title="Clear chat">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// ---------- Summarize Tab ----------

function SummarizeTab() {
  const [content, setContent] = useState('');
  const { data, loading, error, run, reset } = useSummarize();

  return (
    <div className="space-y-4">
      <Textarea
        value={content}
        onChange={(e) => { setContent(e.target.value); reset(); }}
        placeholder="Paste the document, meeting notes, or any text you want summarized…"
        rows={10}
        className="resize-none font-mono text-sm"
      />
      <Button
        onClick={() => void run(content)}
        disabled={!content.trim() || loading}
        className="w-full"
      >
        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Summarize
      </Button>
      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" /> {error}
        </div>
      )}
      {data && (
        <div className="rounded-xl border border-border bg-muted/20 p-4 text-sm whitespace-pre-wrap">
          {data.summary}
        </div>
      )}
    </div>
  );
}

// ---------- Explain Code Tab ----------

const LANGUAGES = ['Auto-detect', 'TypeScript', 'JavaScript', 'Python', 'Rust', 'Go', 'Java', 'C++', 'SQL', 'Bash'];

function ExplainCodeTab() {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('Auto-detect');
  const { data, loading, error, run, reset } = useExplainCode();

  const handleRun = () => {
    void run({ code, language: language === 'Auto-detect' ? undefined : language });
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <Textarea
          value={code}
          onChange={(e) => { setCode(e.target.value); reset(); }}
          placeholder="Paste code to explain…"
          rows={10}
          className="resize-none font-mono text-sm flex-1"
        />
      </div>
      <div className="flex gap-3">
        <Select value={language} onValueChange={setLanguage}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LANGUAGES.map((l) => (
              <SelectItem key={l} value={l}>{l}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={handleRun} disabled={!code.trim() || loading} className="flex-1">
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Explain
        </Button>
      </div>
      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" /> {error}
        </div>
      )}
      {data && (
        <div className="space-y-3">
          <div className="rounded-xl border border-border bg-muted/20 p-4 text-sm whitespace-pre-wrap">
            {data.explanation}
          </div>
          {data.suggestions.length > 0 && (
            <div className="rounded-xl border border-border p-4 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Suggestions</p>
              <ul className="space-y-1.5">
                {data.suggestions.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <ChevronUp className="h-3.5 w-3.5 mt-0.5 text-primary shrink-0" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ---------- Suggest Tasks Tab ----------

function SuggestTasksTab() {
  const [requirement, setRequirement] = useState('');
  const [context, setContext] = useState('');
  const { data, loading, error, run, reset } = useSuggestTasks();

  return (
    <div className="space-y-4">
      <Textarea
        value={requirement}
        onChange={(e) => { setRequirement(e.target.value); reset(); }}
        placeholder="Describe the feature or requirement to break down into tasks…"
        rows={5}
        className="resize-none"
      />
      <Input
        value={context}
        onChange={(e) => { setContext(e.target.value); reset(); }}
        placeholder="Project context (optional) — e.g. React app, REST API, mobile app"
      />
      <Button
        onClick={() => void run({ requirement, projectContext: context || undefined })}
        disabled={!requirement.trim() || loading}
        className="w-full"
      >
        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Suggest Tasks
      </Button>
      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" /> {error}
        </div>
      )}
      {data && data.tasks.length > 0 && (
        <ul className="space-y-3">
          {data.tasks.map((task: SuggestedTask, i: number) => (
            <li key={i} className="rounded-xl border border-border p-4 space-y-1">
              <div className="flex items-center justify-between gap-2">
                <p className="font-semibold text-sm">{task.title}</p>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-xs font-medium ${PRIORITY_COLORS[task.priority]}`}>
                    {task.priority}
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    {task.estimatedHours}h
                  </Badge>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{task.description}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ---------- Semantic Search Tab ----------

function SemanticSearchTab() {
  const [query, setQuery] = useState('');
  const [itemsText, setItemsText] = useState('');
  const { data, loading, error, run, reset } = useSemanticSearch();

  const handleSearch = () => {
    const items: SearchItem[] = itemsText
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((content, i) => ({ id: String(i + 1), content }));

    if (items.length === 0) return;
    void run({ query, items });
  };

  return (
    <div className="space-y-4">
      <Input
        value={query}
        onChange={(e) => { setQuery(e.target.value); reset(); }}
        placeholder="Search query — e.g. authentication and session management"
      />
      <Textarea
        value={itemsText}
        onChange={(e) => { setItemsText(e.target.value); reset(); }}
        placeholder={`Items to search (one per line):\nUser login with email and password\nOAuth integration with GitHub\nPassword reset flow\nSession expiry and refresh tokens`}
        rows={8}
        className="resize-none text-sm"
      />
      <Button
        onClick={handleSearch}
        disabled={!query.trim() || !itemsText.trim() || loading}
        className="w-full"
      >
        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Search
      </Button>
      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" /> {error}
        </div>
      )}
      {data && (
        <div className="space-y-2">
          {data.results.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No relevant results found.</p>
          ) : (
            data.results.map((result: SearchResult) => (
              <div key={result.id} className="rounded-xl border border-border p-4 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground font-mono">item #{result.id}</span>
                  <span className="text-xs font-semibold text-primary">
                    {Math.round(result.relevance * 100)}% match
                  </span>
                </div>
                <p className="text-sm">{result.snippet}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ---------- Main Page ----------

export function AiPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="flex items-start gap-4 mb-8">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
          <Zap className="h-6 w-6 text-primary" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">AI Features</h1>
            <Badge variant="secondary">Beta</Badge>
          </div>
          <p className="mt-1 text-muted-foreground text-sm">
            Powered by Claude Opus. Chat, summarize, explain code, plan tasks, and search semantically.
          </p>
        </div>
      </div>

      <Tabs defaultValue="chat">
        <TabsList className="w-full grid grid-cols-5 mb-6">
          <TabsTrigger value="chat">Chat</TabsTrigger>
          <TabsTrigger value="summarize">Summarize</TabsTrigger>
          <TabsTrigger value="explain">Code</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="search">Search</TabsTrigger>
        </TabsList>

        <TabsContent value="chat">
          <ChatTab />
        </TabsContent>
        <TabsContent value="summarize">
          <SummarizeTab />
        </TabsContent>
        <TabsContent value="explain">
          <ExplainCodeTab />
        </TabsContent>
        <TabsContent value="tasks">
          <SuggestTasksTab />
        </TabsContent>
        <TabsContent value="search">
          <SemanticSearchTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
