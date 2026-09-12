const API_BASE = import.meta.env.VITE_API_URL || '/api/v1'

export async function api(path, options = {}) {
  const token = localStorage.getItem('loancompare_token')
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    body: options.body && typeof options.body !== 'string' ? JSON.stringify(options.body) : options.body,
  })
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(payload.error || 'Request failed')
  return payload
}

export const auth = {
  login: (body) => api('/auth/login', { method: 'POST', body }),
  register: (body) => api('/auth/register', { method: 'POST', body }),
  me: () => api('/auth/me'),
}

export const loans = {
  compare: (body) => api('/lenders/compare', { method: 'POST', body }),
  applications: () => api('/applications'),
  application: (id) => api(`/applications/${id}`),
  create: (body) => api('/applications', { method: 'POST', body }),
  selectOffer: (id, offerId) => api(`/applications/${id}/select-offer/${offerId}`, { method: 'POST' }),
}
