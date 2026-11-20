<template>
  <CartaoAuth titulo="Entrar" subtitulo="Acesse sua conta para ver o catálogo.">
    <form class="formulario" @submit.prevent="entrar">
      <p v-if="sucesso" class="alerta sucesso" role="status">{{ sucesso }}</p>
      <p v-if="erro" class="alerta erro" role="alert">{{ erro }}</p>

      <CampoTexto v-model="username" rotulo="Usuário ou e-mail" autocomplete="username" obrigatorio />
      <CampoTexto v-model="password" rotulo="Senha" tipo="password" autocomplete="current-password" obrigatorio />

      <BotaoBase tipo="submit" largura-total :carregando="enviando">Entrar</BotaoBase>
    </form>

    <p class="rodape">
      Não tem conta? <RouterLink :to="{ name: 'cadastro' }">Cadastre-se</RouterLink>
    </p>
  </CartaoAuth>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import BotaoBase from '@/components/BotaoBase.vue'
import CampoTexto from '@/components/CampoTexto.vue'
import CartaoAuth from '@/components/CartaoAuth.vue'
import { ApiError } from '@/services/api'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()

const username = ref(typeof route.query.usuario === 'string' ? route.query.usuario : '')
const password = ref('')
const sucesso = ref(route.query.cadastro === 'ok' ? 'Conta criada com sucesso! Entre com seus dados.' : '')
const erro = ref('')
const enviando = ref(false)

async function entrar() {
  erro.value = ''
  sucesso.value = ''
  enviando.value = true
  try {
    await auth.login(username.value.trim(), password.value)
    const proximo = typeof route.query.proximo === 'string' ? route.query.proximo : '/'
    router.push(proximo.startsWith('/') ? proximo : '/')
  } catch (e) {
    erro.value =
      e instanceof ApiError && e.status === 401 ? 'Usuário, e-mail ou senha incorretos.' : (e as Error).message
  } finally {
    enviando.value = false
  }
}
</script>

<style scoped>
.formulario {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.rodape {
  margin-top: 20px;
  text-align: center;
  font-size: 14px;
  color: var(--color-text-muted);
}
</style>
