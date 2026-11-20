import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { api, tokens } from '@/services/api'
import type { CadastroUsuario, Usuario } from '@/types'

export const useAuthStore = defineStore('auth', () => {
  const usuario = ref<Usuario | null>(null)
  const carregado = ref(false)

  const logado = computed(() => usuario.value !== null)
  const ehAdmin = computed(() => usuario.value?.papel === 'ADMIN')
  const nomeExibicao = computed(() => usuario.value?.first_name || usuario.value?.username || '')

  async function carregar() {
    if (carregado.value) return
    carregado.value = true
    if (!tokens.access && !tokens.refresh) return
    try {
      usuario.value = await api<Usuario>('/me/')
    } catch {
      tokens.limpar()
      usuario.value = null
    }
  }

  async function login(username: string, password: string) {
    const dados = await api<{ access: string; refresh: string }>('/token/', {
      method: 'POST',
      body: { username, password },
      autenticado: false,
    })
    tokens.salvar(dados.access, dados.refresh)
    usuario.value = await api<Usuario>('/me/')
    carregado.value = true
  }

  async function cadastrar(dados: CadastroUsuario) {
    await api('/usuarios/', { method: 'POST', body: dados, autenticado: false })
  }

  async function logout() {
    const refresh = tokens.refresh
    if (refresh) {
      try {
        await api('/logout/', { method: 'POST', body: { refresh } })
      } catch {}
    }
    limparSessao()
  }

  function limparSessao() {
    tokens.limpar()
    usuario.value = null
  }

  return { usuario, logado, ehAdmin, nomeExibicao, carregar, login, cadastrar, logout, limparSessao }
})
