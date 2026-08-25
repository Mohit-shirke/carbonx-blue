const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

class ApiError extends Error {
  constructor(public status: number, message: string) { super(message); this.name = 'ApiError' }
}

async function request<T>(endpoint: string, options: RequestInit & {auth?:boolean} = {}): Promise<T> {
  const { auth = true, ...opts } = options
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...opts,
    headers: { 'Content-Type': 'application/json', ...opts.headers },
    credentials: auth ? 'include' : 'omit',
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new ApiError(res.status, data.message || data.error || 'Request failed')
  }
  return res.json()
}

export const authApi = {
  register: (body: object) => request('/api/v1/auth/register', { method:'POST', body:JSON.stringify(body) }),
  login:    (body: object) => request('/api/v1/auth/login',    { method:'POST', body:JSON.stringify(body) }),
  logout:   ()             => request('/api/v1/auth/logout',   { method:'POST' }),
  me:       ()             => request('/api/v1/auth/me'),
}

export const projectsApi = {
  list:    (params?: Record<string,string>) => request(`/api/v1/projects?${new URLSearchParams(params)}`),
  get:     (id: string)   => request(`/api/v1/projects/${id}`),
  propose: (body: object) => request('/api/v1/projects', { method:'POST', body:JSON.stringify(body) }),
}

export const paymentsApi = {
  createIntent: (body: object) => request('/api/v1/payments/intent', { method:'POST', body:JSON.stringify(body) }),
}

export const mrvApi = {
  run:  (id: string) => `${BASE_URL}/api/v1/mrv/run/${id}`,
  logs: (id: string) => request(`/api/v1/mrv/logs/${id}`),
}

export const ledgerApi = {
  list:   (params?: Record<string,string>) => request(`/api/v1/ledger?${new URLSearchParams(params)}`, {auth:false}),
  retire: (body: object) => request('/api/v1/ledger/retire', { method:'POST', body:JSON.stringify(body) }),
}

export { ApiError }
export default request
