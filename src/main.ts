import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)

app.config.globalProperties.$APIRootUrl = 'http://localhost:7593/api/get-info'

app.mount('#app')
