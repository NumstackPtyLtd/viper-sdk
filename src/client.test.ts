import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ViperClient, ViperError } from './client.js'

const BASE = 'http://localhost:3000'

function mockFetch(status: number, body?: unknown, headers?: Record<string, string>) {
  return vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
    headers: new Headers(headers),
  })
}

beforeEach(() => {
  vi.restoreAllMocks()
})

// --- Constructor ---

describe('ViperClient constructor', () => {
  it('accepts a string base URL', () => {
    const client = new ViperClient(BASE)
    expect(client).toBeInstanceOf(ViperClient)
  })

  it('accepts a ClientOptions object', () => {
    const client = new ViperClient({ baseUrl: BASE, credentials: 'omit', headers: { 'X-Custom': 'yes' } })
    expect(client).toBeInstanceOf(ViperClient)
  })
})

// --- request() ---

describe('request()', () => {
  it('handles successful JSON responses', async () => {
    const payload = { reviews: [], total: 0 }
    vi.stubGlobal('fetch', mockFetch(200, payload))

    const client = new ViperClient(BASE)
    const result = await client.get('/api/reviews')

    expect(fetch).toHaveBeenCalledOnce()
    expect(result).toEqual(payload)
  })

  it('throws ViperError on non-OK responses', async () => {
    vi.stubGlobal('fetch', mockFetch(403, { error: 'Forbidden' }))

    const client = new ViperClient(BASE)

    await expect(client.get('/api/reviews')).rejects.toThrow(ViperError)
    await expect(client.get('/api/reviews')).rejects.toThrow('Forbidden')

    try {
      await client.get('/api/reviews')
    } catch (err) {
      expect(err).toBeInstanceOf(ViperError)
      expect((err as ViperError).status).toBe(403)
    }
  })

  it('throws ViperError with HTTP status when error body is not JSON', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.reject(new Error('not json')),
    }))

    const client = new ViperClient(BASE)

    try {
      await client.get('/api/reviews')
    } catch (err) {
      expect(err).toBeInstanceOf(ViperError)
      expect((err as ViperError).message).toBe('HTTP 500')
      expect((err as ViperError).status).toBe(500)
    }
  })

  it('handles 204 empty responses', async () => {
    vi.stubGlobal('fetch', mockFetch(204))

    const client = new ViperClient(BASE)
    const result = await client.del('/api/tokens/abc')

    expect(result).toEqual({})
  })

  it('sends Content-Type header and body for POST requests', async () => {
    vi.stubGlobal('fetch', mockFetch(200, { status: 'ok' }))

    const client = new ViperClient(BASE)
    const body = { email: 'a@b.com', password: 'secret' }
    await client.post('/api/auth/login', body)

    expect(fetch).toHaveBeenCalledWith(
      `${BASE}/api/auth/login`,
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(body),
        headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
      }),
    )
  })

  it('does not send Content-Type header for GET requests', async () => {
    vi.stubGlobal('fetch', mockFetch(200, { reviews: [] }))

    const client = new ViperClient(BASE)
    await client.get('/api/reviews')

    const callArgs = (fetch as ReturnType<typeof vi.fn>).mock.calls[0]
    const headers = callArgs[1].headers as Record<string, string>
    expect(headers['Content-Type']).toBeUndefined()
  })
})

// --- API class instances ---

describe('API class instances', () => {
  it('has all API classes', () => {
    const client = new ViperClient(BASE)
    expect(client.auth).toBeDefined()
    expect(client.reviews).toBeDefined()
    expect(client.tokens).toBeDefined()
    expect(client.connections).toBeDefined()
    expect(client.projects).toBeDefined()
    expect(client.wiki).toBeDefined()
    expect(client.policies).toBeDefined()
    expect(client.reviewConfigs).toBeDefined()
    expect(client.settings).toBeDefined()
    expect(client.providers).toBeDefined()
  })
})

// --- Auth API ---

describe('AuthAPI', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', mockFetch(200, { status: 'ok' }))
  })

  it('signup calls POST /api/signup', async () => {
    const client = new ViperClient(BASE)
    await client.auth.signup({ org_name: 'Acme', admin_name: 'Jo', admin_email: 'jo@acme.com', admin_password: 'pw' })
    expect(fetch).toHaveBeenCalledWith(`${BASE}/api/signup`, expect.objectContaining({ method: 'POST' }))
  })

  it('login calls POST /api/auth/login', async () => {
    const client = new ViperClient(BASE)
    await client.auth.login({ email: 'jo@acme.com', password: 'pw' })
    expect(fetch).toHaveBeenCalledWith(`${BASE}/api/auth/login`, expect.objectContaining({ method: 'POST' }))
  })

  it('session calls GET /api/auth/session', async () => {
    const client = new ViperClient(BASE)
    await client.auth.session()
    expect(fetch).toHaveBeenCalledWith(`${BASE}/api/auth/session`, expect.objectContaining({ method: 'GET' }))
  })

  it('logout calls POST /api/auth/logout', async () => {
    const client = new ViperClient(BASE)
    await client.auth.logout()
    expect(fetch).toHaveBeenCalledWith(`${BASE}/api/auth/logout`, expect.objectContaining({ method: 'POST' }))
  })

  it('getPreferences calls GET /api/auth/preferences', async () => {
    const client = new ViperClient(BASE)
    await client.auth.getPreferences()
    expect(fetch).toHaveBeenCalledWith(`${BASE}/api/auth/preferences`, expect.objectContaining({ method: 'GET' }))
  })

  it('updatePreferences calls PUT /api/auth/preferences', async () => {
    const client = new ViperClient(BASE)
    await client.auth.updatePreferences({ theme: 'dark' })
    expect(fetch).toHaveBeenCalledWith(`${BASE}/api/auth/preferences`, expect.objectContaining({ method: 'PUT' }))
  })
})

// --- Reviews API ---

describe('ReviewsAPI', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', mockFetch(200, { reviews: [], total: 0 }))
  })

  it('list builds query string from params', async () => {
    const client = new ViperClient(BASE)
    await client.reviews.list({ limit: 10, offset: 5, provider: 'github', verdict: 'approve' })

    const url = (fetch as ReturnType<typeof vi.fn>).mock.calls[0][0] as string
    expect(url).toContain('/api/reviews?')
    expect(url).toContain('limit=10')
    expect(url).toContain('offset=5')
    expect(url).toContain('provider=github')
    expect(url).toContain('verdict=approve')
  })

  it('list omits undefined params from query string', async () => {
    const client = new ViperClient(BASE)
    await client.reviews.list({ limit: 10 })

    const url = (fetch as ReturnType<typeof vi.fn>).mock.calls[0][0] as string
    expect(url).toContain('limit=10')
    expect(url).not.toContain('offset')
    expect(url).not.toContain('provider')
  })

  it('list calls /api/reviews with no params', async () => {
    const client = new ViperClient(BASE)
    await client.reviews.list()

    expect(fetch).toHaveBeenCalledWith(`${BASE}/api/reviews`, expect.anything())
  })
})

// --- Wiki API ---

describe('WikiAPI', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', mockFetch(200, { results: [] }))
  })

  it('search encodes the query parameter', async () => {
    const client = new ViperClient(BASE)
    await client.wiki.search('hello world & more')

    const url = (fetch as ReturnType<typeof vi.fn>).mock.calls[0][0] as string
    expect(url).toContain('/api/wiki/search?q=')
    expect(url).toContain(encodeURIComponent('hello world & more'))
    expect(url).not.toContain('hello world & more')
  })
})
