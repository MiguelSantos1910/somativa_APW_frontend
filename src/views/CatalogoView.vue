<template>
  <section>
    <div class="cabecalho">
      <div>
        <h1 class="titulo-pagina">{{ apenasFavoritos ? 'Meus favoritos' : 'Catálogo' }}</h1>
        <p class="subtitulo-pagina">
          {{ apenasFavoritos ? 'Os filmes que você marcou com o coração.' : 'Explore os filmes disponíveis.' }}
        </p>
      </div>
      <BotaoBase v-if="auth.ehAdmin && !apenasFavoritos" :para="{ name: 'filme-novo' }">
        <IconeBase nome="mais" :tamanho="18" /> Novo filme
      </BotaoBase>
    </div>

    <div class="filtros glass">
      <label class="busca">
        <IconeBase nome="busca" :tamanho="18" />
        <input v-model="busca" type="search" placeholder="Buscar por nome ou gênero" aria-label="Buscar filmes" />
      </label>
      <select v-model="ordenacao" aria-label="Ordenar">
        <option value="nome">Nome (A–Z)</option>
        <option value="-nota">Maior nota</option>
        <option value="-ano_lancamento">Mais recentes</option>
        <option value="ano_lancamento">Mais antigos</option>
      </select>
    </div>

    <div v-if="generos.length" class="generos" role="group" aria-label="Filtrar por gênero">
      <button type="button" class="chip" :class="{ ativo: !genero }" :aria-pressed="!genero" @click="genero = ''">
        Todos
      </button>
      <button
        v-for="g in generos"
        :key="g"
        type="button"
        class="chip"
        :class="{ ativo: genero === g }"
        :aria-pressed="genero === g"
        @click="genero = g"
      >
        {{ g }}
      </button>
    </div>

    <p v-if="aviso" class="alerta erro" role="alert">{{ aviso }}</p>
    <p v-if="filmes.erro" class="alerta erro" role="alert">{{ filmes.erro }}</p>

    <div v-if="filmes.carregando && !filmes.lista.length" class="grade">
      <div v-for="n in 8" :key="n" class="esqueleto" />
    </div>

    <div v-else-if="!filmes.lista.length && !filmes.erro" class="vazio glass">
      <IconeBase :nome="apenasFavoritos ? 'coracao' : 'filme'" :tamanho="40" />
      <p v-if="temFiltro">Nenhum filme encontrado com esses filtros.</p>
      <p v-else-if="apenasFavoritos">
        Você ainda não favoritou nenhum filme.
        <RouterLink :to="{ name: 'catalogo' }">Ver catálogo</RouterLink>
      </p>
      <p v-else>Nenhum filme cadastrado ainda.</p>
    </div>

    <div v-else class="grade" :class="{ atualizando: filmes.carregando }">
      <CartaoFilme
        v-for="filme in filmes.lista"
        :key="filme.id"
        :filme="filme"
        :pode-editar="auth.ehAdmin"
        @favoritar="favoritar"
        @excluir="excluir"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import BotaoBase from '@/components/BotaoBase.vue'
import CartaoFilme from '@/components/CartaoFilme.vue'
import IconeBase from '@/components/IconeBase.vue'
import { useAuthStore } from '@/stores/auth'
import { useFilmesStore } from '@/stores/filmes'
import type { Filme } from '@/types'

const props = defineProps<{ apenasFavoritos?: boolean }>()

const auth = useAuthStore()
const filmes = useFilmesStore()

const busca = ref('')
const genero = ref('')
const ordenacao = ref('nome')
const generos = ref<string[]>([])
const aviso = ref('')

const temFiltro = computed(() => !!busca.value.trim() || !!genero.value)

function carregar() {
  return filmes.buscar({
    search: busca.value.trim(),
    genero: genero.value,
    ordering: ordenacao.value,
    favoritos: props.apenasFavoritos,
  })
}

let atraso: ReturnType<typeof setTimeout> | undefined
watch(busca, () => {
  clearTimeout(atraso)
  atraso = setTimeout(carregar, 300)
})
watch([genero, ordenacao, () => props.apenasFavoritos], carregar)

onMounted(async () => {
  carregar()
  try {
    generos.value = await filmes.generos()
  } catch {}
})

function mostrarAviso(texto: string) {
  aviso.value = texto
  setTimeout(() => (aviso.value = ''), 4000)
}

async function favoritar(filme: Filme) {
  try {
    await filmes.alternarFavorito(filme, props.apenasFavoritos)
  } catch (e) {
    mostrarAviso(`Não foi possível atualizar o favorito: ${(e as Error).message}`)
  }
}

async function excluir(filme: Filme) {
  if (!confirm(`Excluir "${filme.nome}"? Essa ação não pode ser desfeita.`)) return
  try {
    await filmes.excluir(filme.id)
  } catch (e) {
    mostrarAviso(`Não foi possível excluir: ${(e as Error).message}`)
  }
}
</script>

<style scoped>
.cabecalho {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.filtros {
  display: flex;
  gap: 12px;
  padding: 12px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.busca {
  flex: 1 1 260px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 12px;
  border-radius: var(--radius-md);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--glass-border);
  color: var(--color-text-muted);
}

.busca:focus-within {
  border-color: var(--color-primary);
}

.busca input {
  flex: 1;
  min-width: 0;
  padding: 11px 0;
  border: none;
  background: none;
  outline: none;
  color: var(--color-text);
}

select {
  flex: 0 1 200px;
  padding: 11px 12px;
  border-radius: var(--radius-md);
  border: 1px solid var(--glass-border);
  background: var(--color-bg-elevated);
  cursor: pointer;
}

.generos {
  display: flex;
  gap: 8px;
  margin: -8px 0 24px;
  overflow-x: auto;
  padding-bottom: 4px;
}

.chip {
  flex-shrink: 0;
  padding: 7px 16px;
  border-radius: 999px;
  border: 1px solid var(--glass-border);
  background: var(--glass-bg);
  color: var(--color-text-muted);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition:
    background 0.15s,
    color 0.15s;
}

.chip:hover {
  color: #fff;
  background: var(--glass-bg-strong);
}

.chip.ativo {
  color: #fff;
  border-color: transparent;
  background: var(--gradient-primary);
}

.alerta {
  margin-bottom: 16px;
}

.grade {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
  gap: 20px;
  transition: opacity 0.2s;
}

.grade.atualizando {
  opacity: 0.6;
}

.esqueleto {
  aspect-ratio: 2 / 3.6;
  border-radius: var(--radius-lg);
  background: linear-gradient(90deg, var(--glass-bg) 0%, var(--glass-bg-strong) 50%, var(--glass-bg) 100%);
  background-size: 200% 100%;
  animation: brilho 1.4s ease-in-out infinite;
}

@keyframes brilho {
  from {
    background-position: 200% 0;
  }
  to {
    background-position: -200% 0;
  }
}

.vazio {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

@media (max-width: 480px) {
  .grade {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  select {
    flex: 1 1 140px;
  }
}
</style>
