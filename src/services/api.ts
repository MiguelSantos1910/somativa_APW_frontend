const API_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api').replace(/\/$/, '')

const CHAVE_ACCESS = 'mangeflix.access'
const CHAVE_REFRESH = 'mangeflix.refresh'

function lerStorage(chave: string): string | null {
  try {
    return localStorage.getItem(chave)
  } catch {
    return null
  }
}

function gravarStorage(chave: string, valor: string | null) {
  try {
    if (valor === null) localStorage.removeItem(chave)
    else localStorage.setItem(chave, valor)
  } catch {}
}

export const tokens = {
  get access() {
    return lerStorage(CHAVE_ACCESS)
  },
  get refresh() {
    return lerStorage(CHAVE_REFRESH)
  },
  salvar(access: string, refresh?: string) {
    gravarStorage(CHAVE_ACCESS, access)
    if (refresh) gravarStorage(CHAVE_REFRESH, refresh)
  },
  limpar() {
    gravarStorage(CHAVE_ACCESS, null)
    gravarStorage(CHAVE_REFRESH, null)
  },
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public dados: unknown,
  ) {
    super(mensagemDeErro(dados, status))
  }
}

function mensagemDeErro(dados: unknown, status: number): string {
  if (dados && typeof dados === 'object') {
    const obj = dados as Record<string, unknown>
    if (typeof obj.detail === 'string') return obj.detail
    const partes = Object.entries(obj).map(([campo, valor]) => {
      const texto = Array.isArray(valor) ? valor.join(' ') : String(valor)
      return campo === 'non_field_errors' ? texto : `${campo}: ${texto}`
    })
    if (partes.length) return partes.join('\n')
  }
  if (status === 0) return 'Não foi possível conectar ao servidor.'
  return `Erro inesperado (${status}).`
}

let aoExpirarSessao: () => void = () => {}
export function definirAoExpirarSessao(fn: () => void) {
  aoExpirarSessao = fn
}

let renovacaoEmAndamento: Promise<boolean> | null = null

async function renovarToken(): Promise<boolean> {
  const refresh = tokens.refresh
  if (!refresh) return false

  renovacaoEmAndamento ??= (async () => {
    try {
      const resp = await fetch(`${API_URL}/token/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh }),
      })
      if (!resp.ok) return false
      const dados = (await resp.json()) as { access: string; refresh?: string }
      tokens.salvar(dados.access, dados.refresh)
      return true
    } catch {
      return false
    } finally {
      renovacaoEmAndamento = null
    }
  })()

  return renovacaoEmAndamento
}

interface Opcoes {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
  params?: Record<string, string | number | boolean | undefined>
  autenticado?: boolean
}

export async function api<T = unknown>(caminho: string, opcoes: Opcoes = {}): Promise<T> {
  const { method = 'GET', body, params, autenticado = true } = opcoes

  const url = new URL(`${API_URL}${caminho}`)
  for (const [chave, valor] of Object.entries(params ?? {})) {
    if (valor !== undefined && valor !== '') url.searchParams.set(chave, String(valor))
  }

  const enviar = () => {
    const headers: Record<string, string> = {}
    const ehFormData = body instanceof FormData
    if (body !== undefined && !ehFormData) headers['Content-Type'] = 'application/json'
    if (autenticado && tokens.access) headers.Authorization = `Bearer ${tokens.access}`

    return fetch(url, {
      method,
      headers,
      body: body === undefined ? undefined : ehFormData ? body : JSON.stringify(body),
    })
  }

  let resp: Response
  try {
    resp = await enviar()
    if (resp.status === 401 && autenticado && tokens.refresh) {
      if (await renovarToken()) {
        resp = await enviar()
      } else {
        tokens.limpar()
        aoExpirarSessao()
      }
    }
  } catch {
    throw new ApiError(0, null)
  }

  const texto = await resp.text()
  const dados: unknown = texto ? JSON.parse(texto) : null

  if (!resp.ok) throw new ApiError(resp.status, dados)
  return dados as T
}
