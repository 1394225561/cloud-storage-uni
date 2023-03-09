import {
	sysConfig
} from '@/common/apis/appConfig/appConfig.js'
// import {
// 	getTenantInfo,
// 	dictGroupGet
// } from '@/api/tenantApi/tenantApi.js'

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
		dictSwitchGroup: {}
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
		tenantInfo(state) {
			return state.tenantInfo
		},
		dictGroup(state) {
			return state.dictGroup
		},
		dictSwitchGroup(state) {
			return state.dictSwitchGroup
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
			window.$storage.set({
				permissionBtns: payload.join(routerSplitCharacter)
			})
		},
		SET_TENANTINFO(state, payload) {
			state.tenantInfo = payload
		},
		SET_DICTGROUP(state, payload) {
			state.dictGroup = payload
		},
		SET_DICTSWITCHGROUP(state, payload) {
			state.dictSwitchGroup = payload
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
					resolve()
				}).catch(error => {
					reject(error)
				})
			})
		},
		getTenantConfig({
			commit
		}, payload = []) {
			return new Promise((resolve, reject) => {
				uni.$myUtils.request(tenantConfig).then(res => {
					commit('SET_TENANTCONFIG', res.data)
					resolve()
				}).catch(error => {
					reject(error)
				})
			})
		},
		getPermissionBtns({
			commit
		}, payload) {
			return new Promise((resolve, reject) => {
				uni.$myUtils.request(getPermissionBtn).then(res => {
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
				uni.$myUtils.request(getTenantInfo).then(res => {
					commit('SET_TENANTINFO', res.data)
					resolve()
				}).catch(error => {
					reject(error)
				})
			})
		},
		dictGroupGet({
			commit
		}, payload = []) {
			return new Promise((resolve, reject) => {
				uni.$myUtils.request(dictGroupGet, {
					group: 'popup-template'
				}).then(res => {
					commit('SET_DICTGROUP', res.data)
					resolve()
				}).catch(error => {
					reject(error)
				})
				uni.$myUtils.request(dictGroupGet, {
					group: 'module-switch'
				}).then(res => {
					commit('SET_DICTSWITCHGROUP', res.data)
					resolve()
				}).catch(error => {
					reject(error)
				})
			})
		}
	}
}

export default app
