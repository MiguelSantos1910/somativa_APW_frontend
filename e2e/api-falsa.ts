import type { Page, Route } from '@playwright/test'

export const SENHA = 'SenhaForte#2026'

interface UsuarioFalso {
  id: number
  username: string
  first_name: string
  last_name: string
  email: string
  password: string
  papel: 'ADMIN' | 'ESPECTADOR'
}

interface FilmeFalso {
  id: string
  nome: string
  genero: string
  sinopse: string
  nota: string
  duracao: number
  ano_lancamento: number
}

const CABECALHOS_CORS = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  'access-control-allow-headers': 'authorization, content-type',
}

export function criarApiFalsa() {
  const usuarios: UsuarioFalso[] = [
    {
      id: 1,
      username: 'ana',
      first_name: 'Ana',
      last_name: 'Souza',
      email: 'ana@teste.com',
      password: SENHA,
      papel: 'ESPECTADOR',
    },
  ]

  const filmes: FilmeFalso[] = [
    {
      id: 'f1',
      nome: 'Parasita',
      genero: 'Suspense',
      sinopse: 'Uma família pobre se infiltra na casa de uma família rica.',
      nota: '8.5',
      duracao: 132,
      ano_lancamento: 2019,
    },
    {
      id: 'f2',
      nome: 'Interestelar',
      genero: 'Ficção científica',
      sinopse: 'Exploradores atravessam um buraco de minhoca em busca de um novo lar.',
      nota: '8.7',
      duracao: 169,
      ano_lancamento: 2014,
    },
    {
      id: 'f3',
      nome: 'Cidade de Deus',
      genero: 'Crime',
      sinopse: 'Buscapé acompanha o crescimento do crime numa favela carioca.',
      nota: '8.6',
      duracao: 130,
      ano_lancamento: 2002,
    },
  ]

  const favoritos = new Map<number, Set<string>>()

  const tokenDe = (u: UsuarioFalso) => `token-${u.id}`

  function usuarioDaRequisicao(route: Route) {
    const auth = route.request().headers().authorization ?? ''
    return usuarios.find((u) => auth === `Bearer ${tokenDe(u)}`)
  }

  function semSenha(u: UsuarioFalso) {
    const { password: _senha, ...resto } = u
    return { ...resto, is_active: true }
  }

  function serializarFilme(f: FilmeFalso, usuario: UsuarioFalso) {
    return { ...f, imagem: null, criado_por: null, is_favorite: favoritos.get(usuario.id)?.has(f.id) ?? false }
  }

  async function responder(route: Route, status: number, corpo?: unknown) {
    await route.fulfill({
      status,
      headers: { ...CABECALHOS_CORS, 'content-type': 'application/json' },
      body: corpo === undefined ? '' : JSON.stringify(corpo),
    })
  }

  async function tratar(route: Route) {
    const req = route.request()
    const url = new URL(req.url())
    const caminho = url.pathname.replace(/^\/api/, '')
    const metodo = req.method()
    const corpo = req.postDataJSON?.() ?? {}

    if (metodo === 'OPTIONS') return route.fulfill({ status: 204, headers: CABECALHOS_CORS })

    if (caminho === '/token/' && metodo === 'POST') {
      const id = String(corpo.username ?? '').trim().toLowerCase()
      const usuario = usuarios.find((u) => u.username === id || u.email === id)
      if (!usuario || usuario.password !== corpo.password) {
        return responder(route, 401, { detail: 'Nenhuma conta ativa encontrada com as credenciais fornecidas' })
      }
      return responder(route, 200, { access: tokenDe(usuario), refresh: `refresh-${usuario.id}` })
    }

    if (caminho === '/usuarios/' && metodo === 'POST') {
      if (usuarios.some((u) => u.username === corpo.username)) {
        return responder(route, 400, { username: ['Um usuário com este nome de usuário já existe.'] })
      }
      const novo: UsuarioFalso = { id: usuarios.length + 1, papel: 'ESPECTADOR', last_name: '', ...corpo }
      usuarios.push(novo)
      return responder(route, 201, semSenha(novo))
    }

    const usuario = usuarioDaRequisicao(route)
    if (!usuario) return responder(route, 401, { detail: 'As credenciais de autenticação não foram fornecidas.' })

    if (caminho === '/me/') return responder(route, 200, semSenha(usuario))
    if (caminho === '/logout/') return responder(route, 200, { detail: 'Logout realizado com sucesso.' })

    if (caminho === '/filmes/') {
      const busca = (url.searchParams.get('search') ?? '').toLowerCase()
      const genero = url.searchParams.get('genero')
      const apenasFavoritos = url.searchParams.get('favoritos') === 'true'
      const lista = filmes
        .map((f) => serializarFilme(f, usuario))
        .filter((f) => !busca || f.nome.toLowerCase().includes(busca))
        .filter((f) => !genero || f.genero === genero)
        .filter((f) => !apenasFavoritos || f.is_favorite)
      return responder(route, 200, lista)
    }

    const favoritar = caminho.match(/^\/filmes\/([^/]+)\/favoritar\/$/)
    if (favoritar) {
      const id = favoritar[1] ?? ''
      const doUsuario = favoritos.get(usuario.id) ?? new Set<string>()
      favoritos.set(usuario.id, doUsuario)
      if (metodo === 'POST') doUsuario.add(id)
      else doUsuario.delete(id)
      return responder(route, 200, { is_favorite: metodo === 'POST' })
    }

    return responder(route, 404, { detail: 'Não encontrado.' })
  }

  async function instalar(page: Page) {
    await page.route('http://api.teste/api/**', tratar)
  }

  return { instalar, usuarios, favoritos }
}

export async function entrar(page: Page, usuario = 'ana', senha = SENHA) {
  await page.goto('/login')
  await page.getByLabel('Usuário ou e-mail').fill(usuario)
  await page.getByLabel('Senha', { exact: true }).fill(senha)
  await page.getByRole('button', { name: 'Entrar' }).click()
}
