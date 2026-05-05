import type {
  SignupRequest, SignupResponse, LoginRequest, LoginResponse, SessionResponse, StatusResponse,
  ReviewListParams, ReviewListResponse, ReviewDetailResponse, ReviewStatsResponse,
  CreateTokenRequest, TokenListResponse, CreateTokenResponse,
  CreateConnectionRequest, ConnectionListResponse, CreateConnectionResponse,
  CreateProjectRequest, ProjectListResponse, CreateProjectResponse,
  CreateWikiRequest, UpdateWikiRequest, WikiListParams, WikiListResponse,
  WikiSearchResponse, WikiStatsResponse, WikiImportRequest, WikiImportResponse,
  ReviewConfigListResponse, CreateReviewConfigResponse,
  SettingsListResponse,
  ProviderTypesResponse, ServerStatusResponse, HealthResponse,
  ErrorResponse,
} from './api.js'
import type { ReviewConfig } from './entities.js'

export interface ClientOptions {
  baseUrl: string
  credentials?: RequestCredentials
  headers?: Record<string, string>
}

export interface RequestOptions {
  signal?: AbortSignal
}

export class ViperError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message)
    this.name = 'ViperError'
  }
}

export class ViperClient {
  private readonly baseUrl: string
  private readonly credentials: RequestCredentials
  private readonly headers: Record<string, string>

  readonly auth: AuthAPI
  readonly reviews: ReviewsAPI
  readonly tokens: TokensAPI
  readonly connections: ConnectionsAPI
  readonly projects: ProjectsAPI
  readonly wiki: WikiAPI
  readonly reviewConfigs: ReviewConfigsAPI
  readonly settings: SettingsAPI
  readonly providers: ProvidersAPI

  constructor(baseUrlOrOptions: string | ClientOptions) {
    const opts = typeof baseUrlOrOptions === 'string'
      ? { baseUrl: baseUrlOrOptions }
      : baseUrlOrOptions
    this.baseUrl = opts.baseUrl
    this.credentials = opts.credentials ?? 'include'
    this.headers = opts.headers ?? {}

    this.auth = new AuthAPI(this)
    this.reviews = new ReviewsAPI(this)
    this.tokens = new TokensAPI(this)
    this.connections = new ConnectionsAPI(this)
    this.projects = new ProjectsAPI(this)
    this.wiki = new WikiAPI(this)
    this.reviewConfigs = new ReviewConfigsAPI(this)
    this.settings = new SettingsAPI(this)
    this.providers = new ProvidersAPI(this)
  }

  async request<T>(method: string, path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    const url = `${this.baseUrl}${path}`
    const init: RequestInit = {
      method,
      credentials: this.credentials,
      headers: {
        ...this.headers,
        ...(body ? { 'Content-Type': 'application/json' } : {}),
      },
      ...(options?.signal ? { signal: options.signal } : {}),
    }
    if (body) init.body = JSON.stringify(body)

    const res = await fetch(url, init)

    if (!res.ok) {
      let message = `HTTP ${res.status}`
      try {
        const err = await res.json() as ErrorResponse
        message = err.error || message
      } catch {}
      throw new ViperError(res.status, message)
    }

    if (res.status === 204) return {} as T
    return res.json() as Promise<T>
  }

  get<T>(path: string, opts?: RequestOptions): Promise<T> { return this.request<T>('GET', path, undefined, opts) }
  post<T>(path: string, body?: unknown, opts?: RequestOptions): Promise<T> { return this.request<T>('POST', path, body, opts) }
  put<T>(path: string, body?: unknown, opts?: RequestOptions): Promise<T> { return this.request<T>('PUT', path, body, opts) }
  del<T>(path: string, opts?: RequestOptions): Promise<T> { return this.request<T>('DELETE', path, undefined, opts) }
}

class AuthAPI {
  constructor(private c: ViperClient) {}
  signup(data: SignupRequest, opts?: RequestOptions) { return this.c.post<SignupResponse>('/api/signup', data, opts) }
  login(data: LoginRequest, opts?: RequestOptions) { return this.c.post<LoginResponse>('/api/auth/login', data, opts) }
  session(opts?: RequestOptions) { return this.c.get<SessionResponse>('/api/auth/session', opts) }
  logout(opts?: RequestOptions) { return this.c.post<StatusResponse>('/api/auth/logout', undefined, opts) }
}

class ReviewsAPI {
  constructor(private c: ViperClient) {}
  list(params?: ReviewListParams, opts?: RequestOptions) {
    const qs = params ? '?' + new URLSearchParams(Object.entries(params).filter(([, v]) => v != null).map(([k, v]) => [k, String(v)])).toString() : ''
    return this.c.get<ReviewListResponse>(`/api/reviews${qs}`, opts)
  }
  get(id: string, opts?: RequestOptions) { return this.c.get<ReviewDetailResponse>(`/api/reviews/${id}`, opts) }
  stats(opts?: RequestOptions) { return this.c.get<ReviewStatsResponse>('/api/reviews/stats/summary', opts) }
}

class TokensAPI {
  constructor(private c: ViperClient) {}
  list(opts?: RequestOptions) { return this.c.get<TokenListResponse>('/api/tokens', opts) }
  create(data: CreateTokenRequest, opts?: RequestOptions) { return this.c.post<CreateTokenResponse>('/api/tokens', data, opts) }
  update(id: string, data: Partial<CreateTokenRequest & { is_default: boolean }>, opts?: RequestOptions) { return this.c.put<StatusResponse>(`/api/tokens/${id}`, data, opts) }
  delete(id: string, opts?: RequestOptions) { return this.c.del<StatusResponse>(`/api/tokens/${id}`, opts) }
}

class ConnectionsAPI {
  constructor(private c: ViperClient) {}
  list(opts?: RequestOptions) { return this.c.get<ConnectionListResponse>('/api/connections', opts) }
  create(data: CreateConnectionRequest, opts?: RequestOptions) { return this.c.post<CreateConnectionResponse>('/api/connections', data, opts) }
  delete(id: string, opts?: RequestOptions) { return this.c.del<StatusResponse>(`/api/connections/${id}`, opts) }
}

class ProjectsAPI {
  constructor(private c: ViperClient) {}
  list(opts?: RequestOptions) { return this.c.get<ProjectListResponse>('/api/projects', opts) }
  create(data: CreateProjectRequest, opts?: RequestOptions) { return this.c.post<CreateProjectResponse>('/api/projects', data, opts) }
  delete(id: string, opts?: RequestOptions) { return this.c.del<StatusResponse>(`/api/projects/${id}`, opts) }
}

class WikiAPI {
  constructor(private c: ViperClient) {}
  list(params?: WikiListParams, opts?: RequestOptions) {
    const qs = params ? '?' + new URLSearchParams(Object.entries(params).filter(([, v]) => v != null).map(([k, v]) => [k, String(v)])).toString() : ''
    return this.c.get<WikiListResponse>(`/api/wiki${qs}`, opts)
  }
  get(id: string, opts?: RequestOptions) { return this.c.get<{ entry: import('./entities.js').WikiEntry }>(`/api/wiki/${id}`, opts) }
  create(data: CreateWikiRequest, opts?: RequestOptions) { return this.c.post<StatusResponse & { id: string }>('/api/wiki', data, opts) }
  update(id: string, data: UpdateWikiRequest, opts?: RequestOptions) { return this.c.put<StatusResponse>(`/api/wiki/${id}`, data, opts) }
  delete(id: string, opts?: RequestOptions) { return this.c.del<StatusResponse>(`/api/wiki/${id}`, opts) }
  search(q: string, opts?: RequestOptions) { return this.c.get<WikiSearchResponse>(`/api/wiki/search?q=${encodeURIComponent(q)}`, opts) }
  stats(opts?: RequestOptions) { return this.c.get<import('./api.js').WikiStatsResponse>('/api/wiki/stats', opts) }
  import(data: WikiImportRequest, opts?: RequestOptions) { return this.c.post<WikiImportResponse>('/api/wiki/import', data, opts) }
}

class ReviewConfigsAPI {
  constructor(private c: ViperClient) {}
  list(opts?: RequestOptions) { return this.c.get<ReviewConfigListResponse>('/api/settings/review', opts) }
  create(data: Partial<ReviewConfig>, opts?: RequestOptions) { return this.c.post<CreateReviewConfigResponse>('/api/settings/review', data, opts) }
  update(id: string, data: Partial<ReviewConfig>, opts?: RequestOptions) { return this.c.put<StatusResponse>(`/api/settings/review/${id}`, data, opts) }
}

class SettingsAPI {
  constructor(private c: ViperClient) {}
  list(opts?: RequestOptions) { return this.c.get<SettingsListResponse>('/api/settings', opts) }
  set(key: string, value: string, opts?: RequestOptions) { return this.c.put<StatusResponse>(`/api/settings/${key}`, { value }, opts) }
  bulkSet(data: Record<string, string>, opts?: RequestOptions) { return this.c.put<StatusResponse>('/api/settings', data, opts) }
  delete(key: string, opts?: RequestOptions) { return this.c.del<StatusResponse>(`/api/settings/${key}`, opts) }
  status(opts?: RequestOptions) { return this.c.get<ServerStatusResponse>('/api/status', opts) }
  reload(opts?: RequestOptions) { return this.c.post<{ ok: boolean; configured: boolean }>('/api/reload', undefined, opts) }
  health(opts?: RequestOptions) { return this.c.get<HealthResponse>('/health', opts) }
}

class ProvidersAPI {
  constructor(private c: ViperClient) {}
  vcsTypes(opts?: RequestOptions) { return this.c.get<ProviderTypesResponse>('/api/vcs/types', opts) }
  aiTypes(opts?: RequestOptions) { return this.c.get<ProviderTypesResponse>('/api/ai/types', opts) }
}
