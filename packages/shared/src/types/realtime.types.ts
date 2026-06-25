export type NotificationType =
  | 'task_assigned'
  | 'task_comment'
  | 'mention'
  | 'chat_message'
  | 'project_update'
  | 'system';

export type ActivityType =
  | 'task_created'
  | 'task_updated'
  | 'task_completed'
  | 'document_created'
  | 'document_updated'
  | 'chat_message_sent'
  | 'project_created'
  | 'member_joined'
  | 'channel_created';

export type ActivityResourceType = 'task' | 'document' | 'project' | 'chat' | 'workspace';

export interface Notification {
  _id: string;
  userId: string;
  workspaceId: string | null;
  type: NotificationType;
  title: string;
  message: string;
  link: string;
  read: boolean;
  createdAt: string;
}

export interface ChatChannel {
  _id: string;
  workspaceId: string;
  name: string;
  description: string;
  isGeneral: boolean;
  createdBy: string;
  createdAt: string;
}

export interface ChatMessage {
  _id: string;
  channelId: string;
  workspaceId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  editedAt: string | null;
  deletedAt: string | null;
  createdAt: string;
}

export interface ActivityEvent {
  _id: string;
  workspaceId: string;
  actorId: string;
  actorName: string;
  actorAvatar: string;
  type: ActivityType;
  resourceType: ActivityResourceType;
  resourceId: string;
  resourceTitle: string;
  createdAt: string;
}

export interface PresenceData {
  workspaceId: string;
  onlineUserIds: string[];
}

export interface ServerToClientEvents {
  'notification:new': (notification: Notification) => void;
  'presence:update': (data: PresenceData) => void;
  'chat:message': (message: ChatMessage) => void;
  'chat:message:edited': (data: { messageId: string; content: string; editedAt: string }) => void;
  'chat:message:deleted': (data: { messageId: string; channelId: string }) => void;
  'activity:new': (activity: ActivityEvent) => void;
}

export interface ClientToServerEvents {
  'workspace:join': (workspaceId: string) => void;
  'workspace:leave': (workspaceId: string) => void;
  'channel:join': (channelId: string) => void;
  'channel:leave': (channelId: string) => void;
  'chat:send': (data: { channelId: string; content: string }) => void;
  'chat:edit': (data: { messageId: string; channelId: string; content: string }) => void;
  'chat:delete': (data: { messageId: string; channelId: string }) => void;
}
