import { createApp } from 'vue'
import VueCookies from 'vue3-cookies'
import App from './App.vue'

createApp(App)
  .use(VueCookies, {
    expireTimes: "30d",
  })
  .mount('#app')
