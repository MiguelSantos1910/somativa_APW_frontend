<template>
  <article class="cartao">
    <div class="poster">
      <img v-if="filme.imagem" :src="filme.imagem" :alt="`Pôster de ${filme.nome}`" loading="lazy" />
      <div v-else class="sem-imagem">
        <IconeBase nome="filme" :tamanho="40" />
      </div>

      <button
        type="button"
        class="favorito"
        :class="{ ativo: filme.is_favorite }"
        :aria-label="filme.is_favorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'"
        :aria-pressed="filme.is_favorite"
        @click="$emit('favoritar', filme)"
      >
        <IconeBase :nome="filme.is_favorite ? 'coracao-cheio' : 'coracao'" :tamanho="20" />
      </button>

      <span class="nota"><IconeBase nome="estrela" :tamanho="14" /> {{ notaFormatada }}</span>
    </div>

    <div class="info">
      <h3 :title="filme.nome">{{ filme.nome }}</h3>
      <p class="meta">
        <span>{{ filme.ano_lancamento }}</span>
        <span aria-hidden="true">·</span>
        <span><IconeBase nome="relogio" :tamanho="13" /> {{ duracaoFormatada }}</span>
      </p>
      <span class="genero">{{ filme.genero }}</span>
      <p v-if="filme.sinopse" class="sinopse" :class="{ expandida }">{{ filme.sinopse }}</p>
      <button
        v-if="filme.sinopse.length > 110"
        type="button"
        class="ler-mais"
        :aria-expanded="expandida"
        @click="expandida = !expandida"
      >
        {{ expandida ? 'Mostrar menos' : 'Ler sinopse completa' }}
      </button>

      <div v-if="podeEditar" class="acoes">
        <BotaoBase variante="glass" tamanho="pequeno" :para="{ name: 'filme-editar', params: { id: filme.id } }">
          <IconeBase nome="editar" :tamanho="14" /> Editar
        </BotaoBase>
        <BotaoBase variante="danger" tamanho="pequeno" @click="$emit('excluir', filme)">
          <IconeBase nome="lixeira" :tamanho="14" /> Excluir
        </BotaoBase>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Filme } from '@/types'
import BotaoBase from './BotaoBase.vue'
import IconeBase from './IconeBase.vue'

const props = defineProps<{ filme: Filme; podeEditar?: boolean }>()

const expandida = ref(false)

defineEmits<{
  favoritar: [filme: Filme]
  excluir: [filme: Filme]
}>()

const notaFormatada = computed(() => Number(props.filme.nota).toLocaleString('pt-BR', { minimumFractionDigits: 1 }))

const duracaoFormatada = computed(() => {
  const h = Math.floor(props.filme.duracao / 60)
  const m = props.filme.duracao % 60
  if (!h) return `${m}min`
  return m ? `${h}h ${m}min` : `${h}h`
})
</script>

<style scoped>
.cartao {
  display: flex;
  flex-direction: column;
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}

.cartao:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-card);
}

.poster {
  position: relative;
  aspect-ratio: 2 / 3;
  background: var(--color-bg-elevated);
}

.poster img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.sem-imagem {
  display: grid;
  place-items: center;
  height: 100%;
  color: var(--color-text-muted);
  background: linear-gradient(160deg, rgba(59, 130, 246, 0.18), rgba(99, 102, 241, 0.06));
}

.favorito {
  position: absolute;
  top: 10px;
  right: 10px;
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: 1px solid var(--glass-border);
  background: rgba(7, 11, 22, 0.6);
  backdrop-filter: var(--glass-blur);
  color: #fff;
  cursor: pointer;
  transition:
    transform 0.15s,
    color 0.15s;
}

.favorito:hover {
  transform: scale(1.08);
}

.favorito.ativo {
  color: var(--color-heart);
}

.nota {
  position: absolute;
  left: 10px;
  bottom: 10px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px;
  border-radius: 999px;
  background: rgba(7, 11, 22, 0.7);
  backdrop-filter: var(--glass-blur);
  font-size: 13px;
  font-weight: 600;
  color: var(--color-star);
}

.info {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 14px;
  flex: 1;
}

h3 {
  font-size: 16px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.meta {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--color-text-muted);
}

.meta span {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.genero {
  align-self: flex-start;
  padding: 2px 10px;
  border-radius: 999px;
  font-size: 12px;
  background: rgba(59, 130, 246, 0.15);
  color: #93c5fd;
}

.sinopse {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  font-size: 13px;
  line-height: 1.5;
  color: var(--color-text-muted);
}

.sinopse.expandida {
  display: block;
}

.ler-mais {
  align-self: flex-start;
  padding: 0;
  border: none;
  background: none;
  font-size: 12px;
  font-weight: 500;
  color: var(--color-primary);
  cursor: pointer;
}

.ler-mais:hover {
  text-decoration: underline;
}

.acoes {
  display: flex;
  gap: 8px;
  margin-top: auto;
  padding-top: 8px;
}

.acoes > * {
  flex: 1;
}
</style>
