<template>
  <component
    :is="para ? RouterLink : 'button'"
    :to="para"
    :type="para ? undefined : tipo"
    :disabled="para ? undefined : desabilitado || carregando"
    :class="['botao', variante, tamanho, { total: larguraTotal }]"
  >
    <span v-if="carregando" class="spinner" aria-hidden="true" />
    <slot />
  </component>
</template>

<script setup lang="ts">
import { RouterLink, type RouteLocationRaw } from 'vue-router'

withDefaults(
  defineProps<{
    variante?: 'primary' | 'glass' | 'danger'
    tamanho?: 'normal' | 'pequeno'
    tipo?: 'button' | 'submit'
    larguraTotal?: boolean
    carregando?: boolean
    desabilitado?: boolean
    para?: RouteLocationRaw
  }>(),
  {
    variante: 'primary',
    tamanho: 'normal',
    tipo: 'button',
    larguraTotal: false,
    carregando: false,
    desabilitado: false,
    para: undefined,
  },
)
</script>

<style scoped>
.botao {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: var(--radius-md);
  border: 1px solid transparent;
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
  text-decoration: none;
  transition:
    transform 0.15s,
    filter 0.15s,
    background 0.15s;
}

.botao:hover {
  transform: translateY(-1px);
  filter: brightness(1.1);
  text-decoration: none;
}

.botao:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  filter: none;
}

.pequeno {
  padding: 8px 14px;
  font-size: 13px;
  border-radius: var(--radius-sm);
}

.primary {
  background: var(--gradient-primary);
  box-shadow: 0 8px 24px rgba(37, 99, 235, 0.35);
}

.glass {
  background: var(--glass-bg-strong);
  border-color: var(--glass-border);
  backdrop-filter: var(--glass-blur);
}

.danger {
  background: rgba(239, 68, 68, 0.12);
  border-color: rgba(239, 68, 68, 0.5);
  color: #fca5a5;
}

.total {
  width: 100%;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.35);
  border-top-color: #fff;
  border-radius: 50%;
  animation: girar 0.7s linear infinite;
}

@keyframes girar {
  to {
    transform: rotate(360deg);
  }
}
</style>
