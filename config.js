// 应用配置项 根据打包修改
let VUE_APP_PLATFORM = 'android'
// #ifdef H5
// VUE_APP_PLATFORM = 'h5'
// #endif
// #ifdef MP-WEIXIN
VUE_APP_PLATFORM = 'mp-wx'
// #endif
const VUE_APP_NETWORK_ENVRIOMENT = 'public'
const VUE_APP_LOCATION = 'JIANGSU'

let baseUrl
if (process.env.NODE_ENV == "development") {
	baseUrl = {
		// cloudStorage: "http://172.16.6.49:9999"
		// cloudStorage: "http://172.16.6.49:29901"
		cloudStorage: "http://172.16.5.184:8080"
	}
	// console.log = () => {}
} else {
	baseUrl = {
		cloudStorage: "http://172.16.6.49:29901"
		// cloudStorage: "http://172.16.4.237:9999"
		// cloudStorage: "http://172.16.4.159:8080"
		// cloudStorage: "http://172.16.5.216:9999"
		// cloudStorage: "http://192.168.3.216:9999"
		// cloudStorage: "http://test-dongying-public.yunpan.yjcloud.com"
	}
	console.log = () => {}
}

// 全局变量
const loginPath = "/pages/login/login"
const homePath = "/pages/personal/personal"

const splitCharacter = '#$%@'

export default {
	VUE_APP_PLATFORM,
	VUE_APP_NETWORK_ENVRIOMENT,
	VUE_APP_LOCATION,
	baseUrl,
	loginPath,
	homePath,
	splitCharacter
}