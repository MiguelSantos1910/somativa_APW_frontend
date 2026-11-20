<template>
  <svg
    :width="tamanho"
    :height="tamanho"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <template v-if="nome === 'info'">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v6M12 7.5v.5" />
    </template>
    <template v-else-if="nome === 'busca'">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </template>
    <path
      v-else-if="nome === 'coracao' || nome === 'coracao-cheio'"
      d="M12 20.5s-7.5-4.6-9.3-9.4C1.5 7.8 3.6 4.5 7 4.5c2 0 3.4 1.1 5 3 1.6-1.9 3-3 5-3 3.4 0 5.5 3.3 4.3 6.6-1.8 4.8-9.3 9.4-9.3 9.4Z"
      :fill="nome === 'coracao-cheio' ? 'currentColor' : 'none'"
    />
    <path
      v-else-if="nome === 'estrela'"
      d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3l-5.6 2.9 1.1-6.2L3 9.6l6.2-.9L12 3Z"
      fill="currentColor"
    />
    <template v-else-if="nome === 'relogio'">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </template>
    <template v-else-if="nome === 'filme'">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M7 3v18M17 3v18M3 8h4M3 16h4M17 8h4M17 16h4M3 12h18" />
    </template>
    <template v-else-if="nome === 'editar'">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z" />
    </template>
    <template v-else-if="nome === 'lixeira'">
      <path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14" />
      <path d="M10 11v5M14 11v5" />
    </template>
    <path v-else-if="nome === 'mais'" d="M12 5v14M5 12h14" />
    <template v-else-if="nome === 'sair'">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="m16 17 5-5-5-5M21 12H9" />
    </template>
    <template v-else-if="nome === 'usuarios'">
      <circle cx="9" cy="8" r="4" />
      <path d="M2 21a7 7 0 0 1 14 0" />
      <path d="M16 4a4 4 0 0 1 0 8M22 21a7 7 0 0 0-4-6.3" />
    </template>
    <path v-else-if="nome === 'imagem'" d="M3 5h18v14H3zM3 16l5-5 4 4 3-3 6 6M15.5 8.5h.01" />
    <path v-else-if="nome === 'voltar'" d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
</template>

<script setup lang="ts">
export type NomeIcone =
  | 'info'
  | 'busca'
  | 'coracao'
  | 'coracao-cheio'
  | 'estrela'
  | 'relogio'
  | 'filme'
  | 'editar'
  | 'lixeira'
  | 'mais'
  | 'sair'
  | 'usuarios'
  | 'imagem'
  | 'voltar'

withDefaults(
  defineProps<{
    nome: NomeIcone
    tamanho?: number
  }>(),
  { tamanho: 24 },
)
</script>
