import {
	userDetails
} from '@/common/apis/User/User.js'

const userDetail = {
	/**
	 * 初始化state
	 */
	state: {
		details: {
			avatar: '',
			id: '',
			nickName: '',
			phone: '',
			quota: '',
			usedSize: '',
			website: ''
		}
	},

	/**
	 * 用来获取state
	 */
	getters: {
		details: state => state.details
	},

	/**
	 * 用来更改state
	 */
	mutations: {
		SET_DETAILS: (state, details) => {
			const baseUrl = uni.$myUtils.config.baseUrl
			details.avatar = details.avatar ? baseUrl + details.avatar : details.avatar
			state.details = Object.assign({}, state.details, details)
		}
	},
	/**
	 * 用来发起action，可以是异步的，可以是同步的
	 */
	actions: {
		// 获取用户信息
		userGetInfo({
			commit,
			state
		}) {
			return new Promise((resolve, reject) => {
				uni.$myUtils.request({
					api: userDetails,
					needLoading: false
				}).then(response => {
					const data = response.data
					commit('SET_DETAILS', data)
					uni.setStorageSync('userData', data)
					resolve(response)
				}).catch(error => {
					reject(error)
				})
			})
		}
	}
}
export default userDetail
