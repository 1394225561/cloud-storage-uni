import {
	sysConfig,
	getPermissionBtn,
	tenantConfig
} from '@/common/apis/appConfig/appConfig.js'
import {
	getTenantInfo,
	dictGroupGet
} from '@/common/apis/tenantApi/tenantApi.js'

// const EMPTY_OBJECT_STRING = '{}'

const app = {
	state: {
		// 系统级别配置
		sysConfig: {},
		// 租户级别配置
		tenantConfig: {},
		// 权限按钮code list
		permissionBtns: [],
		tenantInfo: {},
		dictGroup: {},
		dictSwitchGroup: {},
		isSignedIn: false,
		isUploadDetection: true
	},
	getters: {
		/**
		 * state当前state,
		 * getters
		 * rootState根state
		 */
		sysConfig(state) {
			return state.sysConfig
		},
		tenantConfig(state) {
			return state.tenantConfig
		},
		permissionBtns(state) {
			return stata.permissionBtns
		},
		tenantInfo(state) {
			return state.tenantInfo
		},
		dictGroup(state) {
			return state.dictGroup
		},
		dictSwitchGroup(state) {
			return state.dictSwitchGroup
		},
		isSignedIn(state) {
			return state.isSignedIn
		},
		isUploadDetection(state) {
			return state.isUploadDetection
		}
	},
	mutations: {
		SET_SYSCONFIG(state, payload) {
			state.sysConfig = payload
		},
		SET_TENANTCONFIG(state, payload) {
			state.tenantConfig = payload
		},
		// 获取当前用户权限按钮信息列表
		SET_PERMISSION_BTN(state, payload) {
			state.permissionBtns = payload
			uni.setStorageSync('permissionBtns', payload.join(uni.$myUtils.config.splitCharacter))
		},
		SET_TENANTINFO(state, payload) {
			state.tenantInfo = payload
		},
		SET_DICTGROUP(state, payload) {
			state.dictGroup = payload
		},
		SET_DICTSWITCHGROUP(state, payload) {
			state.dictSwitchGroup = payload
		},
		SET_isSignedIn(state, payload) {
			state.isSignedIn = payload
		},
		SET_isUploadDetection(state, payload) {
			state.isUploadDetection = payload
		}
	},
	actions: {
		getSysConfig({
			commit
		}, payload = []) {
			return new Promise((resolve, reject) => {
				uni.$myUtils.request({
					api: sysConfig,
					needLoading: false
				}).then(res => {
					commit('SET_SYSCONFIG', res.data)
					resolve(res.data)
				}).catch(error => {
					reject(error)
				})
			})
		},
		getTenantConfig({
			commit
		}, payload = []) {
			return new Promise((resolve, reject) => {
				uni.$myUtils.request({
					api: tenantConfig
				}).then(res => {
					commit('SET_TENANTCONFIG', res.data)
					resolve(res.data)
				}).catch(error => {
					reject(error)
				})
			})
		},
		getPermissionBtns({
			commit
		}, payload) {
			return new Promise((resolve, reject) => {
				uni.$myUtils.request({
					api: getPermissionBtn
				}).then(res => {
					let array = []
					res.data.forEach(item => {
						array.push(item.code)
					})
					commit('SET_PERMISSION_BTN', array)
					resolve(res.data)
				}).catch(error => {
					reject(error)
				})
			})
		},
		getTenantInfo({
			commit
		}, payload = []) {
			return new Promise((resolve, reject) => {
				uni.$myUtils.request({
					api: getTenantInfo
				}).then(res => {
					commit('SET_TENANTINFO', res.data)
					resolve(res.data)
				}).catch(error => {
					reject(error)
				})
			})
		},
		dictGroupGet({
			commit
		}, payload = []) {
			return new Promise((resolve, reject) => {
				uni.$myUtils.request({
					api: dictGroupGet,
					params: {
						group: 'popup-template'
					}
				}).then(res => {
					commit('SET_DICTGROUP', res.data)
					resolve()
				}).catch(error => {
					reject(error)
				})
				uni.$myUtils.request({
					api: dictGroupGet,
					params: {
						group: 'module-switch'
					}
				}).then(res => {
					commit('SET_DICTSWITCHGROUP', res.data)
					// 是否开启文件上传检测
					if (res.data.keywords === 'off' || (res.data.keywords === 'on' && res.data[
							'keywords-check-side'] === 'download')) {
						commit('SET_isUploadDetection', false)
					} else {
						commit('SET_isUploadDetection', true)
					}
					resolve()
				}).catch(error => {
					reject(error)
				})
			})
		}
	}
}

export default app