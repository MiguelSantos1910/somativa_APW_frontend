<template>
  <section class="pagina">
    <RouterLink :to="{ name: 'catalogo' }" class="voltar"><IconeBase nome="voltar" :tamanho="16" /> Voltar ao catálogo</RouterLink>

    <h1 class="titulo-pagina">{{ id ? 'Editar filme' : 'Novo filme' }}</h1>
    <p class="subtitulo-pagina">
      {{ id ? 'Atualize as informações do filme.' : 'Preencha os dados para adicionar ao catálogo.' }}
    </p>

    <p v-if="carregando" class="vazio">Carregando…</p>

    <form v-else class="formulario glass" @submit.prevent="salvar">
      <p v-if="erroGeral" class="alerta erro" role="alert">{{ erroGeral }}</p>

      <div class="colunas">
        <div class="upload">
          <span class="rotulo">Pôster</span>
          <label class="area-poster" :class="{ com: !!previa }">
            <img v-if="previa" :src="previa" alt="Prévia do pôster" />
            <span v-else class="placeholder">
              <IconeBase nome="imagem" :tamanho="32" />
              Clique para escolher uma imagem
            </span>
            <input type="file" accept="image/*" class="oculto" @change="escolherImagem" />
          </label>
          <span v-if="erros.imagem" class="erro">{{ erros.imagem }}</span>
        </div>

        <div class="campos">
          <CampoTexto v-model="form.nome" rotulo="Nome" obrigatorio :erro="erros.nome" />
          <CampoTexto v-model="form.genero" rotulo="Gênero" obrigatorio placeholder="Ex.: Drama" :erro="erros.genero" />
          <CampoTexto v-model="form.sinopse" rotulo="Sinopse" multilinha obrigatorio :erro="erros.sinopse" />
          <div class="linha">
            <CampoTexto
              v-model="form.nota"
              rotulo="Nota (0 a 10)"
              tipo="number"
              :min="0"
              :max="10"
              step="0.1"
              obrigatorio
              :erro="erros.nota"
            />
            <CampoTexto
              v-model="form.duracao"
              rotulo="Duração (min)"
              tipo="number"
              :min="1"
              obrigatorio
              :erro="erros.duracao"
            />
            <CampoTexto
              v-model="form.ano_lancamento"
              rotulo="Ano"
              tipo="number"
              :min="1888"
              :max="anoAtual + 5"
              obrigatorio
              :erro="erros.ano_lancamento"
            />
          </div>

          <div class="acoes">
            <BotaoBase variante="glass" :para="{ name: 'catalogo' }">Cancelar</BotaoBase>
            <BotaoBase tipo="submit" :carregando="enviando">{{ id ? 'Salvar alterações' : 'Cadastrar filme' }}</BotaoBase>
          </div>
        </div>
      </div>
    </form>
  </section>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import BotaoBase from '@/components/BotaoBase.vue'
import CampoTexto from '@/components/CampoTexto.vue'
import IconeBase from '@/components/IconeBase.vue'
import { ApiError } from '@/services/api'
import { useFilmesStore } from '@/stores/filmes'

const props = defineProps<{ id?: string }>()

const filmes = useFilmesStore()
const router = useRouter()
const anoAtual = new Date().getFullYear()

const form = reactive({
  nome: '',
  genero: '',
  sinopse: '',
  nota: '' as string | number,
  duracao: '' as string | number,
  ano_lancamento: '' as string | number,
})
const imagem = ref<File | null>(null)
const previa = ref<string | null>(null)
const erros = reactive<Record<string, string>>({})
const erroGeral = ref('')
const carregando = ref(false)
const enviando = ref(false)

let urlObjeto: string | null = null

onMounted(async () => {
  if (!props.id) return
  carregando.value = true
  try {
    const filme = await filmes.obter(props.id)
    Object.assign(form, {
      nome: filme.nome,
      genero: filme.genero,
      sinopse: filme.sinopse,
      nota: filme.nota,
      duracao: filme.duracao,
      ano_lancamento: filme.ano_lancamento,
    })
    previa.value = filme.imagem
  } catch (e) {
    erroGeral.value = (e as Error).message
  } finally {
    carregando.value = false
  }
})

onBeforeUnmount(() => {
  if (urlObjeto) URL.revokeObjectURL(urlObjeto)
})

function escolherImagem(evento: Event) {
  const arquivo = (evento.target as HTMLInputElement).files?.[0]
  if (!arquivo) return
  imagem.value = arquivo
  if (urlObjeto) URL.revokeObjectURL(urlObjeto)
  urlObjeto = URL.createObjectURL(arquivo)
  previa.value = urlObjeto
}

async function salvar() {
  for (const chave of Object.keys(erros)) delete erros[chave]
  erroGeral.value = ''
  enviando.value = true

  const dados = {
    nome: form.nome.trim(),
    genero: form.genero.trim(),
    sinopse: form.sinopse.trim(),
    nota: String(form.nota),
    duracao: Number(form.duracao),
    ano_lancamento: Number(form.ano_lancamento),
    ...(imagem.value ? { imagem: imagem.value } : {}),
  }

  try {
    if (props.id) await filmes.atualizar(props.id, dados)
    else await filmes.criar(dados)
    router.push({ name: 'catalogo' })
  } catch (e) {
    if (e instanceof ApiError && e.status === 400 && e.dados && typeof e.dados === 'object') {
      for (const [campo, msgs] of Object.entries(e.dados as Record<string, unknown>)) {
        const texto = Array.isArray(msgs) ? msgs.join(' ') : String(msgs)
        if (campo in form || campo === 'imagem') erros[campo] = texto
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
.pagina {
  max-width: 880px;
}

.voltar {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 16px;
  font-size: 14px;
  color: var(--color-text-muted);
}

.formulario {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 24px;
}

.colunas {
  display: grid;
  grid-template-columns: 220px 1fr;
  gap: 24px;
}

.campos {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.linha {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.upload {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.rotulo {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-muted);
}

.area-poster {
  position: relative;
  display: grid;
  place-items: center;
  aspect-ratio: 2 / 3;
  border-radius: var(--radius-md);
  border: 2px dashed var(--glass-border);
  background: rgba(255, 255, 255, 0.03);
  overflow: hidden;
  cursor: pointer;
  transition: border-color 0.15s;
}

.area-poster:hover,
.area-poster:focus-within {
  border-color: var(--color-primary);
}

.area-poster.com {
  border-style: solid;
}

.area-poster img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px;
  text-align: center;
  font-size: 13px;
  color: var(--color-text-muted);
}

.oculto {
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
}

.erro {
  font-size: 12px;
  color: #fca5a5;
}

.acoes {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 8px;
}

@media (max-width: 640px) {
  .formulario {
    padding: 16px;
  }

  .colunas {
    grid-template-columns: 1fr;
  }

  .upload {
    max-width: 200px;
  }

  .linha {
    grid-template-columns: 1fr 1fr;
  }

  .acoes > * {
    flex: 1;
  }
}
</style>
