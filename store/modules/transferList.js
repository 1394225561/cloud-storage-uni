import {
	keywordList,
	unProcessList,
	canBeUploadType
} from '@/common/apis/file/file.js'
import utils from '@/utils/utils.js'

const transferList = {
	/**
	 * 初始化state
	 */
	state: {
		// 本次上传的文件列表（由前端上传实例构建）
		uploaderList: [],
		// 通过轮询 检查出的涉敏文件（需要从uploaderList中剔除）
		sensitiveFileIds: [],
		// 等待手工处理的文件列表(涉敏文件)
		waitFileList: [],
		// 等待后端处理的文件列表（审核中，状态未知的文件）
		unProcessList: [],
		canBeUploadTypeData: [],
		// 本次下载的文件列表
		downloadFileList: []
	},

	/**
	 * 用来获取state
	 */
	getters: {
		uploaderList: state => state.uploaderList,
		sensitiveFileIds: state => state.sensitiveFileIds,
		waitFileList: state => state.waitFileList,
		unProcessList: state => state.unProcessList,
		canBeUploadTypeData: state => state.canBeUploadTypeData,
		downloadFileList(state) {
			return state.downloadFileList
		}
	},

	/**
	 * 用来更改state
	 */
	mutations: {
		SET_uploaderList: (state, file) => {
			// 深拷贝 防止修改vuex数据导致外部数据异常
			let result = utils.cloneDeep(file)
			state.uploaderList.unshift(result)
			console.log('SET_uploaderList', state.uploaderList)
		},
		SET_sensitiveFileIds: (state, payload) => {
			state.sensitiveFileIds.push(payload)
		},
		SET_waitFileList: (state, payload) => {
			state.waitFileList = payload
		},
		SET_unProcessList: (state, payload) => {
			state.unProcessList = payload
		},
		SET_canBeUploadTypeData: (state, payload) => {
			state.canBeUploadTypeData = payload
		},
		SET_fileState: (state, payload) => {
			for (let i in state.uploaderList) {
				if (state.uploaderList[i].id === payload.id) {
					state.uploaderList.splice(i, 1, Object.assign({}, state.uploaderList[i], payload))
				}
			}
			console.log('SET_fileState', state.uploaderList)
		},
		SET_DOWNLOAD_FILE_LIST(state, payload) {
			state.downloadFileList = payload
		},
		CLEAR_DOWNLOAD_FILE_LIST(state, payload) {
			state.downloadFileList = []
		},
		APPEND_DOWNLOAD_FILE_LIST(state, payload) {
			state.downloadFileList = [
				...payload,
				...state.downloadFileList
			]
		}
	},
	/**
	 * 用来发起action，可以是异步的，可以是同步的
	 */
	actions: {
		// 获取手工处理的文件列表(涉敏文件)
		getWaitFileList({
			commit,
			state
		}) {
			return new Promise((resolve, reject) => {
				uni.$myUtils.request({
					api: keywordList
				}).then((response) => {
					commit('SET_waitFileList', response.data)
					resolve(response.data)
				}).catch(error => {
					reject(error)
				})
			})
		},
		getCanBeUploadType({
			commit,
			state
		}) {
			return new Promise((resolve, reject) => {
				uni.$myUtils.request({
					api: canBeUploadType
				}).then((response) => {
					commit('SET_canBeUploadTypeData', response.data)
					resolve(response.data)
				}).catch(error => {
					reject(error)
				})
			})
		},
		getUnProcessList({
			commit,
			state
		}) {
			return new Promise((resolve, reject) => {
				uni.$myUtils.request({
					api: unProcessList
				}).then((response) => {
					commit('SET_unProcessList', response.data)
					resolve(response.data)
				}).catch(error => {
					reject(error)
				})
			})
		},
		saveDownloadFileList({
			commit
		}, payload) {
			commit('SET_DOWNLOAD_FILE_LIST', payload)
		},
		clearDownloadFileList({
			commit
		}, payload) {
			commit('CLEAR_DOWNLOAD_FILE_LIST', payload)
		},
		appendDownloadFileList({
			commit
		}, payload) {
			commit('APPEND_DOWNLOAD_FILE_LIST', payload)
		}
	}
}
export default transferList