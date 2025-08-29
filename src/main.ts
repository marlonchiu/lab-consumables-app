import { createSSRApp } from 'vue'
import Vant from 'vant'
import 'vant/lib/index.css'
import '@/styles/index.scss';
import App from './App.vue'
export function createApp() {
  const app = createSSRApp(App)
  app.use(Vant)

  return {
    app
  }
}
