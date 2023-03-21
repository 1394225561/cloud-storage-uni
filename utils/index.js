import config from "@/config.js"
import {
	request,
	showErrorMsg,
	showSuccessMsg,
	toLogin,
	LoginPersistence
} from './request.js'
import {
	Downloader
} from './downloader.js'

const install = function(Vue, options) {
	let utils = {
		config,
		request,
		showErrorMsg,
		showSuccessMsg,
		toLogin,
		loginPersistence: new LoginPersistence(),
		downloader: new Downloader()
	}
	uni.$myUtils = utils
	// Vue.prototype.$myUtils = utils
}

export default {
	install
}
