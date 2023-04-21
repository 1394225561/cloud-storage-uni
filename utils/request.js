import config from "@/config.js"

const loginPath = config.loginPath

export const request = function({
	api,
	params,
	header = {},
	needLoading = true,
	loadingText = '加载中...',
	timeout = 60000,
	successCb,
	failCb,
	completeCb
}) {
	const apiApp = api.app || 'cloudStorage'
	const options = {
		url: config.baseUrl[apiApp] + api.path,
		data: params,
		method: api.method.toUpperCase() || 'GET',
		dataType: 'json',
		responseType: api.responseType,
		// contentType: 'json',
		header: {
			'X-Requested-With': 'XMLHttpRequest', // 标记ajax的异步请求
			'CS-PLATFORM': config.VUE_APP_PLATFORM, // 平台标示
			'CS-NETWORKENV': config.VUE_APP_NETWORK_ENVRIOMENT, // 网络环境
			...header
		},
		timeout,
		withCredentials: true
	}

	// app端设置请求头cookie
	// #ifdef APP-PLUS || MP-WEIXIN
	if (uni.$myUtils.loginPersistence.cookieValue) {
		options.header['Cookie'] = uni.$myUtils.loginPersistence.cookieValue
	}
	// #endif

	if (options.method === 'POST') {
		options.header['content-type'] = api.dataType || 'application/json'
	}
	if (needLoading) {
		uni.showLoading({
			title: loadingText
		})
	}
	if (successCb || failCb || completeCb) {
		// 至少传入了一个自定义回调函数 返回 requestTask 对象
		return uni.request({
			...options,
			success: (res) => {
				if (successCb && typeof successCb === 'function') {
					successCb(res)
				} else {
					// 默认成功回调
					uni.showToast({
						title: '成功！'
					})
				}
			},
			fail: (err) => {
				// 错误码统一处理
				handleStatusCode(err)
				if (failCb && typeof failCb === 'function') {
					failCb(err)
				} else {
					// 默认失败回调
					uni.showToast({
						icon: 'error',
						title: '失败！'
					})
				}
			},
			complete: () => {
				if (needLoading) {
					uni.hideLoading()
				}
				if (completeCb && typeof completeCb === 'function') {
					completeCb()
				} else {

				}
			}
		})
	} else {
		// 没有传入自定义回调函数 返回封装后的 Promise 对象
		// 需要在外部进行回调处理
		return new Promise((resolve, reject) => {
			uni.request({
				...options
			}).then((data) => {
				if (needLoading) {
					uni.hideLoading()
				}
				// data为一个数组
				// 数组第一项为错误信息 即为 fail 回调
				// 第二项为返回数据
				let [err, res] = data
				if (err) {
					handleResult(err)
					reject(err)
				} else {
					handleResult(res)
					let errorCode = [400, 401, 500]
					if (errorCode.indexOf(res.statusCode) !== -1) {
						handleStatusCode(res)
						reject(res)
					} else {
						resolve(res)
					}
				}
			})
		})
	}
}

function handleResult(data) {
	// app端 保存cookie
	// #ifdef APP-PLUS || MP-WEIXIN
	if (data.cookies.length) {
		let sessionCookie = data.cookies.filter((data) => {
			return data.indexOf('SESSION=') !== -1
		})
		uni.$myUtils.loginPersistence.setCookie(sessionCookie[0])
	}
	// #endif
}

function handleStatusCode(error) {
	// console.log('handleStatusCode', error)
	let statusCode = error.statusCode
	let resData = error.data
	// console.log('statusCode', statusCode)
	// console.log('resData', resData)
	switch (statusCode) {
		case 400:
			if (resData.errorCode && resData.errorCode === '400sec-core-301') {
				// 退出登录
				toLogin()
			} else {
				showErrorMsg(resData)
			}
			break;
		case 401:
			toLogin()
			break;
		case 500:
			showErrorMsg(resData)
			break;
		default:
			break;
	}
}

export function showErrorMsg(data) {
	let msg = data.errorMessage || data.message || '请求异常！'
	uni.showToast({
		title: msg,
		icon: "error",
		duration: 2000
	})
}
export function showSuccessMsg(msg = '成功！') {
	uni.showToast({
		title: msg,
		duration: 2000
	})
}

export function toLogin() {
	uni.$myStore.commit('SET_isSignedIn', false)
	uni.$myRoute.router({
		url: uni.$myUtils.config.loginPath,
		type: 'redirectTo'
	})
	uni.$myUtils.loginPersistence.clearCookie()
}

export class LoginPersistence {
	constructor(options = {}) {
		this.key = 'cookie_key'
		this.cookieValue = this.getCookie()
	}
	setCookie(value = '') {
		this.cookieValue = value
		uni.setStorageSync(this.key, this.cookieValue)
	}
	getCookie() {
		let value = uni.getStorageSync(this.key) || ''
		return value
	}
	clearCookie() {
		this.setCookie()
	}
}