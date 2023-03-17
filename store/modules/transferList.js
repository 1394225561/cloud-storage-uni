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
		// 本次上传的文件列表
		uploaderList: [],
		// 等待手工处理的文件列表(涉敏文件)
		waitFileList: [],
		// 等待后端处理的文件列表
		unProcessList: [],
		canBeUploadTypeData: [],
		// 本次下载的文件列表
		downloadFileList: [],
		// 上传组件实例集合
		uploaderInstanceCollections: {},
		selected: {
			personal: [],
			share: []
		}
	},

	/**
	 * 用来获取state
	 */
	getters: {
		uploaderList: state => state.uploaderList,
		waitFileList: state => state.waitFileList,
		unProcessList: state => state.unProcessList,
		canBeUploadTypeData: state => state.canBeUploadTypeData,
		downloadFileList(state) {
			return state.downloadFileList
		},
		uploaderInstanceCollections(state) {
			return state.uploaderInstanceCollections
		},
		selected: state => state.selected,
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
				...state.downloadFileList,
				...payload
			]
		},
		SET_UPLOADER_INSTANCE_COLLECTIONS(state, payload) {
			const {
				key,
				instance
			} = payload
			state.uploaderInstanceCollections[key] = instance
		},
		setSelected(state, payload) {
			let key = payload.pageType
			state.selected[key] = payload.selected
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
				uni.$myUtils.request(keywordList, {}, (response) => {
					commit('SET_waitFileList', response)
					resolve(response)
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
				uni.$myUtils.request(unProcessList, {}, (response) => {
					commit('SET_unProcessList', response)
					resolve(response)
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
		},
		setUploaderInstances({
			commit
		}, payload) {
			commit('SET_UPLOADER_INSTANCE_COLLECTIONS', payload)
		}
	}
}
export default transferList
