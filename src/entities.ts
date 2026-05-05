/** Organisation. */
export interface Organisation {
  id: string
  name: string
  created_at: string
}

/** User account. */
export interface User {
  id: string
  org_id: string
  name: string
  email: string
  role: 'admin' | 'member'
  created_at: string
}

/** A code review performed by Viper. */
export interface Review {
  id: string
  org_id: string
  project_id: string | null
  mr_iid: number
  title: string
  description: string | null
  source_branch: string
  target_branch: string
  author: string
  provider: string
  verdict: 'approve' | 'request_changes' | 'comment' | null
  summary: string
  findings_count: number
  critical_count: number
  warning_count: number
  suggestion_count: number
  praise_count: number
  url: string | null
  created_at: string
}

/** A single finding within a review. */
export interface Finding {
  id: string
  review_id: string
  file: string
  line: number
  severity: 'critical' | 'warning' | 'suggestion' | 'praise'
  comment: string
}

/** AI provider token (API key). */
export interface Token {
  id: string
  org_id: string
  provider: string
  label: string | null
  api_key_masked: string
  model: string | null
  is_default: boolean
  created_at: string
}

/** VCS connection. */
export interface Connection {
  id: string
  org_id: string
  provider: string
  name: string
  base_url: string | null
  status: 'active' | 'inactive'
  created_at: string
}

/** Registered project (repo). */
export interface Project {
  id: string
  org_id: string
  connection_id: string | null
  name: string
  full_path: string
  external_project_id: string | null
  default_branch: string
  language: string | null
  last_review_at: string | null
  created_at: string
}

/** Wiki knowledge entry. */
export interface WikiEntry {
  id: string
  org_id: string
  project_id: string | null
  title: string
  content: string
  category: string
  tags: string[]
  scope: string[]
  match_count: number
  last_matched_at: string | null
  created_at: string
  updated_at: string
}

/** Review style configuration. */
export interface ReviewConfig {
  id: string
  org_id: string
  project_id: string | null
  tone: 'friendly' | 'concise' | 'strict' | 'pedantic'
  verbosity: 'minimal' | 'balanced' | 'detailed' | 'exhaustive'
  focus_areas: string[]
  custom_rules: string[]
  ignore_patterns: string[]
  language: string
  max_comments: number
  auto_resolve: boolean
  pedantic: boolean
  enabled: boolean
}
