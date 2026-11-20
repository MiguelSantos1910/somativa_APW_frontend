# MangeFlix: Frontend

Interface web da plataforma **MangeFlix**, feita com Vue 3 + TypeScript. O usuário cria uma conta, entra, navega pelo catálogo de filmes e monta sua lista de favoritos.

Ela consome a API REST do backend (Django REST Framework), que fica em um repositório separado.

## Funcionalidades

- **Login** com usuário ou e-mail, com mensagem de erro para credenciais inválidas
- **Cadastro** com validação dos campos, confirmação de senha e mensagem de sucesso
- **Catálogo** em cartões com pôster, título, sinopse, gênero, ano, duração e nota. Tem busca, filtro por gênero e ordenação
- **Favoritos**: adicionar e remover com um clique. Os filmes favoritados ficam destacados, e aparece uma mensagem quando a lista está vazia
- **Menu** com Catálogo, Favoritos e Sair. O logout volta para a tela de login
- **Área do administrador**: cadastrar, editar e excluir filmes (com envio do pôster) e gerenciar usuários
- Layout **responsivo** para computador e celular

## Tecnologias

- Vue 3 (Composition API) + TypeScript + Vite
- Vue Router (rotas protegidas por login e por papel)
- Pinia (estado de autenticação e de filmes)
- Fetch API com renovação automática do token JWT
- Playwright (testes end-to-end)

## Como executar

Pré-requisitos: Node.js 22.18+ ou 24+, e o backend rodando em `http://localhost:8000`.

```bash
npm install
npm run dev
```

Acesse `http://localhost:5173`.

O endereço da API fica no arquivo `.env`:

```
VITE_API_URL=http://localhost:8000/api
```

## Scripts

| Comando | O que faz |
|---|---|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Checagem de tipos + build de produção em `dist/` |
| `npm run lint` | oxlint + ESLint |
| `npm run test:e2e` | Testes end-to-end com Playwright (desktop e celular) |

### Testes end-to-end

Na primeira vez, instale o navegador:

```bash
npx playwright install chromium
```

Depois rode `npm run test:e2e`. Os testes sobem o Vite sozinhos e simulam a API (`e2e/api-falsa.ts`), então **não precisam do backend rodando**. Eles cobrem:

- redirecionamento para o login sem sessão, erro de credenciais e login por e-mail
- cadastro (senhas diferentes, erro da API, sucesso e login em seguida)
- catálogo (cartões com sinopse, filtro por gênero, busca)
- favoritar, listar e remover; favoritos mantidos após sair e entrar de novo
- logout e layout sem rolagem horizontal

Todos rodam em dois tamanhos de tela: desktop e celular (Pixel 5).

O GitHub Actions roda lint, build e os testes e2e a cada push nas branches `master` e `dev` (veja `.github/workflows/ci.yml`).

## Estrutura

```
src/
  services/api.ts        cliente HTTP (JWT, refresh automático, erros da API)
  stores/                auth.ts (sessão) e filmes.ts (catálogo e favoritos)
  router/index.ts        rotas e proteção por login/papel
  layouts/               LayoutPrincipal.vue (menu de navegação)
  views/                 Login, Cadastro, Catálogo/Favoritos, Formulário de filme, Usuários
  components/            BotaoBase, CampoTexto, CartaoAuth, CartaoFilme, IconeBase
e2e/                     testes Playwright
```