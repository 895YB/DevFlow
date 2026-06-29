import { User, type IUser } from './user.model.js';
import { AppError } from '../../utils/app-error.js';

export async function findUserByClerkId(clerkId: string): Promise<IUser | null> {
  return User.findOne({ clerkId, deletedAt: null });
}

export async function findUserById(id: string): Promise<IUser | null> {
  return User.findOne({ _id: id, deletedAt: null });
}

export async function upsertUser(data: {
  clerkId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
}): Promise<IUser> {
  const displayName = [data.firstName, data.lastName].filter(Boolean).join(' ') || data.email.split('@')[0]!;
  const user = await User.findOneAndUpdate(
    { clerkId: data.clerkId },
    {
      $setOnInsert: { clerkId: data.clerkId },
      $set: {
        email: data.email,
        firstName: data.firstName ?? '',
        lastName: data.lastName ?? '',
        displayName,
        avatar: data.avatar ?? '',
      },
    },
    { upsert: true, new: true },
  );
  return user!;
}

export async function createUser(data: {
  clerkId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
}): Promise<IUser> {
  const displayName = [data.firstName, data.lastName].filter(Boolean).join(' ') || data.email.split('@')[0]!;

  return User.create({
    clerkId: data.clerkId,
    email: data.email,
    firstName: data.firstName ?? '',
    lastName: data.lastName ?? '',
    displayName,
    avatar: data.avatar ?? '',
  });
}

export async function updateUserByClerkId(
  clerkId: string,
  data: Partial<Pick<IUser, 'email' | 'firstName' | 'lastName' | 'avatar'>>,
): Promise<IUser | null> {
  const update: Record<string, unknown> = {};
  if (data.email !== undefined) update['email'] = data.email;
  if (data.firstName !== undefined) update['firstName'] = data.firstName;
  if (data.lastName !== undefined) update['lastName'] = data.lastName;
  if (data.avatar !== undefined) update['avatar'] = data.avatar;

  if (data.firstName !== undefined || data.lastName !== undefined) {
    const user = await User.findOne({ clerkId });
    if (user) {
      const first = data.firstName ?? user.firstName;
      const last = data.lastName ?? user.lastName;
      update['displayName'] = [first, last].filter(Boolean).join(' ') || user.email.split('@')[0]!;
    }
  }

  return User.findOneAndUpdate({ clerkId }, { $set: update }, { new: true });
}

export async function softDeleteUserByClerkId(clerkId: string): Promise<void> {
  await User.findOneAndUpdate({ clerkId }, { $set: { deletedAt: new Date() } });
}

export async function updateAvatar(userId: string, avatarUrl: string): Promise<IUser> {
  const user = await User.findOneAndUpdate(
    { _id: userId, deletedAt: null },
    { $set: { avatar: avatarUrl } },
    { new: true },
  );
  if (!user) throw AppError.notFound('User not found');
  return user;
}

export async function removeAvatar(userId: string): Promise<IUser> {
  const user = await User.findOneAndUpdate(
    { _id: userId, deletedAt: null },
    { $set: { avatar: '' } },
    { new: true },
  );
  if (!user) throw AppError.notFound('User not found');
  return user;
}

export async function deleteAccount(clerkId: string): Promise<void> {
  await User.findOneAndUpdate({ clerkId }, { $set: { deletedAt: new Date() } });
}

export async function updateProfile(
  userId: string,
  data: {
    displayName?: string;
    bio?: string;
    profile?: {
      skills?: string[];
      githubUsername?: string;
      leetcodeUsername?: string;
      portfolioUrl?: string;
      location?: string;
      website?: string;
      linkedinUrl?: string;
      timezone?: string;
      preferredLanguage?: string;
    };
  },
): Promise<IUser> {
  const update: Record<string, unknown> = {};

  if (data.displayName !== undefined) update['displayName'] = data.displayName;
  if (data.bio !== undefined) update['bio'] = data.bio;

  if (data.profile) {
    for (const [key, value] of Object.entries(data.profile)) {
      if (value !== undefined) {
        update[`profile.${key}`] = value;
      }
    }
  }

  const user = await User.findOneAndUpdate(
    { _id: userId, deletedAt: null },
    { $set: update },
    { new: true },
  );

  if (!user) throw AppError.notFound('User not found');
  return user;
}

export async function updatePreferences(
  userId: string,
  data: {
    theme?: string;
    notifications?: Record<string, boolean>;
  },
): Promise<IUser> {
  const update: Record<string, unknown> = {};

  if (data.theme !== undefined) update['preferences.theme'] = data.theme;

  if (data.notifications) {
    for (const [key, value] of Object.entries(data.notifications)) {
      update[`preferences.notifications.${key}`] = value;
    }
  }

  const user = await User.findOneAndUpdate(
    { _id: userId, deletedAt: null },
    { $set: update },
    { new: true },
  );

  if (!user) throw AppError.notFound('User not found');
  return user;
}

export async function markOnboardingComplete(userId: string): Promise<IUser> {
  const user = await User.findOneAndUpdate(
    { _id: userId, deletedAt: null },
    { $set: { onboardingCompleted: true } },
    { new: true },
  );

  if (!user) throw AppError.notFound('User not found');
  return user;
}
