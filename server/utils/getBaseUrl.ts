export function getBaseUrl(): string {
  const base = process.env.BASE_URL?.trim();
  if (base) {
    return base;
  }

  const domains = process.env.REPLIT_DOMAINS;
  if (domains) {
    return `https://${domains.split(',')[0]}`;
  }

  const replitUrl = process.env.REPLIT_URL;
  if (replitUrl) {
    return replitUrl;
  }

  return 'https://5a6f843f-53cb-48cf-8afc-05f223a337ff-00-3gvxznlxvdl8.riker.replit.dev';
}
