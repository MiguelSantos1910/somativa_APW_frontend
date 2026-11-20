import './assets/main.css'
import '@fontsource/poppins/400.css'
import '@fontsource/poppins/500.css'
import '@fontsource/poppins/600.css'
import '@fontsource/poppins/700.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { definirAoExpirarSessao } from './services/api'
import { useAuthStore } from './stores/auth'

const app = createApp(App)

app.use(createPinia())
app.use(router)

definirAoExpirarSessao(() => {
  useAuthStore().limparSessao()
  const atual = router.currentRoute.value
  if (!atual.meta.publica) {
    router.push({ name: 'login', query: { proximo: atual.fullPath } })
  }
})

app.mount('#app')
