const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/+$/, '')

export class AuthServiceError extends Error {
  constructor(message) {
    super(message)
    this.name = 'AuthServiceError'
  }
}

async function postAuthRequest(endpoint, payload) {
  let response
  try {
    response = await fetch(`${apiBaseUrl}/auth/${endpoint}`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  } catch {
    throw new AuthServiceError('Tidak dapat menghubungi layanan autentikasi. Periksa koneksi atau konfigurasi backend.')
  }

  if (response.ok) return

  const responseText = await response.text()
  let serverMessage = ''
  if (responseText) {
    try {
      const body = JSON.parse(responseText)
      serverMessage = typeof body.message === 'string' ? body.message : ''
    } catch (error) {
      if (!(error instanceof SyntaxError)) throw error
    }
  }

  if (response.status === 404) {
    throw new AuthServiceError(`Endpoint autentikasi tidak ditemukan (${apiBaseUrl}/auth/${endpoint}).`)
  }
  throw new AuthServiceError(serverMessage || 'Permintaan autentikasi gagal. Silakan coba lagi.')
}

export function login(credentials) {
  return postAuthRequest('login', credentials)
}

export function register(details) {
  return postAuthRequest('register', details)
}
