import mongoose from 'mongoose';
import { ChatChannel, type IChatChannel } from './chat-channel.model.js';
import { ChatMessage, type IChatMessage } from './chat-message.model.js';
import { AppError } from '../../utils/app-error.js';
import type { CreateChannelInput } from '@devflow/shared';

const MSG_LIMIT = 50;

// ── Channels ──────────────────────────────────────────────────────────────────

export async function listChannels(workspaceId: string): Promise<IChatChannel[]> {
  return ChatChannel.find({ workspaceId }).sort({ isGeneral: -1, name: 1 });
}

export async function getChannelById(workspaceId: string, channelId: string): Promise<IChatChannel> {
  const ch = await ChatChannel.findOne({ _id: channelId, workspaceId });
  if (!ch) throw AppError.notFound('Channel not found');
  return ch;
}

export async function createChannel(
  workspaceId: string,
  createdBy: string,
  input: CreateChannelInput,
): Promise<IChatChannel> {
  const existing = await ChatChannel.findOne({ workspaceId, name: input.name });
  if (existing) throw AppError.conflict(`Channel #${input.name} already exists`);
  return ChatChannel.create({ workspaceId, createdBy, name: input.name, description: input.description });
}

export async function ensureGeneralChannel(
  workspaceId: string,
  createdBy: string,
): Promise<IChatChannel> {
  const existing = await ChatChannel.findOne({ workspaceId, isGeneral: true });
  if (existing) return existing;
  return ChatChannel.create({
    workspaceId,
    name: 'general',
    description: 'General discussion',
    isGeneral: true,
    createdBy,
  });
}

export async function deleteChannel(workspaceId: string, channelId: string): Promise<void> {
  const ch = await ChatChannel.findOne({ _id: channelId, workspaceId });
  if (!ch) throw AppError.notFound('Channel not found');
  if (ch.isGeneral) throw AppError.forbidden('Cannot delete the general channel');
  await Promise.all([
    ChatChannel.findByIdAndDelete(channelId),
    ChatMessage.deleteMany({ channelId }),
  ]);
}

// ── Messages ──────────────────────────────────────────────────────────────────

export async function listMessages(
  workspaceId: string,
  channelId: string,
  params: { cursor?: string; limit?: number },
): Promise<{ messages: IChatMessage[]; hasMore: boolean }> {
  const limit = Math.min(params.limit ?? MSG_LIMIT, MSG_LIMIT);
  const filter: Record<string, unknown> = { channelId, workspaceId, deletedAt: null };
  if (params.cursor) {
    filter['_id'] = { $lt: new mongoose.Types.ObjectId(params.cursor) };
  }

  const rows = await ChatMessage.find(filter).sort({ _id: -1 }).limit(limit + 1);
  const hasMore = rows.length > limit;
  // Reverse to chronological order for the client
  return { messages: (hasMore ? rows.slice(0, limit) : rows).reverse(), hasMore };
}

export async function createMessage(input: {
  channelId: string;
  workspaceId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
}): Promise<IChatMessage> {
  // Validate channel belongs to workspace (security check)
  const ch = await ChatChannel.findOne({ _id: input.channelId, workspaceId: input.workspaceId });
  if (!ch) throw AppError.notFound('Channel not found');
  return ChatMessage.create(input);
}

export async function editMessage(
  workspaceId: string,
  messageId: string,
  senderId: string,
  content: string,
): Promise<IChatMessage> {
  const msg = await ChatMessage.findOneAndUpdate(
    { _id: messageId, workspaceId, senderId, deletedAt: null },
    { $set: { content, editedAt: new Date() } },
    { new: true },
  );
  if (!msg) throw AppError.notFound('Message not found or you are not the author');
  return msg;
}

export async function deleteMessage(
  workspaceId: string,
  messageId: string,
  senderId: string,
): Promise<void> {
  const msg = await ChatMessage.findOneAndUpdate(
    { _id: messageId, workspaceId, senderId, deletedAt: null },
    { $set: { deletedAt: new Date(), content: '[Message deleted]' } },
  );
  if (!msg) throw AppError.notFound('Message not found or you are not the author');
}
