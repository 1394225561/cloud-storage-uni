import utils from '@/utils/utils.js'

const fileOperate = {
	state: {
		personalRelated: {
			selectedDatas: [],
			isSelectedAll: false
		},
		shareRelated: {
			selectedDatas: [],
			isSelectedAll: false
		},
		currentOperatePopupCloseMethodName: '',
		currentPreview: {
			type: '',
			src: '',
			file: {}
		}
	},
	getters: {
		/**
		 * state当前state,
		 * getters
		 * rootState根state
		 */
		personalRelated(state) {
			return state.personalRelated
		},
		shareRelated(state) {
			return state.shareRelated
		},
		currentOperatePopupCloseMethodName(state) {
			return state.currentOperatePopupCloseMethodName
		},
		currentPreview(state) {
			return state.currentPreview
		}
	},
	mutations: {
		setCurrentOperatePopupCloseMethodName(state, payload) {
			state.currentOperatePopupCloseMethodName = payload
		},
		// 个人文件相关
		selectPersonalFile(state, payload) {
			state.personalRelated.selectedDatas.push(utils.cloneDeep(payload))
		},
		unselectPersonalFile(state, payload) {
			let index = state.personalRelated.selectedDatas.findIndex((item, index) => {
				return item.id === payload.id
			})
			state.personalRelated.selectedDatas.splice(index, 1)
		},
		// 全选
		selectAllPersonalFile(state, payload) {
			state.personalRelated.isSelectedAll = true
		},
		setPersonalDatas(state, payload) {
			state.personalRelated.selectedDatas = utils.cloneDeep(payload)
		},
		// 取消全选
		unselectAllPersonalFile(state, payload) {
			state.personalRelated.isSelectedAll = false
		},
		clearPersonalDatas(state, payload) {
			state.personalRelated.selectedDatas = []
		},
		resetPersonal(state, payload) {
			state.personalRelated.selectedDatas = []
		},
		// 共享文件相关
		selectShareFile(state, payload) {
			state.shareRelated.selectedDatas.push(utils.cloneDeep(payload))
		},
		unselectShareFile(state, payload) {
			let index = state.shareRelated.selectedDatas.findIndex((item, index) => {
				return item.id === payload.id
			})
			state.shareRelated.selectedDatas.splice(index, 1)
		},
		// 全选
		selectAllShareFile(state, payload) {
			state.shareRelated.isSelectedAll = true
		},
		setShareDatas(state, payload) {
			state.shareRelated.selectedDatas = utils.cloneDeep(payload)
		},
		// 取消全选
		unselectAllShareFile(state, payload) {
			state.shareRelated.isSelectedAll = false
		},
		clearShareDatas(state, payload) {
			state.shareRelated.selectedDatas = []
		},
		resetShare(state, payload) {
			state.shareRelated.selectedDatas = []
		},
		setCurrentPreview(state, payload) {
			state.currentPreview = payload
		}
	},
	actions: {

	}
}

export default fileOperate