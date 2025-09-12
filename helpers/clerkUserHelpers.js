import { clerkClient } from '@clerk/clerk-sdk-node';
import User from '../models/User.js';

export async function findOrCreateAppUserByClerkId(clerkUserId) {
  let appUser = await User.findOne({ clerkId: clerkUserId });
  if (appUser) return appUser;
  const clerkUser = await clerkClient.users.getUser(clerkUserId);
  const email = clerkUser?.emailAddresses?.[0]?.emailAddress;
  if (email) {
    appUser = await User.findOne({ email });
  }
  if (!appUser) {
    appUser = await User.create({ clerkId: clerkUserId, email: email || undefined, name: `${clerkUser?.firstName || ''} ${clerkUser?.lastName || ''}`.trim() });
  } else if (!appUser.clerkId) {
    appUser.clerkId = clerkUserId;
    await appUser.save();
  }
  return appUser;
}