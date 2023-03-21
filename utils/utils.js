import Vue from 'vue'

// export function addAPIInterceptor(api) {
// 	uni.addInterceptor(api, {
// 		invoke(args) {
// 			// api触发前拦截 进行api入参的处理
// 			console.log('addAPIInterceptor invoke', args)
// 		},
// 		returnValue(args) {
// 			// 方法调用后触发 处理返回值
// 			console.log('addAPIInterceptor returnValue', args)
// 			return args
// 		},
// 		success(args) {
// 			// 请求成功后，修改code值为1
// 			console.log('addAPIInterceptor success', args)
// 		},
// 		fail(err) {
// 			console.log('addAPIInterceptor fail', args)
// 		},
// 		complete(res) {
// 			console.log('addAPIInterceptor complete', args)
// 		}
// 	})
// }

const CryptoJS = require('crypto-js') // 引用AES源码js

const key = CryptoJS.enc.Utf8.parse('1111222233334444') // 十六位十六进制数作为密钥
const iv = CryptoJS.enc.Utf8.parse('1234567876543210') // 十六位十六进制数作为密钥偏移量

// 解密方法
function Decrypt(word) {
	var bytes = CryptoJS.AES.decrypt(word.toString(), key, {
		iv,
		mode: CryptoJS.mode.ECB,
		padding: CryptoJS.pad.Pkcs7
	})
	var decryptResult = bytes.toString(CryptoJS.enc.Utf8)
	return decryptResult.toString()
}

// 加密方法
function Encrypt(word) {
	var encryptResult = CryptoJS.AES.encrypt(word, key, {
		iv,
		mode: CryptoJS.mode.ECB,
		padding: CryptoJS.pad.Pkcs7
	})
	return encryptResult.toString()
}

function cloneDeep(target, map = new Map()) {
	if (typeof target === 'object') {
		let cloneTarget = Array.isArray(target) ? [] : {}
		if (map.get(target)) {
			return map.get(target)
		}
		map.set(target, cloneTarget)
		for (const key in target) {
			cloneTarget[key] = cloneDeep(target[key], map)
		}
		return cloneTarget
	} else {
		return target
	}
}

const eventBus = new Vue({
	data: {
		test: 'test'
	}
})

function throttle(func, delay = 1000) {
	let wait = false

	return (...args) => {
		if (wait) {
			return
		}

		wait = true
		func(...args)
		setTimeout(() => {
			wait = false
		}, delay)
	}
}

export default {
	Decrypt,
	Encrypt,
	cloneDeep,
	eventBus,
	throttle
}
