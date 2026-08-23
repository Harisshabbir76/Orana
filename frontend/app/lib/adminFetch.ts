let _secret: string | null = null;
let _pending: Promise<string | null> | null = null;

async function getSecret(): Promise<string | null> {
  if (_secret) return _secret;
  if (_pending) return _pending;
  _pending = fetch("/api/admin/token")
    .then((r) => (r.ok ? r.json() : null))
    .then((data) => {
      _secret = data?.secret ?? null;
      _pending = null;
      return _secret;
    })
    .catch(() => {
      _pending = null;
      return null;
    });
  return _pending;
}

export async function adminFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const secret = await getSecret();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
    ...(secret ? { "x-admin-secret": secret } : {}),
  };
  return fetch(url, { ...options, headers });
}
