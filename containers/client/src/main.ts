import { createApp } from 'vue'
import App from './App.vue'
import router from './router' // 1. Importing router config
import './style.css'

const app = createApp(App)

app.use(router) // 2. We tell Vue to use the router so its not displaying just App.vue an redirects

app.mount('#app')
