// #ifndef VUE3
import Vue from 'vue'
import App from './App'
import router from "./router"
import utils from "./utils"
import store from './store'

Vue.config.productionTip = false

App.mpType = 'app'

Vue.use(router)
Vue.use(utils)

// Vue.prototype.$store = store.instance
uni.$myStore = store.instance

const app = new Vue({
	store: store.instance,
	...App
})
app.$mount()
// #endif

// #ifdef VUE3
import {
	createSSRApp
} from 'vue'
import App from './App.vue'
export function createApp() {
	const app = createSSRApp(App)
	return {
		app
	}
}
// #endif
