import { ref } from 'vue'
import { defineStore } from 'pinia'
import { api } from '@/services/api'
import type { Filme, FiltrosFilme } from '@/types'

export interface DadosFilme {
  nome: string
  genero: string
  sinopse: string
  nota: string
  duracao: number
  ano_lancamento: number
  imagem?: File | null
}

function paraFormData(dados: Partial<DadosFilme>): FormData {
  const form = new FormData()
  for (const [chave, valor] of Object.entries(dados)) {
    if (valor === undefined || valor === null) continue
    form.append(chave, valor instanceof File ? valor : String(valor))
  }
  return form
}

export const useFilmesStore = defineStore('filmes', () => {
  const lista = ref<Filme[]>([])
  const carregando = ref(false)
  const erro = ref('')

  async function buscar(filtros: FiltrosFilme = {}) {
    carregando.value = true
    erro.value = ''
    try {
      lista.value = await api<Filme[]>('/filmes/', {
        params: {
          search: filtros.search,
          genero: filtros.genero,
          ordering: filtros.ordering,
          favoritos: filtros.favoritos ? 'true' : undefined,
        },
      })
    } catch (e) {
      erro.value = (e as Error).message
    } finally {
      carregando.value = false
    }
  }

  async function generos(): Promise<string[]> {
    const todos = await api<Filme[]>('/filmes/')
    return [...new Set(todos.map((f) => f.genero))].sort((a, b) => a.localeCompare(b, 'pt-BR'))
  }

  function obter(id: string) {
    return api<Filme>(`/filmes/${id}/`)
  }

  function criar(dados: DadosFilme) {
    return api<Filme>('/filmes/', { method: 'POST', body: paraFormData(dados) })
  }

  function atualizar(id: string, dados: Partial<DadosFilme>) {
    return api<Filme>(`/filmes/${id}/`, { method: 'PATCH', body: paraFormData(dados) })
  }

  async function excluir(id: string) {
    await api(`/filmes/${id}/`, { method: 'DELETE' })
    lista.value = lista.value.filter((f) => f.id !== id)
  }

  async function alternarFavorito(filme: Filme, removerDaLista = false) {
    const anterior = filme.is_favorite
    filme.is_favorite = !anterior
    try {
      const resp = await api<{ is_favorite: boolean }>(`/filmes/${filme.id}/favoritar/`, {
        method: anterior ? 'DELETE' : 'POST',
      })
      filme.is_favorite = resp.is_favorite
      if (removerDaLista && !resp.is_favorite) {
        lista.value = lista.value.filter((f) => f.id !== filme.id)
      }
    } catch (e) {
      filme.is_favorite = anterior
      throw e
    }
  }

  return { lista, carregando, erro, buscar, generos, obter, criar, atualizar, excluir, alternarFavorito }
})
