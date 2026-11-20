import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

declare module 'vue-router' {
  interface RouteMeta {
    publica?: boolean
    apenasAdmin?: boolean
  }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { publica: true },
    },
    {
      path: '/cadastro',
      name: 'cadastro',
      component: () => import('@/views/CadastroView.vue'),
      meta: { publica: true },
    },
    {
      path: '/',
      component: () => import('@/layouts/LayoutPrincipal.vue'),
      children: [
        { path: '', name: 'catalogo', component: () => import('@/views/CatalogoView.vue') },
        {
          path: 'favoritos',
          name: 'favoritos',
          component: () => import('@/views/CatalogoView.vue'),
          props: { apenasFavoritos: true },
        },
        {
          path: 'filmes/novo',
          name: 'filme-novo',
          component: () => import('@/views/FilmeFormView.vue'),
          meta: { apenasAdmin: true },
        },
        {
          path: 'filmes/:id/editar',
          name: 'filme-editar',
          component: () => import('@/views/FilmeFormView.vue'),
          props: true,
          meta: { apenasAdmin: true },
        },
        {
          path: 'usuarios',
          name: 'usuarios',
          component: () => import('@/views/UsuariosView.vue'),
          meta: { apenasAdmin: true },
        },
      ],
    },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()
  await auth.carregar()

  if (to.meta.publica) {
    return auth.logado ? { name: 'catalogo' } : true
  }
  if (!auth.logado) {
    return { name: 'login', query: to.fullPath !== '/' ? { proximo: to.fullPath } : {} }
  }
  if (to.meta.apenasAdmin && !auth.ehAdmin) {
    return { name: 'catalogo' }
  }
  return true
})

export default router
