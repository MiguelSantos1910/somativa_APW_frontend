<template>
  <header class="topo">
    <div class="container barra">
      <RouterLink :to="{ name: 'catalogo' }" class="marca">
        <span class="logo"><IconeBase nome="filme" :tamanho="20" /></span>
        MangeFlix
      </RouterLink>

      <nav class="links" aria-label="Principal">
        <RouterLink :to="{ name: 'catalogo' }" exact-active-class="ativo">Catálogo</RouterLink>
        <RouterLink :to="{ name: 'favoritos' }" active-class="ativo">Favoritos</RouterLink>
        <template v-if="auth.ehAdmin">
          <RouterLink :to="{ name: 'filme-novo' }" active-class="ativo">Novo filme</RouterLink>
          <RouterLink :to="{ name: 'usuarios' }" active-class="ativo">Usuários</RouterLink>
        </template>
      </nav>

      <div class="usuario">
        <span class="saudacao">
          {{ auth.nomeExibicao }}
          <small v-if="auth.ehAdmin" class="selo">Admin</small>
        </span>
        <button type="button" class="sair" aria-label="Sair" title="Sair" @click="sair">
          <IconeBase nome="sair" :tamanho="18" />
        </button>
      </div>
    </div>
  </header>

  <main class="container conteudo">
    <RouterView />
  </main>
</template>

<script setup lang="ts">
import { RouterLink, RouterView, useRouter } from 'vue-router'
import IconeBase from '@/components/IconeBase.vue'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()

async function sair() {
  await auth.logout()
  router.push({ name: 'login' })
}
</script>

<style scoped>
.topo {
  position: sticky;
  top: 0;
  z-index: 10;
  background: rgba(7, 11, 22, 0.72);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border-bottom: 1px solid var(--glass-border);
}

.barra {
  display: flex;
  align-items: center;
  gap: 24px;
  min-height: 64px;
  flex-wrap: wrap;
  padding-top: 8px;
  padding-bottom: 8px;
}

.marca {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 19px;
  font-weight: 700;
  color: #fff;
}

.marca:hover {
  text-decoration: none;
}

.logo {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border-radius: var(--radius-sm);
  background: var(--gradient-primary);
}

.links {
  display: flex;
  gap: 4px;
  flex: 1;
  overflow-x: auto;
}

.links a {
  padding: 6px 12px;
  border-radius: var(--radius-sm);
  color: var(--color-text-muted);
  font-weight: 500;
  white-space: nowrap;
}

.links a:hover {
  color: #fff;
  text-decoration: none;
  background: var(--glass-bg);
}

.links a.ativo {
  color: #fff;
  background: var(--glass-bg-strong);
}

.usuario {
  display: flex;
  align-items: center;
  gap: 10px;
}

.saudacao {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
}

.selo {
  padding: 1px 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
  background: var(--gradient-primary);
  color: #fff;
}

.sair {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--glass-border);
  background: var(--glass-bg);
  cursor: pointer;
}

.sair:hover {
  background: rgba(239, 68, 68, 0.15);
  color: #fca5a5;
}

.conteudo {
  padding-top: 32px;
  padding-bottom: 48px;
}

@media (max-width: 720px) {
  .barra {
    gap: 12px;
  }

  .links {
    order: 3;
    flex-basis: 100%;
  }

  .usuario {
    margin-left: auto;
  }
}
</style>
