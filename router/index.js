import config from "@/config.js"
import route from "./route"

const loginPath = config.loginPath
const homePath = config.homePath
// 配置白名单
const whiteList = [
	'/',
	loginPath,
	homePath,
	"/pages/personal/personal",
	"/pages/share/share",
	"/pages/transfer/transfer",
	"/pages/profile/profile",
	"/pages/error/error"
]

const handleOverwirteRoute = () => {
	// 重写switchTab、navigateBack
	const methodToPatch = ["switchTab", "navigateBack"]
	methodToPatch.map((type) => {
		// 通过遍历的方式分别取出，uni.switchTab、uni.navigateBack
		// 并且对相应的方法做重写
		const original = uni[type]
		uni[type] = function(options = {}) {
			const {
				url: path
			} = options
			if (!whiteList.includes(path.split("?")[0])) {
				uni.$myRoute.router(loginPath)
			} else {
				console.log('handleOverwirteRoute options', options)
				return original.call(this, options)
			}
		}
	})
}

const install = function(Vue, options) {
	uni.$myRoute = {
		router: route
	}
	Vue.prototype.router = route
	// 重写uni方法
	handleOverwirteRoute()
	// 路由拦截
	uni.$myRoute.routeIntercept = (routeConfig, resolve) => {
		const path = routeConfig.url.split("?")[0]
		if (!whiteList.includes(path)) {
			// if (!whiteList.includes(path) && !uni.getStorageSync("token")) {
			uni.$myRoute.router(loginPath)
			resolve(false)
			return
		}
		resolve(true)
	}
}

export default {
	install
}
