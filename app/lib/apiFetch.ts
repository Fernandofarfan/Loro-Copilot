// Wrapper de fetch para llamadas a /api/*: agrega el token compartido opcional.
// Si LORO_SHARED_TOKEN (server) está definido, las rutas LLM exigen este header; el valor
// vive en NEXT_PUBLIC_LORO_SHARED_TOKEN para que el cliente pueda enviarlo. Es un freno
// para scanners y curl a secas, no un secreto criptográfico (viaja en el bundle).
// Si las dos env vars no están definidas, todo sigue funcionando igual que antes.
export const SHARED_TOKEN_HEADER = "x-loro-token";

export function apiFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const token = process.env.NEXT_PUBLIC_LORO_SHARED_TOKEN;
  if (!token) return fetch(input, init);
  const headers = new Headers(init?.headers);
  headers.set(SHARED_TOKEN_HEADER, token);
  return fetch(input, { ...init, headers });
}
