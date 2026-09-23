/**
 * Free-trial API must never leak login credentials in JSON.
 */
const SECRET_KEYS = [
  'magicLink',
  'magic_link',
  'action_link',
  'actionLink',
  'hashed_token',
  'hashedToken',
  'email_otp',
  'emailOtp',
];

export function stripAuthSecrets<T extends Record<string, unknown>>(payload: T): T {
  const next = { ...payload };
  for (const key of SECRET_KEYS) {
    delete next[key];
  }
  return next;
}

export function buildFreeTrialSuccessBody(input: {
  userId: string;
  loginPath?: string;
}) {
  return stripAuthSecrets({
    success: true,
    userId: input.userId,
    next: input.loginPath || '/login?redirect=/portal',
    message: 'Free account created. Log in to open the kids portal.',
    accountType: 'free',
  });
}
