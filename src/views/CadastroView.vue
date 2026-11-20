<template>
  <CartaoAuth titulo="Criar conta" subtitulo="Cadastre-se para montar sua lista de favoritos.">
    <form class="formulario" @submit.prevent="cadastrar">
      <p v-if="erroGeral" class="alerta erro" role="alert">{{ erroGeral }}</p>

      <div class="linha">
        <CampoTexto v-model="form.first_name" rotulo="Nome" autocomplete="given-name" obrigatorio :erro="erros.first_name" />
        <CampoTexto v-model="form.last_name" rotulo="Sobrenome" autocomplete="family-name" :erro="erros.last_name" />
      </div>
      <CampoTexto v-model="form.username" rotulo="Usuário" autocomplete="username" obrigatorio :erro="erros.username" />
      <CampoTexto v-model="form.email" rotulo="E-mail" tipo="email" autocomplete="email" obrigatorio :erro="erros.email" />
      <CampoTexto
        v-model="form.password"
        rotulo="Senha"
        tipo="password"
        autocomplete="new-password"
        obrigatorio
        dica="Mínimo de 8 caracteres, não pode ser só números."
        :erro="erros.password"
      />
      <CampoTexto
        v-model="confirmacao"
        rotulo="Confirmar senha"
        tipo="password"
        autocomplete="new-password"
        obrigatorio
        :erro="erros.confirmacao"
      />

      <BotaoBase tipo="submit" largura-total :carregando="enviando">Criar conta</BotaoBase>
    </form>

    <p class="rodape">
      Já tem conta? <RouterLink :to="{ name: 'login' }">Entrar</RouterLink>
    </p>
  </CartaoAuth>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import BotaoBase from '@/components/BotaoBase.vue'
import CampoTexto from '@/components/CampoTexto.vue'
import CartaoAuth from '@/components/CartaoAuth.vue'
import { ApiError } from '@/services/api'
import { useAuthStore } from '@/stores/auth'
import type { CadastroUsuario } from '@/types'

const auth = useAuthStore()
const router = useRouter()

const form = reactive<CadastroUsuario>({
  first_name: '',
  last_name: '',
  username: '',
  email: '',
  password: '',
})
const confirmacao = ref('')
const erros = reactive<Record<string, string>>({})
const erroGeral = ref('')
const enviando = ref(false)

async function cadastrar() {
  for (const chave of Object.keys(erros)) delete erros[chave]
  erroGeral.value = ''

  if (form.password !== confirmacao.value) {
    erros.confirmacao = 'As senhas não conferem.'
    return
  }

  enviando.value = true
  try {
    const username = form.username.trim()
    await auth.cadastrar({ ...form, username, email: form.email.trim() })
    router.push({ name: 'login', query: { cadastro: 'ok', usuario: username } })
  } catch (e) {
    if (e instanceof ApiError && e.status === 400 && e.dados && typeof e.dados === 'object') {
      for (const [campo, msgs] of Object.entries(e.dados as Record<string, unknown>)) {
        const texto = Array.isArray(msgs) ? msgs.join(' ') : String(msgs)
        if (campo in form) erros[campo] = texto
        else erroGeral.value = texto
      }
    } else {
      erroGeral.value = (e as Error).message
    }
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

.linha {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

@media (max-width: 420px) {
  .linha {
    grid-template-columns: 1fr;
  }
}

.rodape {
  margin-top: 20px;
  text-align: center;
  font-size: 14px;
  color: var(--color-text-muted);
}
</style>
