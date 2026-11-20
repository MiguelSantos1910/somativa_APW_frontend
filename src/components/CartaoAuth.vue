<template>
  <main class="pagina-auth">
    <div class="cartao glass">
      <div class="marca">
        <span class="logo"><IconeBase nome="filme" :tamanho="26" /></span>
        <span class="nome">MangeFlix</span>
      </div>
      <h1>{{ titulo }}</h1>
      <p class="subtitulo">{{ subtitulo }}</p>
      <slot />
    </div>
  </main>
</template>

<script setup lang="ts">
import IconeBase from './IconeBase.vue'

defineProps<{ titulo: string; subtitulo: string }>()
</script>

<style scoped>
.pagina-auth {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 32px 16px;
}

.cartao {
  width: 100%;
  max-width: 420px;
  padding: 36px 28px;
  box-shadow: var(--shadow-card);
}

.marca {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 28px;
}

.logo {
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  border-radius: var(--radius-md);
  background: var(--gradient-primary);
  color: #fff;
}

.nome {
  font-size: 22px;
  font-weight: 700;
  color: #fff;
}

h1 {
  font-size: 24px;
}

.subtitulo {
  color: var(--color-text-muted);
  margin: 4px 0 24px;
}
</style>
