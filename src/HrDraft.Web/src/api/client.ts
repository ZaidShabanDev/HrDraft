/**
 * The one place the app talks to the network.
 *
 * Everything the API returns on failure is RFC 7807 ProblemDetails, which ASP.NET
 * produces for both thrown exceptions and model validation. Unpacking it here means
 * no screen has to know that shape — they catch an `ApiError` and read `.message`.
 */

export interface ProblemDetails {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  /** Model validation: field name → messages. */
  errors?: Record<string, string[]>;
}

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly problem?: ProblemDetails,
  ) {
    super(message);
    this.name = 'ApiError';
  }

  /** Status 0 — the request never reached a server, so nothing was attempted. */
  get isNetworkFailure(): boolean {
    return this.status === 0;
  }

  get isUnauthorized(): boolean {
    return this.status === 401;
  }
}

type UnauthorizedHandler = () => void;

let unauthorizedHandler: UnauthorizedHandler | null = null;

/**
 * Called when any request outside `/auth/` comes back 401 — the session expired or
 * the account was deactivated mid-session. `AuthProvider` registers this so one
 * stale request drops the whole app back to the login screen, instead of every
 * screen having to handle it.
 */
export function setUnauthorizedHandler(handler: UnauthorizedHandler | null): void {
  unauthorizedHandler = handler;
}

const BASE_PATH = '/api';

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${BASE_PATH}${path}`, {
      // The SPA is served from the API's own origin in production, and through
      // Vite's proxy in development, so the session cookie is same-origin both ways.
      credentials: 'same-origin',
      ...init,
      headers: {
        Accept: 'application/json',
        ...(init.body ? { 'Content-Type': 'application/json' } : {}),
        ...init.headers,
      },
    });
  } catch {
    // fetch only rejects when the request never happened — DNS, refused connection,
    // CORS. An HTTP error status resolves normally and is handled below.
    throw new ApiError(0, 'Could not reach the server. Check that the API is running.');
  }

  if (!response.ok) {
    // The sign-in endpoints answer 401 as a normal outcome, so they must not trip
    // the session-expired path — that would fight with the login screen.
    if (response.status === 401 && !path.startsWith('/auth/')) {
      unauthorizedHandler?.();
    }

    const problem = await readProblem(response);
    throw new ApiError(response.status, describe(response.status, problem), problem);
  }

  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return undefined as T;
  }

  return (await response.json()) as T;
}

async function readProblem(response: Response): Promise<ProblemDetails | undefined> {
  if (!(response.headers.get('content-type') ?? '').includes('json')) return undefined;

  try {
    return (await response.json()) as ProblemDetails;
  } catch {
    return undefined;
  }
}

const BY_STATUS: Record<number, string> = {
  401: 'Your session has ended. Sign in again.',
  403: "You don't have access to that.",
  404: 'That is no longer there.',
  429: 'Too many attempts. Wait a minute and try again.',
  500: 'Something went wrong on the server.',
};

function describe(status: number, problem?: ProblemDetails): string {
  const firstValidationMessage = problem?.errors
    ? Object.values(problem.errors).flat()[0]
    : undefined;

  // `detail` is the specific explanation, `title` the general one; a validation
  // message beats both, since it names the field that was actually wrong.
  return (
    firstValidationMessage ??
    problem?.detail ??
    problem?.title ??
    BY_STATUS[status] ??
    `Request failed (${status}).`
  );
}
