<template>
  <div class="campo">
    <label :for="id" class="rotulo">{{ rotulo }}</label>
    <textarea
      v-if="multilinha"
      :id="id"
      v-model="valor"
      :aria-describedby="descricao"
      :aria-invalid="!!erro"
      :placeholder="placeholder"
      :required="obrigatorio"
      :rows="4"
      :class="{ invalido: !!erro }"
    />
    <input
      v-else
      :id="id"
      v-model="valor"
      :aria-describedby="descricao"
      :aria-invalid="!!erro"
      :type="tipo"
      :placeholder="placeholder"
      :required="obrigatorio"
      :autocomplete="autocomplete"
      :min="min"
      :max="max"
      :step="step"
      :class="{ invalido: !!erro }"
    />
    <span v-if="erro" :id="`${id}-ajuda`" class="erro" role="alert">{{ erro }}</span>
    <span v-else-if="dica" :id="`${id}-ajuda`" class="dica">{{ dica }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed, useId } from 'vue'

const id = useId()
const valor = defineModel<string | number>({ required: true })

const props = withDefaults(
  defineProps<{
    rotulo: string
    tipo?: 'text' | 'email' | 'password' | 'number'
    placeholder?: string
    obrigatorio?: boolean
    autocomplete?: string
    erro?: string
    dica?: string
    min?: number
    max?: number
    step?: number | string
    multilinha?: boolean
  }>(),
  {
    tipo: 'text',
    placeholder: '',
    obrigatorio: false,
    autocomplete: undefined,
    erro: '',
    dica: '',
    min: undefined,
    max: undefined,
    step: undefined,
    multilinha: false,
  },
)

const descricao = computed(() => (props.erro || props.dica ? `${id}-ajuda` : undefined))
</script>

<style scoped>
.campo {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.rotulo {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-muted);
}

input,
textarea {
  width: 100%;
  padding: 12px 14px;
  border-radius: var(--radius-md);
  border: 1px solid var(--glass-border);
  background: rgba(255, 255, 255, 0.05);
  transition:
    border-color 0.15s,
    background 0.15s;
}

textarea {
  resize: vertical;
  min-height: 96px;
}

input:focus,
textarea:focus {
  outline: none;
  border-color: var(--color-primary);
  background: rgba(255, 255, 255, 0.08);
}

input.invalido,
textarea.invalido {
  border-color: var(--color-danger);
}

.erro {
  font-size: 12px;
  color: #fca5a5;
}

.dica {
  font-size: 12px;
  color: var(--color-text-muted);
}
</style>
