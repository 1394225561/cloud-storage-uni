import config from "@/config.js"
import {
	request,
	showErrorMsg,
	showSuccessMsg,
	toLogin,
	LoginPersistence
} from './request.js'

const install = function(Vue, options) {
	let utils = {
		config,
		request,
		showErrorMsg,
		showSuccessMsg,
		toLogin,
		loginPersistence: new LoginPersistence()
	}
	uni.$myUtils = utils
	// Vue.prototype.$myUtils = utils
}

export default {
	install
}
