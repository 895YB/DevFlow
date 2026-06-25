import type { Request, Response } from 'express';
import { Webhook } from 'svix';
import { env } from '../../config/env.js';
import { logger } from '../../utils/logger.js';
import * as userService from '../users/user.service.js';

interface ClerkUserEvent {
  data: {
    id: string;
    email_addresses: Array<{
      email_address: string;
      id: string;
    }>;
    first_name: string | null;
    last_name: string | null;
    image_url: string;
    primary_email_address_id: string;
  };
  type: string;
}

export async function handleClerkWebhook(
  req: Request,
  res: Response,
): Promise<void> {
  if (!env.CLERK_WEBHOOK_SECRET) {
    logger.warn('Clerk webhook secret not configured, skipping verification');
    res.status(200).json({ received: true });
    return;
  }

  const svixId = req.headers['svix-id'] as string;
  const svixTimestamp = req.headers['svix-timestamp'] as string;
  const svixSignature = req.headers['svix-signature'] as string;

  if (!svixId || !svixTimestamp || !svixSignature) {
    res.status(400).json({ error: 'Missing svix headers' });
    return;
  }

  const wh = new Webhook(env.CLERK_WEBHOOK_SECRET);
  let event: ClerkUserEvent;

  try {
    event = wh.verify(JSON.stringify(req.body), {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as ClerkUserEvent;
  } catch (err) {
    logger.error('Clerk webhook verification failed', { error: err });
    res.status(400).json({ error: 'Webhook verification failed' });
    return;
  }

  const { type, data } = event;

  try {
    switch (type) {
      case 'user.created': {
        const primaryEmail = data.email_addresses.find(
          (e) => e.id === data.primary_email_address_id,
        );

        await userService.createUser({
          clerkId: data.id,
          email: primaryEmail?.email_address ?? data.email_addresses[0]!.email_address,
          firstName: data.first_name ?? undefined,
          lastName: data.last_name ?? undefined,
          avatar: data.image_url,
        });

        logger.info('User created from Clerk webhook', { clerkId: data.id });
        break;
      }

      case 'user.updated': {
        const primaryEmail = data.email_addresses.find(
          (e) => e.id === data.primary_email_address_id,
        );

        await userService.updateUserByClerkId(data.id, {
          email: primaryEmail?.email_address ?? data.email_addresses[0]!.email_address,
          firstName: data.first_name ?? undefined,
          lastName: data.last_name ?? undefined,
          avatar: data.image_url,
        });

        logger.info('User updated from Clerk webhook', { clerkId: data.id });
        break;
      }

      case 'user.deleted': {
        await userService.softDeleteUserByClerkId(data.id);
        logger.info('User deleted from Clerk webhook', { clerkId: data.id });
        break;
      }

      default:
        logger.debug('Unhandled Clerk webhook event', { type });
    }
  } catch (err) {
    logger.error('Error processing Clerk webhook', { type, error: err });
    res.status(500).json({ error: 'Webhook processing failed' });
    return;
  }

  res.status(200).json({ received: true });
}
