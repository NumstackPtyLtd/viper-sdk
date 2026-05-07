import type {
  User, Review, Finding, Token, Connection,
  Project, WikiEntry, ReviewConfig, Policy, Theme,
} from './entities.js'

// --- Auth ---
export interface SignupRequest { org_name: string; admin_name: string; admin_email: string; admin_password: string }
export interface SignupResponse { status: string; org_id: string; user_id: string }
export interface LoginRequest { email: string; password: string }
export interface LoginResponse { status: string; user: User }
export interface SessionResponse { user: User | null }
export interface StatusResponse { status: string }

// --- Preferences ---
export interface PreferencesResponse { theme: Theme }
export interface UpdatePreferencesRequest { theme: Theme }

// --- Reviews ---
export interface ReviewListParams { limit?: number; offset?: number; provider?: string; severity?: string; verdict?: string; project_id?: string; q?: string }
export interface ReviewListResponse { reviews: Review[]; total: number }
export interface ReviewDetailResponse { review: Review; findings: Finding[] }
export interface ReviewStatsResponse { total: number; thisWeek: number; criticals: number; totalFindings: number }

// --- Tokens ---
export interface CreateTokenRequest { provider: string; api_key: string; model?: string; label?: string; is_default?: boolean }
export interface TokenListResponse { tokens: Token[] }
export interface CreateTokenResponse { status: string; id: string }

// --- Connections ---
export interface CreateConnectionRequest { provider: string; name: string; base_url?: string; config?: Record<string, string> }
export interface ConnectionListResponse { connections: Connection[] }
export interface CreateConnectionResponse { status: string; id: string }

// --- Projects ---
export interface CreateProjectRequest { name: string; full_path: string; external_project_id?: string; connection_id?: string; default_branch?: string; language?: string }
export interface ProjectListResponse { projects: Project[] }
export interface CreateProjectResponse { status: string; id: string }

// --- Wiki ---
export interface CreateWikiRequest { title: string; content: string; category: string; tags?: string[]; owner_type?: string; owner_id?: string }
export interface UpdateWikiRequest { title?: string; content?: string; category?: string; tags?: string[]; owner_type?: string; owner_id?: string }
export interface WikiListParams { owner_type?: string; owner_id?: string; category?: string; q?: string; limit?: number; offset?: number }
export interface WikiListResponse { entries: WikiEntry[]; total: number }
export interface WikiSearchResponse { results: WikiEntry[] }
export interface WikiStatsResponse {
  total: number; neverMatched: number
  byCategory: Record<string, number>
  allTags: string[]
  staleEntries: WikiEntry[]; topMatched: WikiEntry[]
}
export interface WikiImportRequest { entries: Array<Omit<CreateWikiRequest, 'owner_type' | 'owner_id'>> }
export interface WikiImportResponse { status: string; count: number }

// --- Policies ---
export interface CreatePolicyRequest { name: string; description?: string; resource_type: string; resource_id?: string; target_type: string; target_id?: string; effect?: string; priority?: number; conditions?: { scope?: string[]; branches?: string[] } }
export interface UpdatePolicyRequest { name?: string; description?: string; resource_type?: string; resource_id?: string; target_type?: string; target_id?: string; effect?: string; priority?: number; conditions?: { scope?: string[]; branches?: string[] }; enabled?: boolean }
export interface PolicyListParams { resource_type?: string; target_type?: string; target_id?: string }
export interface PolicyListResponse { policies: Policy[] }
export interface PolicyPreviewResponse { entries: Array<{ entry: WikiEntry; effect: string; policy_name: string; priority: number }> }

// --- Review Config ---
export interface ReviewConfigListResponse { configs: ReviewConfig[] }
export interface CreateReviewConfigResponse { status: string; id: string }

// --- Settings ---
export interface SettingEntry { key: string; value: string; isSecret: boolean }
export interface SettingsListResponse { settings: SettingEntry[] }

// --- Provider Discovery ---
export interface ProviderTypeInfo { type: string; name: string; description: string; configSchema?: unknown[]; models?: Array<{ id: string; label: string; default?: boolean }> }
export interface ProviderTypesResponse { providers: ProviderTypeInfo[] }

// --- Status ---
export interface ServerStatusResponse { configured: boolean; vcs: ProviderTypeInfo[]; ai: ProviderTypeInfo[] }
export interface HealthResponse { status: string; service: string; version: string }

// --- Error ---
export interface ErrorResponse { error: string }
