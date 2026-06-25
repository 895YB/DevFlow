import { useState, useRef, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Hash, Plus, Trash2, SendHorizonal, Edit2, X, Check, Users, Loader2, MessageSquare } from 'lucide-react';
import { format, isToday, isYesterday } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useWorkspace } from '@/app/providers/workspace-provider';
import { usePresence } from '@/features/realtime/hooks/use-presence';
import {
  useChannels,
  useCreateChannel,
  useDeleteChannel,
  useEnsureGeneralChannel,
  useMessages,
  useLoadMoreMessages,
  useChatSocket,
  useSendMessage,
  useEditMessage,
  useDeleteMessage,
} from '../hooks/use-chat';
import type { ChatChannel, ChatMessage } from '@devflow/shared';

// ── Helpers ───────────────────────────────────────────────────────────────────

function renderContent(content: string): React.ReactNode {
  const parts = content.split(/(@\w+)/g);
  return parts.map((part, i) =>
    /^@\w+$/.test(part) ? (
      <span key={i} className="font-medium text-primary">{part}</span>
    ) : (
      part
    ),
  );
}

function messageDateLabel(date: Date): string {
  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';
  return format(date, 'MMMM d, yyyy');
}

function shouldShowDivider(prev: ChatMessage | undefined, curr: ChatMessage): boolean {
  if (!prev) return true;
  const prevDate = new Date(prev.createdAt);
  const currDate = new Date(curr.createdAt);
  return prevDate.toDateString() !== currDate.toDateString();
}

function shouldGroupWithPrev(prev: ChatMessage | undefined, curr: ChatMessage): boolean {
  if (!prev) return false;
  if (prev.senderId !== curr.senderId) return false;
  const diff = new Date(curr.createdAt).getTime() - new Date(prev.createdAt).getTime();
  return diff < 5 * 60 * 1000; // group messages within 5 minutes
}

// ── Sub-components ────────────────────────────────────────────────────────────

function OnlineIndicator({ online }: { online: boolean }) {
  return (
    <span
      className={cn(
        'absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-background',
        online ? 'bg-green-500' : 'bg-muted',
      )}
      aria-label={online ? 'Online' : 'Offline'}
    />
  );
}

function MessageItem({
  message,
  grouped,
  onlineUserIds,
  onEdit,
  onDelete,
  currentUserId,
}: {
  message: ChatMessage;
  grouped: boolean;
  onlineUserIds: string[];
  onEdit: (msg: ChatMessage) => void;
  onDelete: (msg: ChatMessage) => void;
  currentUserId?: string;
}) {
  const initials = message.senderName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const isOwn = message.senderId === currentUserId;
  const isOnline = onlineUserIds.includes(message.senderId);

  return (
    <div className={cn('group flex items-start gap-3 px-4 py-1 hover:bg-accent/30', grouped && 'pt-0.5')}>
      {grouped ? (
        <span className="w-8 shrink-0 text-right text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 mt-0.5">
          {format(new Date(message.createdAt), 'HH:mm')}
        </span>
      ) : (
        <div className="relative shrink-0">
          <Avatar className="h-8 w-8">
            <AvatarImage src={message.senderAvatar} alt={message.senderName} />
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
          <OnlineIndicator online={isOnline} />
        </div>
      )}

      <div className="min-w-0 flex-1">
        {!grouped && (
          <div className="mb-0.5 flex items-baseline gap-2">
            <span className="text-sm font-semibold">{message.senderName}</span>
            <span className="text-[10px] text-muted-foreground">
              {format(new Date(message.createdAt), 'HH:mm')}
            </span>
          </div>
        )}
        <p className="break-words text-sm leading-relaxed">
          {renderContent(message.content)}
          {message.editedAt && (
            <span className="ml-1 text-[10px] text-muted-foreground">(edited)</span>
          )}
        </p>
      </div>

      {isOwn && (
        <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => onEdit(message)}
            aria-label="Edit message"
          >
            <Edit2 className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-destructive hover:text-destructive"
            onClick={() => onDelete(message)}
            aria-label="Delete message"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  );
}

function CreateChannelDialog({
  open,
  onClose,
  onSubmit,
  isPending,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (name: string, description: string) => void;
  isPending: boolean;
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const nameId = 'ch-name';
  const descId = 'ch-desc';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit(name.trim().toLowerCase().replace(/\s+/g, '-'), description.trim());
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Channel</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor={nameId}>Name (lowercase, hyphens only)</Label>
            <Input
              id={nameId}
              value={name}
              onChange={(e) => setName(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
              placeholder="e.g. team-updates"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={descId}>Description (optional)</Label>
            <Input
              id={descId}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this channel about?"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={!name || isPending}>
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export function ChatPage() {
  const { activeWorkspaceId } = useWorkspace();
  const { onlineUserIds } = usePresence(activeWorkspaceId);

  const { data: channels = [], isLoading: channelsLoading } = useChannels();
  const createChannel = useCreateChannel();
  const deleteChannel = useDeleteChannel();
  const ensureGeneral = useEnsureGeneralChannel();

  const [activeChannelId, setActiveChannelId] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingMessage, setEditingMessage] = useState<ChatMessage | null>(null);
  const [editContent, setEditContent] = useState('');
  const [inputValue, setInputValue] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: messagePage, isLoading: messagesLoading } = useMessages(activeChannelId);
  const loadMore = useLoadMoreMessages(activeChannelId);
  const messages = messagePage?.messages ?? [];
  const hasMore = messagePage?.hasMore ?? false;

  useChatSocket(activeChannelId);

  const sendMessage = useSendMessage();
  const editMessage = useEditMessage();
  const deleteMessage = useDeleteMessage();

  // Auto-select general channel on load
  useEffect(() => {
    if (!channelsLoading && channels.length === 0 && activeWorkspaceId) {
      ensureGeneral.mutate();
    }
    if (!activeChannelId && channels.length > 0) {
      const general = channels.find((c) => c.isGeneral) ?? channels[0];
      if (general) setActiveChannelId(general._id);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channels, channelsLoading, activeWorkspaceId]);

  // Scroll to bottom when messages load or new message arrives
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleSend = useCallback(() => {
    const content = inputValue.trim();
    if (!content || !activeChannelId) return;
    sendMessage(activeChannelId, content);
    setInputValue('');
  }, [inputValue, activeChannelId, sendMessage]);

  const activeChannel = channels.find((c) => c._id === activeChannelId) ?? null;
  const { user } = useUser();
  const currentUserId = user?.id;

  return (
    <div className="-m-4 flex h-[calc(100vh-4rem)] overflow-hidden lg:-m-6">
      {/* ── Sidebar ── */}
      <aside className="flex w-56 shrink-0 flex-col border-r border-border bg-sidebar">
        <div className="flex items-center justify-between px-4 py-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Channels
          </h2>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setShowCreateDialog(true)}
            aria-label="Create channel"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 pb-4" aria-label="Channels">
          {channelsLoading ? (
            <div className="px-2 py-8 text-center text-xs text-muted-foreground">Loading...</div>
          ) : (
            channels.map((ch) => (
              <div key={ch._id} className="group flex items-center gap-1">
                <button
                  className={cn(
                    'flex flex-1 items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors',
                    activeChannelId === ch._id
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground',
                  )}
                  onClick={() => setActiveChannelId(ch._id)}
                  aria-current={activeChannelId === ch._id ? 'page' : undefined}
                >
                  <Hash className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{ch.name}</span>
                </button>
                {!ch.isGeneral && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100 text-muted-foreground"
                    onClick={() => {
                      deleteChannel.mutate(ch._id, {
                        onSuccess: () => {
                          if (activeChannelId === ch._id) setActiveChannelId(null);
                        },
                        onError: () => toast.error('Could not delete channel'),
                      });
                    }}
                    aria-label={`Delete #${ch.name}`}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            ))
          )}
        </nav>

        <div className="border-t border-border px-4 py-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Users className="h-3.5 w-3.5" />
            <span>{onlineUserIds.length} online</span>
          </div>
        </div>
      </aside>

      {/* ── Message area ── */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Header */}
        <div className="flex h-12 items-center gap-2 border-b border-border px-4">
          {activeChannel ? (
            <>
              <Hash className="h-4 w-4 shrink-0 text-muted-foreground" />
              <h1 className="text-sm font-semibold">{activeChannel.name}</h1>
              {activeChannel.description && (
                <span className="hidden text-xs text-muted-foreground md:block">
                  — {activeChannel.description}
                </span>
              )}
            </>
          ) : (
            <span className="text-sm text-muted-foreground">Select a channel</span>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          {!activeChannelId ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-muted-foreground">
              <MessageSquare className="h-12 w-12 opacity-30" />
              <p className="text-sm">Select a channel to start chatting</p>
            </div>
          ) : messagesLoading ? (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="py-4">
              {hasMore && (
                <div className="mb-2 flex justify-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs"
                    disabled={loadMore.isPending}
                    onClick={() => {
                      const oldestId = messages[0]?._id;
                      if (oldestId) loadMore.mutate(oldestId);
                    }}
                  >
                    {loadMore.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Load older messages'}
                  </Button>
                </div>
              )}

              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
                  <Hash className="mb-3 h-10 w-10 opacity-30" />
                  <p className="text-sm font-medium">#{activeChannel?.name}</p>
                  <p className="text-xs">This is the beginning of this channel. Say hello!</p>
                </div>
              ) : (
                messages.map((msg, i) => {
                  const prev = messages[i - 1];
                  const showDivider = shouldShowDivider(prev, msg);
                  const grouped = !showDivider && shouldGroupWithPrev(prev, msg);

                  return (
                    <div key={msg._id}>
                      {showDivider && (
                        <div className="my-4 flex items-center gap-3 px-4">
                          <div className="flex-1 border-t border-border" />
                          <span className="text-xs text-muted-foreground">
                            {messageDateLabel(new Date(msg.createdAt))}
                          </span>
                          <div className="flex-1 border-t border-border" />
                        </div>
                      )}
                      <MessageItem
                        message={msg}
                        grouped={grouped}
                        onlineUserIds={onlineUserIds}
                        onEdit={(m) => { setEditingMessage(m); setEditContent(m.content); }}
                        onDelete={(m) => { deleteMessage(m._id, m.channelId); }}
                        currentUserId={currentUserId}
                      />
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Edit mode banner */}
        {editingMessage && (
          <div className="flex items-center gap-2 border-t border-warning bg-warning/10 px-4 py-2 text-xs text-warning-foreground">
            <Edit2 className="h-3 w-3" />
            <span>Editing message</span>
            <button
              className="ml-auto rounded p-0.5 hover:bg-warning/20"
              onClick={() => setEditingMessage(null)}
              aria-label="Cancel edit"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )}

        {/* Input */}
        <div className="border-t border-border p-4">
          <div className="flex items-center gap-2">
            <Input
              ref={inputRef}
              value={editingMessage ? editContent : inputValue}
              onChange={(e) =>
                editingMessage ? setEditContent(e.target.value) : setInputValue(e.target.value)
              }
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  if (editingMessage) {
                    editMessage(editingMessage._id, editingMessage.channelId, editContent.trim());
                    setEditingMessage(null);
                  } else {
                    handleSend();
                  }
                }
                if (e.key === 'Escape' && editingMessage) {
                  setEditingMessage(null);
                }
              }}
              placeholder={activeChannel ? `Message #${activeChannel.name}` : 'Select a channel'}
              disabled={!activeChannelId}
              aria-label="Message input"
              className="flex-1"
            />
            <Button
              size="icon"
              disabled={!activeChannelId || (!editingMessage && !inputValue.trim()) || (!!editingMessage && !editContent.trim())}
              onClick={() => {
                if (editingMessage) {
                  editMessage(editingMessage._id, editingMessage.channelId, editContent.trim());
                  setEditingMessage(null);
                } else {
                  handleSend();
                }
              }}
              aria-label="Send message"
            >
              {editingMessage ? <Check className="h-4 w-4" /> : <SendHorizonal className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>

      <CreateChannelDialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onSubmit={(name, description) => {
          createChannel.mutate(
            { name, description },
            {
              onSuccess: (res) => {
                setShowCreateDialog(false);
                const ch = res.data.data as ChatChannel;
                setActiveChannelId(ch._id);
              },
              onError: () => toast.error('Could not create channel'),
            },
          );
        }}
        isPending={createChannel.isPending}
      />
    </div>
  );
}
