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
	let bytes = CryptoJS.AES.decrypt(word.toString(), key, {
		iv,
		mode: CryptoJS.mode.ECB,
		padding: CryptoJS.pad.Pkcs7
	})
	let decryptResult = bytes.toString(CryptoJS.enc.Utf8)
	return decryptResult.toString()
}

// 加密方法
function Encrypt(word) {
	let encryptResult = CryptoJS.AES.encrypt(word, key, {
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
		let timer = setTimeout(() => {
			wait = false
			clearTimeout(timer)
		}, delay)
	}
}

function getIcon(data, typeFlag = 0) {
	let fileName = data.fileName
	if (typeFlag === 2 && data.isDir) {
		// 共享文件根目录图标
		return 'groupfolder-color'
	} else if (data.isDir) {
		return 'folder-color'
	}
	if (fileName !== '' || fileName !== undefined) {
		let point = fileName.lastIndexOf('.')
		let type = fileName.substring(point + 1).toLowerCase()
		if (type === 'jpg' || type === 'gif' || type === 'png' || type === 'jpeg' || type === 'bmp') {
			return 'picture-color'
		} else if (type === 'avi' || type === 'rmvb' || type === 'rm' || type === 'asf' || type === 'divx' || type ===
			'mpg' || type === 'mpeg' || type === 'mpe' || type === 'mp4' || type === 'mkv' || type === 'vob' || type ===
			'wmv') {
			return 'video-color'
		} else if (type === 'WAVE' || type === 'AIFF' || type === 'MPEG' || type === 'MP3' || type === 'MIDI' ||
			type === 'mp3') {
			return 'music-color'
		} else if (type === 'txt') {
			return 'txt-color'
		} else if (type === 'pdf') {
			return 'pdf-color'
		} else if (type === 'doc' || type === 'docx') {
			return 'word-color'
		} else if (type === 'ppt' || type === 'pptx') {
			return 'ppt-color'
		} else if (type === 'xls' || type === 'xlsx') {
			return 'excel-color'
		} else if (type === 'wps' || type === 'wpt') {
			return 'word-color'
		} else if (type === 'zip' || type === 'rar') {
			return 'package-color'
		} else {
			return 'unknown-color'
		}
	}
}

function transformSize(limit) {
	if (limit === '') {
		return '-'
	}
	let size = ''
	if (limit < 1 * 1024) {
		size = limit.toFixed(2) + 'B'
	} else if (limit < 1 * 1024 * 1024) {
		size = (limit / 1024).toFixed(2) + 'KB'
	} else if (limit < 1 * 1024 * 1024 * 1024) {
		size = (limit / (1024 * 1024)).toFixed(2) + 'MB'
	} else {
		size = (limit / (1024 * 1024 * 1024)).toFixed(2) + 'GB'
	}

	let sizestr = size + ''
	let len = sizestr.indexOf('.')
	let dec = sizestr.substr(len + 1, 2)
	if (dec === '00') {
		return sizestr.substring(0, len) + sizestr.substr(len + 3, 2)
	}
	return sizestr
}

function transformTime(val) {
	val = new Date(val)
	if (val !== '' || undefined || null) {
		return formatTime('yyyy-MM-dd HH:mm', val)
	} else {
		return '-'
	}
}

function formatTime(fmt, val) {
	let o = {
		'M+': val.getMonth() + 1,
		'd+': val.getDate(),
		'h+': val.getHours() % 12 === 0 ? 12 : val.getHours() % 12,
		'H+': val.getHours(),
		'm+': val.getMinutes(),
		's+': val.getSeconds(),
		'q+': Math.floor((val.getMonth() + 3) / 3),
		'S': val.getMilliseconds()
	}
	let week = {
		'0': '日',
		'1': '一',
		'2': '二',
		'3': '三',
		'4': '四',
		'5': '五',
		'6': '六'
	}
	if (/(y+)/.test(fmt)) {
		fmt = fmt.replace(RegExp.$1, (val.getFullYear() + '').substr(4 - RegExp.$1.length))
	}
	if (/(E+)/.test(fmt)) {
		fmt = fmt.replace(RegExp.$1, ((RegExp.$1.length > 1) ? (RegExp.$1.length > 2 ? '星期' : '周') : '') + week[val
			.getDay() + ''])
	}
	for (let k in o) {
		if (new RegExp('(' + k + ')').test(fmt)) {
			fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)))
		}
	}
	return fmt
}

export default {
	Decrypt,
	Encrypt,
	cloneDeep,
	eventBus,
	throttle,
	getIcon,
	transformSize,
	transformTime
}