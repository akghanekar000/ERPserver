import { findOrCreateAppUserByClerkId } from '../helpers/clerkUserHelpers.js';

export async function attachAppUser(req, res, next) {
  try {
    if (!req.auth?.userId) return next();
    req.appUser = await findOrCreateAppUserByClerkId(req.auth.userId);
    next();
  } catch (err) {
    next(err);
  }
}