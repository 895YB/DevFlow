import { useState, useCallback, useId } from 'react';
import {
  useCollections,
  useEnvironments,
  useApiHistory,
  useExecuteProxy,
  useCreateCollection,
  useDeleteCollection,
  useAddRequest,
  useDeleteRequest,
  useCreateEnvironment,
  useUpdateEnvironment,
  useDeleteEnvironment,
  useActivateEnvironment,
  useClearHistory,
} from '../hooks/use-api-tester';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Send,
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight,
  MoreHorizontal,
  History,
  FolderOpen,
  AlertCircle,
  CheckCircle2,
  Clock,
  HardDrive,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import type {
  ApiCollection,
  ApiRequest,
  ApiEnvironment,
  ApiHistoryEntry,
  KeyValuePair,
  RequestBody,
  RequestAuth,
  HttpMethod,
  AuthType,
  BodyType,
  ApiResponseData,
} from '@devflow/shared';

// ─── Constants ────────────────────────────────────────────────────────────────

const HTTP_METHODS: HttpMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];

const METHOD_COLORS: Record<HttpMethod, string> = {
  GET: 'text-emerald-500',
  POST: 'text-blue-500',
  PUT: 'text-amber-500',
  PATCH: 'text-violet-500',
  DELETE: 'text-red-500',
  HEAD: 'text-cyan-500',
  OPTIONS: 'text-pink-500',
};

// ─── Types ────────────────────────────────────────────────────────────────────

interface RequestState {
  method: HttpMethod;
  url: string;
  params: KeyValuePair[];
  headers: KeyValuePair[];
  body: RequestBody;
  auth: RequestAuth;
}

const DEFAULT_REQUEST: RequestState = {
  method: 'GET',
  url: '',
  params: [],
  headers: [],
  body: { type: 'none', content: '' },
  auth: { type: 'none' },
};

// ─── Variable substitution ───────────────────────────────────────────────────

function substituteVars(text: string, variables: KeyValuePair[]): string {
  return text.replace(/\{\{([^}]+)\}\}/g, (_match, key: string) => {
    const v = variables.find((v) => v.enabled && v.key === key.trim());
    return v ? v.value : _match;
  });
}

function applyVarsToRequest(req: RequestState, envVars: KeyValuePair[]): RequestState {
  if (!envVars.length) return req;
  return {
    ...req,
    url: substituteVars(req.url, envVars),
    params: req.params.map((p) => ({ ...p, value: substituteVars(p.value, envVars) })),
    headers: req.headers.map((h) => ({ ...h, value: substituteVars(h.value, envVars) })),
    body: { ...req.body, content: substituteVars(req.body.content, envVars) },
  };
}

// ─── Key-Value Table ──────────────────────────────────────────────────────────

function KeyValueTable({
  rows,
  onChange,
  placeholder = 'Key',
  valuePlaceholder = 'Value',
}: {
  rows: KeyValuePair[];
  onChange: (rows: KeyValuePair[]) => void;
  placeholder?: string;
  valuePlaceholder?: string;
}) {
  const addRow = () =>
    onChange([...rows, { key: '', value: '', enabled: true }]);

  const updateRow = (index: number, field: keyof KeyValuePair, value: string | boolean) => {
    onChange(rows.map((r, i) => (i === index ? { ...r, [field]: value } : r)));
  };

  const removeRow = (index: number) =>
    onChange(rows.filter((_, i) => i !== index));

  return (
    <div className="space-y-1.5">
      {rows.map((row, i) => (
        <div key={i} className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={row.enabled}
            onChange={(e) => updateRow(i, 'enabled', e.target.checked)}
            className="h-4 w-4 shrink-0 accent-primary"
            aria-label={`Enable ${placeholder} row ${i + 1}`}
          />
          <Input
            value={row.key}
            onChange={(e) => updateRow(i, 'key', e.target.value)}
            placeholder={placeholder}
            className="h-8 flex-1 text-xs font-mono"
          />
          <Input
            value={row.value}
            onChange={(e) => updateRow(i, 'value', e.target.value)}
            placeholder={valuePlaceholder}
            className="h-8 flex-1 text-xs font-mono"
          />
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
            onClick={() => removeRow(i)}
            aria-label="Remove row"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ))}
      <Button variant="ghost" size="sm" className="h-7 gap-1.5 text-xs" onClick={addRow}>
        <Plus className="h-3 w-3" /> Add row
      </Button>
    </div>
  );
}

// ─── Auth Panel ───────────────────────────────────────────────────────────────

function AuthPanel({ auth, onChange }: { auth: RequestAuth; onChange: (a: RequestAuth) => void }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <Label className="w-24 shrink-0 text-xs">Auth type</Label>
        <Select
          value={auth.type}
          onValueChange={(v) => onChange({ type: v as AuthType })}
        >
          <SelectTrigger className="h-8 w-48 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No Auth</SelectItem>
            <SelectItem value="bearer">Bearer Token</SelectItem>
            <SelectItem value="basic">Basic Auth</SelectItem>
            <SelectItem value="apikey">API Key</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {auth.type === 'bearer' && (
        <div className="flex items-center gap-3">
          <Label className="w-24 shrink-0 text-xs">Token</Label>
          <Input
            type="password"
            value={auth.bearer ?? ''}
            onChange={(e) => onChange({ ...auth, bearer: e.target.value })}
            placeholder="Bearer token"
            className="h-8 flex-1 font-mono text-xs"
          />
        </div>
      )}

      {auth.type === 'basic' && (
        <>
          <div className="flex items-center gap-3">
            <Label className="w-24 shrink-0 text-xs">Username</Label>
            <Input
              value={auth.username ?? ''}
              onChange={(e) => onChange({ ...auth, username: e.target.value })}
              placeholder="Username"
              className="h-8 flex-1 text-xs"
            />
          </div>
          <div className="flex items-center gap-3">
            <Label className="w-24 shrink-0 text-xs">Password</Label>
            <Input
              type="password"
              value={auth.password ?? ''}
              onChange={(e) => onChange({ ...auth, password: e.target.value })}
              placeholder="Password"
              className="h-8 flex-1 text-xs"
            />
          </div>
        </>
      )}

      {auth.type === 'apikey' && (
        <>
          <div className="flex items-center gap-3">
            <Label className="w-24 shrink-0 text-xs">Key name</Label>
            <Input
              value={auth.apiKeyName ?? ''}
              onChange={(e) => onChange({ ...auth, apiKeyName: e.target.value })}
              placeholder="e.g. X-API-Key"
              className="h-8 flex-1 font-mono text-xs"
            />
          </div>
          <div className="flex items-center gap-3">
            <Label className="w-24 shrink-0 text-xs">Value</Label>
            <Input
              type="password"
              value={auth.apiKeyValue ?? ''}
              onChange={(e) => onChange({ ...auth, apiKeyValue: e.target.value })}
              placeholder="Key value"
              className="h-8 flex-1 font-mono text-xs"
            />
          </div>
          <div className="flex items-center gap-3">
            <Label className="w-24 shrink-0 text-xs">Add to</Label>
            <Select
              value={auth.apiKeyIn ?? 'header'}
              onValueChange={(v) => onChange({ ...auth, apiKeyIn: v as 'header' | 'query' })}
            >
              <SelectTrigger className="h-8 w-48 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="header">Header</SelectItem>
                <SelectItem value="query">Query param</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Body Panel ───────────────────────────────────────────────────────────────

function BodyPanel({ body, onChange }: { body: RequestBody; onChange: (b: RequestBody) => void }) {
  const bodyTypes: BodyType[] = ['none', 'json', 'form', 'raw'];

  // Parse form content (JSON-encoded key-value pairs)
  let formPairs: KeyValuePair[] = [];
  if (body.type === 'form') {
    try {
      formPairs = JSON.parse(body.content || '[]') as KeyValuePair[];
    } catch {
      formPairs = [];
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-1" role="group" aria-label="Body type">
        {bodyTypes.map((t) => (
          <button
            key={t}
            onClick={() => onChange({ type: t, content: t === 'form' ? '[]' : '' })}
            className={cn(
              'rounded px-2.5 py-1 text-xs font-medium transition-colors',
              body.type === t
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground',
            )}
            aria-pressed={body.type === t}
          >
            {t === 'none' ? 'None' : t === 'json' ? 'JSON' : t === 'form' ? 'Form' : 'Raw'}
          </button>
        ))}
      </div>

      {body.type === 'none' && (
        <p className="text-xs text-muted-foreground">No request body.</p>
      )}

      {(body.type === 'json' || body.type === 'raw') && (
        <textarea
          value={body.content}
          onChange={(e) => onChange({ ...body, content: e.target.value })}
          placeholder={body.type === 'json' ? '{\n  "key": "value"\n}' : 'Request body'}
          spellCheck={false}
          className="h-40 w-full resize-y rounded-md border border-border bg-background px-3 py-2 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-ring"
          aria-label={body.type === 'json' ? 'JSON body' : 'Raw body'}
        />
      )}

      {body.type === 'form' && (
        <KeyValueTable
          rows={formPairs}
          onChange={(rows) => onChange({ ...body, content: JSON.stringify(rows) })}
          placeholder="Field name"
          valuePlaceholder="Value"
        />
      )}
    </div>
  );
}

// ─── Response Viewer ─────────────────────────────────────────────────────────

function statusColor(status: number): string {
  if (status < 300) return 'text-emerald-500';
  if (status < 400) return 'text-amber-500';
  return 'text-red-500';
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function tryFormatJson(text: string): string {
  try {
    return JSON.stringify(JSON.parse(text), null, 2);
  } catch {
    return text;
  }
}

function ResponseViewer({ response }: { response: ApiResponseData | null }) {
  const [tab, setTab] = useState<'body' | 'headers'>('body');

  if (!response) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        Send a request to see the response
      </div>
    );
  }

  const formattedBody = tryFormatJson(response.body);

  return (
    <div className="flex h-full flex-col">
      {/* Status bar */}
      <div className="flex items-center gap-4 border-b border-border px-4 py-2 text-xs">
        <span className={cn('font-bold', statusColor(response.status))}>
          {response.status} {response.statusText}
        </span>
        <span className="flex items-center gap-1 text-muted-foreground">
          <Clock className="h-3 w-3" />
          {response.duration}ms
        </span>
        <span className="flex items-center gap-1 text-muted-foreground">
          <HardDrive className="h-3 w-3" />
          {formatSize(response.size)}
        </span>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border px-4 pt-2" role="tablist">
        {(['body', 'headers'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'border-b-2 pb-2 text-xs font-medium capitalize transition-colors',
              tab === t
                ? 'border-primary text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground',
            )}
            aria-selected={tab === t}
            role="tab"
          >
            {t}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto p-4">
        {tab === 'body' ? (
          <pre className="whitespace-pre-wrap break-all font-mono text-xs leading-relaxed">
            {formattedBody}
          </pre>
        ) : (
          <div className="space-y-1">
            {Object.entries(response.headers).map(([k, v]) => (
              <div key={k} className="flex gap-3 text-xs">
                <span className="w-48 shrink-0 font-mono text-muted-foreground">{k}</span>
                <span className="min-w-0 break-all font-mono">{v}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Collections Sidebar ─────────────────────────────────────────────────────

function CollectionItem({
  collection,
  onLoadRequest,
  onDelete,
}: {
  collection: ApiCollection;
  onLoadRequest: (req: ApiRequest) => void;
  onDelete: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const deleteRequest = useDeleteRequest();

  return (
    <div>
      <div className="flex items-center gap-1 rounded-md px-1 py-0.5 hover:bg-accent/50">
        <button
          onClick={() => setExpanded((p) => !p)}
          className="flex flex-1 items-center gap-1.5 text-left text-xs font-medium"
          aria-expanded={expanded}
        >
          {expanded ? (
            <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          )}
          <FolderOpen className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <span className="truncate">{collection.name}</span>
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" aria-label="Collection options">
              <MoreHorizontal className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => onDelete(collection._id)}
            >
              <Trash2 className="mr-2 h-3.5 w-3.5" />
              Delete collection
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {expanded && (
        <div className="ml-4 mt-0.5 space-y-px">
          {collection.requests.length === 0 ? (
            <p className="px-2 py-1 text-[11px] text-muted-foreground">No requests yet</p>
          ) : (
            collection.requests.map((req) => (
              <div
                key={req._id}
                className="group flex items-center gap-1.5 rounded-md px-2 py-0.5 hover:bg-accent/50"
              >
                <button
                  className="flex flex-1 items-center gap-1.5 text-left text-xs"
                  onClick={() => onLoadRequest(req)}
                >
                  <span className={cn('w-10 shrink-0 font-mono text-[10px] font-bold', METHOD_COLORS[req.method as HttpMethod])}>
                    {req.method}
                  </span>
                  <span className="truncate text-muted-foreground">{req.name}</span>
                </button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 shrink-0 opacity-0 group-hover:opacity-100"
                  onClick={() =>
                    deleteRequest.mutate({ collectionId: collection._id, requestId: req._id })
                  }
                  aria-label={`Delete request ${req.name}`}
                >
                  <Trash2 className="h-3 w-3 text-destructive" />
                </Button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ─── History Item ─────────────────────────────────────────────────────────────

function HistoryItem({
  entry,
  onReplay,
}: {
  entry: ApiHistoryEntry;
  onReplay: (entry: ApiHistoryEntry) => void;
}) {
  return (
    <button
      className="w-full rounded-md px-2 py-1.5 text-left hover:bg-accent/50"
      onClick={() => onReplay(entry)}
      title="Click to replay this request"
    >
      <div className="flex items-center gap-2">
        <span className={cn('w-12 shrink-0 font-mono text-[10px] font-bold', METHOD_COLORS[entry.method as HttpMethod])}>
          {entry.method}
        </span>
        {entry.response && (
          <span className={cn('shrink-0 text-[10px] font-medium', statusColor(entry.response.status))}>
            {entry.response.status}
          </span>
        )}
      </div>
      <p className="mt-0.5 truncate font-mono text-[11px] text-muted-foreground">{entry.url}</p>
      <p className="mt-0.5 text-[10px] text-muted-foreground/70">
        {format(new Date(entry.executedAt), 'HH:mm:ss')}
      </p>
    </button>
  );
}

// ─── Environment Manager Dialog ───────────────────────────────────────────────

function EnvManagerDialog({
  open,
  onOpenChange,
  environments,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  environments: ApiEnvironment[];
}) {
  const createEnv = useCreateEnvironment();
  const updateEnv = useUpdateEnvironment();
  const deleteEnv = useDeleteEnvironment();
  const activateEnv = useActivateEnvironment();

  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const nameId = useId();

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    createEnv.mutate(
      { name: newName.trim(), variables: [] },
      { onSuccess: () => setNewName('') },
    );
  };

  const editing = editingId ? environments.find((e) => e._id === editingId) : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Manage Environments</DialogTitle>
        </DialogHeader>

        {editing ? (
          <EnvironmentEditor
            env={editing}
            onSave={(vars) => {
              updateEnv.mutate(
                { envId: editing._id, input: { variables: vars } },
                { onSuccess: () => setEditingId(null) },
              );
            }}
            onBack={() => setEditingId(null)}
          />
        ) : (
          <div className="space-y-3">
            {environments.length === 0 ? (
              <p className="text-sm text-muted-foreground">No environments yet.</p>
            ) : (
              <div className="space-y-1">
                {environments.map((env) => (
                  <div
                    key={env._id}
                    className="flex items-center gap-2 rounded-md border border-border p-2"
                  >
                    <div className="flex-1 text-sm">
                      <span className="font-medium">{env.name}</span>
                      <span className="ml-2 text-xs text-muted-foreground">
                        {env.variables.length} variable{env.variables.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    {env.isActive && (
                      <Badge variant="secondary" className="text-[10px]">Active</Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => setEditingId(env._id)}
                    >
                      Edit
                    </Button>
                    {!env.isActive && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => activateEnv.mutate(env._id)}
                      >
                        Activate
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={() => deleteEnv.mutate(env._id)}
                      aria-label={`Delete environment ${env.name}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <Separator />

            <form onSubmit={handleCreate} className="flex gap-2">
              <Label htmlFor={nameId} className="sr-only">New environment name</Label>
              <Input
                id={nameId}
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="New environment name"
                className="h-8 text-sm"
              />
              <Button type="submit" size="sm" disabled={!newName.trim() || createEnv.isPending}>
                Add
              </Button>
            </form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function EnvironmentEditor({
  env,
  onSave,
  onBack,
}: {
  env: ApiEnvironment;
  onSave: (vars: Array<{ key: string; value: string; enabled: boolean }>) => void;
  onBack: () => void;
}) {
  const [vars, setVars] = useState(env.variables);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onBack} className="h-7 text-xs">
          ← Back
        </Button>
        <span className="text-sm font-medium">{env.name}</span>
      </div>

      <KeyValueTable
        rows={vars}
        onChange={setVars}
        placeholder="Variable name"
        valuePlaceholder="Value"
      />

      <DialogFooter>
        <Button variant="outline" size="sm" onClick={onBack}>Cancel</Button>
        <Button size="sm" onClick={() => onSave(vars)}>Save variables</Button>
      </DialogFooter>
    </div>
  );
}

// ─── Save to Collection Dialog ────────────────────────────────────────────────

function SaveRequestDialog({
  open,
  onOpenChange,
  request,
  collections,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  request: RequestState;
  collections: ApiCollection[];
}) {
  const createCollection = useCreateCollection();
  const addRequest = useAddRequest();
  const [reqName, setReqName] = useState('');
  const [collectionId, setCollectionId] = useState('');
  const [newColName, setNewColName] = useState('');
  const [mode, setMode] = useState<'existing' | 'new'>('existing');
  const reqNameId = useId();
  const colNameId = useId();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqName.trim()) return;

    let targetCollectionId = collectionId;

    if (mode === 'new' && newColName.trim()) {
      const col = await createCollection.mutateAsync({ name: newColName.trim(), description: '' });
      targetCollectionId = col._id;
    }

    if (!targetCollectionId) return;

    addRequest.mutate(
      {
        collectionId: targetCollectionId,
        input: { ...request, name: reqName.trim(), order: 0 },
      },
      {
        onSuccess: () => {
          onOpenChange(false);
          setReqName('');
          setNewColName('');
          setCollectionId('');
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save Request</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor={reqNameId} className="text-xs">Request name</Label>
            <Input
              id={reqNameId}
              value={reqName}
              onChange={(e) => setReqName(e.target.value)}
              placeholder="e.g. Get users"
              className="h-8 text-sm"
              autoFocus
            />
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setMode('existing')}
              className={cn(
                'rounded-md px-3 py-1 text-xs font-medium',
                mode === 'existing'
                  ? 'bg-primary text-primary-foreground'
                  : 'border border-border text-muted-foreground hover:bg-accent',
              )}
            >
              Existing collection
            </button>
            <button
              type="button"
              onClick={() => setMode('new')}
              className={cn(
                'rounded-md px-3 py-1 text-xs font-medium',
                mode === 'new'
                  ? 'bg-primary text-primary-foreground'
                  : 'border border-border text-muted-foreground hover:bg-accent',
              )}
            >
              New collection
            </button>
          </div>

          {mode === 'existing' ? (
            <div className="space-y-1.5">
              <Label className="text-xs">Collection</Label>
              <Select value={collectionId} onValueChange={setCollectionId}>
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue placeholder="Select a collection" />
                </SelectTrigger>
                <SelectContent>
                  {collections.map((c) => (
                    <SelectItem key={c._id} value={c._id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="space-y-1.5">
              <Label htmlFor={colNameId} className="text-xs">Collection name</Label>
              <Input
                id={colNameId}
                value={newColName}
                onChange={(e) => setNewColName(e.target.value)}
                placeholder="My Collection"
                className="h-8 text-sm"
              />
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={
                !reqName.trim() ||
                (mode === 'existing' && !collectionId) ||
                (mode === 'new' && !newColName.trim()) ||
                addRequest.isPending
              }
            >
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function ApiTesterPage() {
  const [request, setRequest] = useState<RequestState>(DEFAULT_REQUEST);
  const [response, setResponse] = useState<ApiResponseData | null>(null);
  const [sidebarTab, setSidebarTab] = useState<'collections' | 'history'>('collections');
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [envDialogOpen, setEnvDialogOpen] = useState(false);

  const { data: collections = [], isLoading: collectionsLoading } = useCollections();
  const { data: environments = [] } = useEnvironments();
  const { data: history = [] } = useApiHistory();
  const clearHistory = useClearHistory();
  const deleteCollection = useDeleteCollection();
  const executeProxy = useExecuteProxy();

  const activeEnv = environments.find((e) => e.isActive) ?? null;

  const envVars = activeEnv?.variables.filter((v) => v.enabled) ?? [];

  const updateRequest = useCallback(
    <K extends keyof RequestState>(field: K, value: RequestState[K]) => {
      setRequest((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  const loadFromHistory = (entry: ApiHistoryEntry) => {
    setRequest({
      method: entry.method as HttpMethod,
      url: entry.url,
      params: entry.request.params,
      headers: entry.request.headers,
      body: entry.request.body as RequestBody,
      auth: entry.request.auth as RequestAuth,
    });
    setResponse(null);
  };

  const loadFromSaved = (req: ApiRequest) => {
    setRequest({
      method: req.method as HttpMethod,
      url: req.url,
      params: req.params,
      headers: req.headers,
      body: req.body,
      auth: req.auth,
    });
    setResponse(null);
  };

  const handleSend = () => {
    const resolved = applyVarsToRequest(request, envVars);
    executeProxy.mutate(resolved, {
      onSuccess: (data) => setResponse(data),
    });
  };

  const isSending = executeProxy.isPending;
  const sendError = executeProxy.isError
    ? (executeProxy.error as Error)?.message ?? 'Request failed'
    : null;

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">API Tester</h1>
        <Button variant="outline" size="sm" onClick={() => setEnvDialogOpen(true)}>
          <span className="mr-1.5 text-muted-foreground text-xs">Env:</span>
          {activeEnv ? activeEnv.name : 'None'}
          <ChevronDown className="ml-1.5 h-3.5 w-3.5" />
        </Button>
      </div>

      <div className="mt-4 flex min-h-0 flex-1 gap-4">
        {/* ── Sidebar ── */}
        <aside className="flex w-64 shrink-0 flex-col overflow-hidden rounded-lg border border-border">
          <div className="flex border-b border-border" role="tablist">
            <button
              className={cn(
                'flex-1 px-3 py-2 text-xs font-medium transition-colors',
                sidebarTab === 'collections'
                  ? 'border-b-2 border-primary text-foreground'
                  : 'text-muted-foreground hover:text-foreground',
              )}
              onClick={() => setSidebarTab('collections')}
              aria-selected={sidebarTab === 'collections'}
              role="tab"
            >
              Collections
            </button>
            <button
              className={cn(
                'flex-1 px-3 py-2 text-xs font-medium transition-colors',
                sidebarTab === 'history'
                  ? 'border-b-2 border-primary text-foreground'
                  : 'text-muted-foreground hover:text-foreground',
              )}
              onClick={() => setSidebarTab('history')}
              aria-selected={sidebarTab === 'history'}
              role="tab"
            >
              History
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {sidebarTab === 'collections' && (
              <div className="space-y-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-full gap-1.5 text-xs justify-start"
                  onClick={() => setSaveDialogOpen(true)}
                >
                  <Plus className="h-3.5 w-3.5" /> New collection
                </Button>
                <Separator />
                {collectionsLoading ? (
                  <div className="space-y-2 pt-2">
                    {[1, 2].map((i) => (
                      <div key={i} className="h-6 animate-pulse rounded bg-muted" />
                    ))}
                  </div>
                ) : collections.length === 0 ? (
                  <div className="pt-4 text-center">
                    <FolderOpen className="mx-auto h-8 w-8 text-muted-foreground/40" />
                    <p className="mt-2 text-xs text-muted-foreground">No collections yet</p>
                  </div>
                ) : (
                  collections.map((col) => (
                    <CollectionItem
                      key={col._id}
                      collection={col}
                      onLoadRequest={loadFromSaved}
                      onDelete={(id) => deleteCollection.mutate(id)}
                    />
                  ))
                )}
              </div>
            )}

            {sidebarTab === 'history' && (
              <div className="space-y-1">
                {history.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-full gap-1.5 text-xs justify-start text-muted-foreground"
                    onClick={() => clearHistory.mutate()}
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Clear history
                  </Button>
                )}
                {history.length === 0 ? (
                  <div className="pt-4 text-center">
                    <History className="mx-auto h-8 w-8 text-muted-foreground/40" />
                    <p className="mt-2 text-xs text-muted-foreground">No history yet</p>
                  </div>
                ) : (
                  history.map((entry) => (
                    <HistoryItem
                      key={entry._id}
                      entry={entry}
                      onReplay={loadFromHistory}
                    />
                  ))
                )}
              </div>
            )}
          </div>
        </aside>

        {/* ── Main area ── */}
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          {/* Request builder */}
          <div className="flex-1 overflow-hidden rounded-lg border border-border">
            {/* URL bar */}
            <div className="flex items-center gap-2 border-b border-border p-3">
              <Select
                value={request.method}
                onValueChange={(v) => updateRequest('method', v as HttpMethod)}
              >
                <SelectTrigger
                  className={cn(
                    'h-9 w-28 shrink-0 font-mono text-xs font-bold',
                    METHOD_COLORS[request.method],
                  )}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {HTTP_METHODS.map((m) => (
                    <SelectItem key={m} value={m} className={cn('font-mono font-bold', METHOD_COLORS[m])}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                value={request.url}
                onChange={(e) => updateRequest('url', e.target.value)}
                placeholder="https://api.example.com/endpoint"
                className="h-9 flex-1 font-mono text-sm"
                onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
                aria-label="Request URL"
              />

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => setSaveDialogOpen(true)}
                    variant="outline"
                    size="sm"
                    className="h-9 shrink-0"
                    aria-label="Save request"
                  >
                    Save
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Save to a collection</TooltipContent>
              </Tooltip>

              <Button
                onClick={handleSend}
                disabled={!request.url.trim() || isSending}
                className="h-9 shrink-0 gap-1.5"
                aria-label="Send request"
              >
                <Send className="h-4 w-4" />
                {isSending ? 'Sending…' : 'Send'}
              </Button>
            </div>

            {/* Request tabs */}
            <Tabs defaultValue="params" className="p-3">
              <TabsList className="h-8">
                <TabsTrigger value="params" className="h-7 text-xs">
                  Params
                  {request.params.filter((p) => p.key && p.enabled).length > 0 && (
                    <Badge variant="secondary" className="ml-1.5 h-4 px-1 text-[9px]">
                      {request.params.filter((p) => p.key && p.enabled).length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="headers" className="h-7 text-xs">
                  Headers
                  {request.headers.filter((h) => h.key && h.enabled).length > 0 && (
                    <Badge variant="secondary" className="ml-1.5 h-4 px-1 text-[9px]">
                      {request.headers.filter((h) => h.key && h.enabled).length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="body" className="h-7 text-xs">
                  Body
                  {request.body.type !== 'none' && (
                    <Badge variant="secondary" className="ml-1.5 h-4 px-1 text-[9px]">
                      {request.body.type}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="auth" className="h-7 text-xs">
                  Auth
                  {request.auth.type !== 'none' && (
                    <Badge variant="secondary" className="ml-1.5 h-4 px-1 text-[9px]">
                      {request.auth.type}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="params" className="mt-3">
                <KeyValueTable
                  rows={request.params}
                  onChange={(rows) => updateRequest('params', rows)}
                  placeholder="Parameter key"
                  valuePlaceholder="Value"
                />
              </TabsContent>

              <TabsContent value="headers" className="mt-3">
                <KeyValueTable
                  rows={request.headers}
                  onChange={(rows) => updateRequest('headers', rows)}
                  placeholder="Header name"
                  valuePlaceholder="Value"
                />
              </TabsContent>

              <TabsContent value="body" className="mt-3">
                <BodyPanel
                  body={request.body}
                  onChange={(b) => updateRequest('body', b)}
                />
              </TabsContent>

              <TabsContent value="auth" className="mt-3">
                <AuthPanel
                  auth={request.auth}
                  onChange={(a) => updateRequest('auth', a)}
                />
              </TabsContent>
            </Tabs>
          </div>

          {/* Response viewer */}
          <div className="flex min-h-64 flex-col overflow-hidden rounded-lg border border-border">
            <div className="flex items-center justify-between border-b border-border px-4 py-2">
              <span className="text-xs font-medium text-muted-foreground">Response</span>
              {isSending && (
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-muted border-t-primary" />
                  Sending…
                </span>
              )}
              {response && !isSending && (
                <span className="flex items-center gap-1 text-xs text-emerald-500">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Done
                </span>
              )}
            </div>

            {sendError && (
              <div className="flex items-center gap-2 border-b border-destructive/30 bg-destructive/10 px-4 py-2 text-xs text-destructive" role="alert">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                {sendError}
              </div>
            )}

            <div className="min-h-0 flex-1 overflow-hidden">
              <ResponseViewer response={response} />
            </div>
          </div>
        </div>
      </div>

      <SaveRequestDialog
        open={saveDialogOpen}
        onOpenChange={setSaveDialogOpen}
        request={request}
        collections={collections}
      />

      <EnvManagerDialog
        open={envDialogOpen}
        onOpenChange={setEnvDialogOpen}
        environments={environments}
      />
    </div>
  );
}
