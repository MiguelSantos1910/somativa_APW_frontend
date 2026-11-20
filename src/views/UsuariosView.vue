<template>
  <section>
    <h1 class="titulo-pagina">Usuários</h1>
    <p class="subtitulo-pagina">Gerencie o papel e o acesso de cada conta.</p>

    <p v-if="mensagem" class="alerta" :class="mensagem.tipo" role="status">{{ mensagem.texto }}</p>

    <p v-if="carregando" class="vazio">Carregando…</p>

    <div v-else class="tabela-wrap glass">
      <table>
        <thead>
          <tr>
            <th>Usuário</th>
            <th>E-mail</th>
            <th>Papel</th>
            <th>Ativo</th>
            <th><span class="sr-only">Ações</span></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in usuarios" :key="`${u.id}-${versao}`" :class="{ inativo: !u.is_active }">
            <td>
              <strong>{{ nomeCompleto(u) }}</strong>
              <small>@{{ u.username }}<template v-if="u.id === auth.usuario?.id"> · você</template></small>
            </td>
            <td class="email">{{ u.email || '—' }}</td>
            <td>
              <select
                :value="u.papel"
                :disabled="salvando === u.id"
                :aria-label="`Papel de ${u.username}`"
                @change="alterar(u, { papel: ($event.target as HTMLSelectElement).value as Papel })"
              >
                <option value="ESPECTADOR">Espectador</option>
                <option value="ADMIN">Admin</option>
              </select>
            </td>
            <td>
              <label class="chave">
                <input
                  type="checkbox"
                  :checked="u.is_active"
                  :disabled="salvando === u.id || u.id === auth.usuario?.id"
                  :aria-label="`${u.username} ativo`"
                  @change="alterar(u, { is_active: ($event.target as HTMLInputElement).checked })"
                />
                <span />
              </label>
            </td>
            <td class="acoes">
              <BotaoBase
                v-if="u.id !== auth.usuario?.id"
                variante="danger"
                tamanho="pequeno"
                :desabilitado="salvando === u.id"
                @click="excluir(u)"
              >
                <IconeBase nome="lixeira" :tamanho="14" /> Excluir
              </BotaoBase>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import BotaoBase from '@/components/BotaoBase.vue'
import IconeBase from '@/components/IconeBase.vue'
import { api } from '@/services/api'
import { useAuthStore } from '@/stores/auth'
import type { Papel, Usuario } from '@/types'

const auth = useAuthStore()

const usuarios = ref<Usuario[]>([])
const carregando = ref(true)
const salvando = ref<number | null>(null)
const versao = ref(0)
const mensagem = ref<{ tipo: 'erro' | 'sucesso'; texto: string } | null>(null)

let temporizador: ReturnType<typeof setTimeout> | undefined
function avisar(tipo: 'erro' | 'sucesso', texto: string) {
  mensagem.value = { tipo, texto }
  clearTimeout(temporizador)
  temporizador = setTimeout(() => (mensagem.value = null), 4000)
}

function nomeCompleto(u: Usuario) {
  return `${u.first_name} ${u.last_name}`.trim() || u.username
}

onMounted(async () => {
  try {
    usuarios.value = await api<Usuario[]>('/usuarios/')
  } catch (e) {
    avisar('erro', (e as Error).message)
  } finally {
    carregando.value = false
  }
})

async function alterar(usuario: Usuario, dados: Partial<Pick<Usuario, 'papel' | 'is_active'>>) {
  salvando.value = usuario.id
  try {
    await api(`/usuarios/${usuario.id}/`, { method: 'PATCH', body: dados })
    Object.assign(usuario, dados)
    avisar('sucesso', `${usuario.username} atualizado.`)
  } catch (e) {
    versao.value++
    avisar('erro', (e as Error).message)
  } finally {
    salvando.value = null
  }
}

async function excluir(usuario: Usuario) {
  if (!confirm(`Excluir a conta de ${usuario.username}? Essa ação não pode ser desfeita.`)) return
  salvando.value = usuario.id
  try {
    await api(`/usuarios/${usuario.id}/`, { method: 'DELETE' })
    usuarios.value = usuarios.value.filter((u) => u.id !== usuario.id)
    avisar('sucesso', `${usuario.username} excluído.`)
  } catch (e) {
    avisar('erro', (e as Error).message)
  } finally {
    salvando.value = null
  }
}
</script>

<style scoped>
.alerta {
  margin-bottom: 16px;
}

.tabela-wrap {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  min-width: 640px;
}

th,
td {
  padding: 14px 16px;
  text-align: left;
  vertical-align: middle;
}

th {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--color-text-muted);
  border-bottom: 1px solid var(--glass-border);
}

tbody tr + tr td {
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

tr.inativo td:not(:nth-child(4)) {
  opacity: 0.5;
}

td strong {
  display: block;
  font-weight: 500;
  color: #fff;
}

td small {
  color: var(--color-text-muted);
}

.email {
  color: var(--color-text-muted);
}

select {
  padding: 7px 10px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--glass-border);
  background: var(--color-bg-elevated);
  cursor: pointer;
}

.acoes {
  text-align: right;
}

.chave {
  position: relative;
  display: inline-block;
  width: 42px;
  height: 24px;
}

.chave input {
  position: absolute;
  inset: 0;
  opacity: 0;
  margin: 0;
  cursor: pointer;
  z-index: 1;
}

.chave input:disabled {
  cursor: not-allowed;
}

.chave span {
  position: absolute;
  inset: 0;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.15);
  transition: background 0.2s;
}

.chave span::after {
  content: '';
  position: absolute;
  top: 3px;
  left: 3px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #fff;
  transition: transform 0.2s;
}

.chave input:checked + span {
  background: var(--color-success);
}

.chave input:checked + span::after {
  transform: translateX(18px);
}

.chave input:focus-visible + span {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.chave input:disabled + span {
  opacity: 0.5;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
}
</style>
