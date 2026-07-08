export const GOOGLE_APP_ID = process.env.NEXT_PUBLIC_APP_ID || 'likkle-legends';

export const googlePaths = {
  app: (appId = GOOGLE_APP_ID) => `apps/${appId}`,
  publicConfig: (appId = GOOGLE_APP_ID) => `apps/${appId}/config/public`,
  privateConfig: (appId = GOOGLE_APP_ID) => `apps/${appId}/config/private`,
  user: (uid: string, appId = GOOGLE_APP_ID) => `apps/${appId}/users/${uid}`,
  children: (uid: string, appId = GOOGLE_APP_ID) => `apps/${appId}/users/${uid}/children`,
  child: (uid: string, childId: string, appId = GOOGLE_APP_ID) =>
    `apps/${appId}/users/${uid}/children/${childId}`,
  entitlement: (subjectId: string, appId = GOOGLE_APP_ID) =>
    `apps/${appId}/entitlements/${subjectId}`,
  job: (jobId: string, appId = GOOGLE_APP_ID) => `apps/${appId}/jobs/${jobId}`,
  generatedAsset: (assetId: string, appId = GOOGLE_APP_ID) =>
    `apps/${appId}/generatedAssets/${assetId}`,
  payment: (eventId: string, appId = GOOGLE_APP_ID) =>
    `apps/${appId}/payments/${eventId}`,
  webhook: (provider: string, eventId: string, appId = GOOGLE_APP_ID) =>
    `apps/${appId}/webhooks/${provider}/${eventId}`,
  auditEvent: (eventId: string, appId = GOOGLE_APP_ID) =>
    `apps/${appId}/auditEvents/${eventId}`,
  paperclipEvent: (eventId: string, appId = GOOGLE_APP_ID) =>
    `apps/${appId}/paperclipEvents/${eventId}`,
};
