// 应用配置项 根据打包修改
const VUE_APP_PLATFORM = 'android'
const VUE_APP_NETWORK_ENVRIOMENT = 'public'

let baseUrl
if (process.env.NODE_ENV == "development") {
	baseUrl = {
		cloudStorage: "http://172.16.5.216:9999"
	}
} else {
	baseUrl = {
		// cloudStorage: "http://172.16.4.159:8080"
		cloudStorage: "http://172.16.5.216:9999"
	}
}

// 全局变量
const loginPath = "/pages/login/login"
const homePath = "/pages/personal/personal"

const splitCharacter = '#$%@'

export default {
	VUE_APP_PLATFORM,
	VUE_APP_NETWORK_ENVRIOMENT,
	baseUrl,
	loginPath,
	homePath,
	splitCharacter
}
