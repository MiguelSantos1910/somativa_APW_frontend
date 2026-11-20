import { expect, test } from '@playwright/test'
import { SENHA, criarApiFalsa, entrar } from './api-falsa'

test.beforeEach(async ({ page }) => {
  await criarApiFalsa().instalar(page)
})

const cartao = (page: import('@playwright/test').Page, nome: string) =>
  page.getByRole('article').filter({ has: page.getByRole('heading', { name: nome }) })

test.describe('Autenticação', () => {
  test('redireciona para o login quando não há sessão', async ({ page }) => {
    await page.goto('/favoritos')

    await expect(page).toHaveURL(/\/login\?proximo=(%2F|\/)favoritos/)
    await expect(page.getByRole('heading', { name: 'Entrar' })).toBeVisible()
  })

  test('mostra erro com credenciais inválidas', async ({ page }) => {
    await entrar(page, 'ana', 'senha-errada')

    await expect(page.getByRole('alert')).toHaveText('Usuário, e-mail ou senha incorretos.')
    await expect(page).toHaveURL(/\/login/)
  })

  test('entra com o e-mail e chega ao catálogo', async ({ page }) => {
    await entrar(page, 'ana@teste.com')

    await expect(page).toHaveURL('/')
    await expect(page.getByRole('heading', { name: 'Catálogo' })).toBeVisible()
  })

  test('cadastro valida a confirmação de senha e depois permite entrar', async ({ page }) => {
    await page.goto('/cadastro')
    await page.getByLabel('Nome', { exact: true }).fill('Bia')
    await page.getByLabel('Usuário', { exact: true }).fill('bia')
    await page.getByLabel('E-mail').fill('bia@teste.com')
    await page.getByLabel('Senha', { exact: true }).fill(SENHA)
    await page.getByLabel('Confirmar senha').fill('outra-senha')
    await page.getByRole('button', { name: 'Criar conta' }).click()

    await expect(page.getByText('As senhas não conferem.')).toBeVisible()

    await page.getByLabel('Confirmar senha').fill(SENHA)
    await page.getByRole('button', { name: 'Criar conta' }).click()

    await expect(page).toHaveURL(/\/login/)
    await expect(page.getByRole('status')).toHaveText('Conta criada com sucesso! Entre com seus dados.')
    await expect(page.getByLabel('Usuário ou e-mail')).toHaveValue('bia')

    await page.getByLabel('Senha', { exact: true }).fill(SENHA)
    await page.getByRole('button', { name: 'Entrar' }).click()
    await expect(page.getByRole('heading', { name: 'Catálogo' })).toBeVisible()
  })

  test('cadastro mostra o erro devolvido pela API', async ({ page }) => {
    await page.goto('/cadastro')
    await page.getByLabel('Nome', { exact: true }).fill('Outra Ana')
    await page.getByLabel('Usuário', { exact: true }).fill('ana')
    await page.getByLabel('E-mail').fill('outra@teste.com')
    await page.getByLabel('Senha', { exact: true }).fill(SENHA)
    await page.getByLabel('Confirmar senha').fill(SENHA)
    await page.getByRole('button', { name: 'Criar conta' }).click()

    await expect(page.getByText('Um usuário com este nome de usuário já existe.')).toBeVisible()
  })

  test('logout volta para a tela de login', async ({ page }) => {
    await entrar(page)
    await page.getByRole('button', { name: 'Sair' }).click()

    await expect(page).toHaveURL(/\/login/)
    await page.goto('/')
    await expect(page).toHaveURL(/\/login/)
  })
})

test.describe('Catálogo e favoritos', () => {
  test.beforeEach(async ({ page }) => {
    await entrar(page)
    await expect(page.getByRole('heading', { name: 'Catálogo' })).toBeVisible()
  })

  test('exibe os filmes em cartões com título, sinopse, gênero e ano', async ({ page }) => {
    await expect(page.getByRole('article')).toHaveCount(3)

    const parasita = cartao(page, 'Parasita')
    await expect(parasita.getByText('Uma família pobre se infiltra')).toBeVisible()
    await expect(parasita.getByText('Suspense')).toBeVisible()
    await expect(parasita.getByText('2019')).toBeVisible()
  })

  test('filtra o catálogo por gênero', async ({ page }) => {
    await page.getByRole('group', { name: 'Filtrar por gênero' }).getByRole('button', { name: 'Crime' }).click()

    await expect(page.getByRole('article')).toHaveCount(1)
    await expect(cartao(page, 'Cidade de Deus')).toBeVisible()
  })

  test('busca filmes pelo nome', async ({ page }) => {
    await page.getByLabel('Buscar filmes').fill('inter')

    await expect(page.getByRole('article')).toHaveCount(1)
    await expect(cartao(page, 'Interestelar')).toBeVisible()
  })

  test('favorita, lista nos favoritos e remove', async ({ page }) => {
    const botao = cartao(page, 'Parasita').getByRole('button', { name: 'Adicionar aos favoritos' })
    await botao.click()
    await expect(cartao(page, 'Parasita').getByRole('button', { name: 'Remover dos favoritos' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )

    await page.getByRole('link', { name: 'Favoritos' }).click()
    await expect(page.getByRole('heading', { name: 'Meus favoritos' })).toBeVisible()
    await expect(page.getByRole('article')).toHaveCount(1)

    await cartao(page, 'Parasita').getByRole('button', { name: 'Remover dos favoritos' }).click()

    await expect(page.getByRole('article')).toHaveCount(0)
    await expect(page.getByText('Você ainda não favoritou nenhum filme.')).toBeVisible()
  })

  test('favoritos continuam salvos depois de sair e entrar de novo', async ({ page }) => {
    await cartao(page, 'Interestelar').getByRole('button', { name: 'Adicionar aos favoritos' }).click()
    await expect(cartao(page, 'Interestelar').getByRole('button', { name: 'Remover dos favoritos' })).toBeVisible()

    await page.getByRole('button', { name: 'Sair' }).click()
    await entrar(page)
    await page.getByRole('link', { name: 'Favoritos' }).click()

    await expect(page.getByRole('article')).toHaveCount(1)
    await expect(cartao(page, 'Interestelar')).toBeVisible()
  })

  test('layout cabe na tela sem rolagem horizontal', async ({ page }) => {
    const largura = await page.evaluate(() => ({
      conteudo: document.documentElement.scrollWidth,
      tela: window.innerWidth,
    }))

    expect(largura.conteudo).toBeLessThanOrEqual(largura.tela)
    await expect(page.getByRole('navigation', { name: 'Principal' })).toBeVisible()
  })
})
