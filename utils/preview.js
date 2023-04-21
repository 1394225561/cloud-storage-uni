import utils from './utils.js'
import {
	fileSafeCheck,
	multipleFileCheck,
	fileKeepOnDownload,
	fileDownloadImg,
	assignedShareDownloadFile,
	downloadSingle
} from '@/common/apis/file/file.js'
import {
	fiPreview,
	assignedSharePreview,
	filePreviewV2,
	assignedSharePreviewV2
} from '@/common/apis/preview/preview.js'
import config from "@/config.js"

const previewNeedCheckText = '您选择的文件未经保密检测，不能在外网预览或下载。是否现在进行保密检测？'
const FILE_TYPE_LIST = ['txt', 'doc', 'docx', 'xlsx', 'xls', 'pdf', 'wps', 'wpt', 'pptx', 'ppt']
const IMG_TYPE_LIST = ['jpg', 'gif', 'png', 'jpeg', 'bmp']
const VIDEO_TYPE_LIST = ['mp4']
const AUDIO_TYPE_LIST = ['mp3', 'wav']
const REFUSE_MEDIA_TYPE_LIST = []
const maxPreviewMediaLength = 100
const maxPreviewFileLength = 10

function preview({
	file,
	fileList,
	downloadCheck,
	secretText,
	sensitiveText,
	pageType
}) {
	if (pageType === 'otherShare') {
		file.shareId = file.id
	} else {
		file.fileId = file.id
	}
	if (downloadCheck) {
		judgePreviewable(file).then((judgeResult) => {
			console.log('judgeResult', judgeResult)
			if (judgeResult.pass) {
				// 直接预览
				previewAction({
					file,
					fileList,
					downloadCheck,
					secretText,
					sensitiveText,
					pageType
				})
			} else {
				// 不能直接预览
				if (judgeResult.needCheck) {
					// 提示需要进行扫描检测
					utils.showModal({
						title: '预览检测提示',
						content: previewNeedCheckText,
						success: async (res) => {
							if (res.confirm) {
								const checkResult = await previewCheck(file)
								console.log('checkResult', checkResult)
								if (checkResult.pass) {
									previewAction({
										file,
										fileList,
										downloadCheck,
										secretText,
										sensitiveText,
										pageType
									})
								} else {
									if (checkResult.secret) {
										// 涉密
										updateSecretNotice(secretText)
									} else {
										// 涉敏
										const keyWord = checkResult.keyWord
										updateSensitiveNotice(sensitiveText, keyWord, file).then((
											flag) => {
											if (flag) {
												previewAction({
													file,
													fileList,
													downloadCheck,
													secretText,
													sensitiveText,
													pageType
												})
											}
										})
									}
								}
							} else if (res.cancel) {}
						}
					})
				} else {
					// 扫描过
					// 单文件直接展示涉敏/涉密
					if (judgeResult.secret) {
						// 涉密
						updateSecretNotice(secretText)
					} else {
						// 涉敏
						const keyWord = judgeResult.keyWord
						updateSensitiveNotice(sensitiveText, keyWord, file).then((flag) => {
							if (flag) {
								previewAction({
									file,
									fileList,
									downloadCheck,
									secretText,
									sensitiveText,
									pageType
								})
							}
						})
					}
				}
			}
		})
	} else {
		previewAction({
			file,
			fileList,
			downloadCheck,
			secretText,
			sensitiveText,
			pageType
		})
	}
}

function judgePreviewable(file) {
	const fileId = file.fileId
	return new Promise((resolve, reject) => {
		uni.$myUtils.request({
			api: fileSafeCheck,
			params: {
				fileId,
				operateType: 2
			},
		}).then((response) => {
			let judgeResult = {
				pass: false, // 是否可以直接预览
				secret: false, // 不可以直接预览时 是否涉密 不是涉密就是涉敏
				needCheck: false, // 不可以直接预览时 是否需要进行扫描检测
				keyWord: '' // 涉敏关键词
			}
			if (response.data.isDetect) { // 检测过，直接判断检测结果
				if (response.data.result === 0) { // 通过
					judgeResult.pass = true
				} else if (response.data.result === 1) { // 涉密
					judgeResult.pass = false
					judgeResult.secret = true
				} else { // 涉敏
					judgeResult.pass = false
					judgeResult.secret = false
					judgeResult.keyWord = response.data.matchedKeyword
				}
			} else { // 未检测过，弹出弹框提示是否检测
				judgeResult.needCheck = true
			}
			resolve(judgeResult)
		})
	})
}

function previewCheck(file) {
	const fileId = file.fileId
	return new Promise((resolve, reject) => {
		uni.$myUtils.request({
			api: multipleFileCheck,
			params: {
				fileIds: fileId.split(','),
				operateType: 2
			},
		}).then((response) => {
			let checkResult = {
				pass: false, // 是否可以直接预览
				secret: false, // 不可以直接预览时 是否涉密 不是涉密就是涉敏
				keyWord: '' // 涉敏关键词
			}
			if (response.data.result === 0) { // 通过
				checkResult.pass = true
			} else if (response.data.result === 1) { // 涉密
				checkResult.pass = false
				checkResult.secret = true
			} else { // 涉敏
				checkResult.pass = false
				checkResult.secret = false
				checkResult.keyWord = response.data.matchedKeyword
			}
			resolve(checkResult)
		})
	})
}

function updateSecretNotice(secretText) {
	utils.showModal({
		title: '预览检测提示',
		content: secretText,
		showCancel: false
	})
}

function updateSensitiveNotice(sensitiveText, keyWord, file) {
	const fileId = file.fileId
	return new Promise((resolve, reject) => {
		utils.showModal({
			title: '预览检测提示',
			content: sensitiveText,
			success: (res) => {
				let flag
				if (res.confirm) {
					flag = true
				} else if (res.cancel) {
					flag = false
				}
				const params = {
					keepOn: flag,
					fileId,
					keyWord,
					type: 2 // 1下载 2预览
				}
				uni.$myUtils.request({
					api: fileKeepOnDownload,
					params
				}).then(() => {})
				resolve(flag)
			}
		})
	})
}

function previewAction({
	file,
	fileList,
	downloadCheck,
	secretText,
	sensitiveText,
	pageType
}) {
	const {
		fileName,
		length = 0,
		shareId,
		downloadAble,
		isLock
	} = file
	const previewType = getPreviewType(fileName)

	if (previewType === 'file') {
		uni.$myStore.dispatch('getPermissionBtns').then((data) => {
			if (config.VUE_APP_NETWORK_ENVRIOMENT === 'public' && !utils.checkPermission('preview')) {
				uni.$myUtils.showErrorMsg({
					message: "您没有权限进行预览"
				})
				return
			}
			if (length > maxPreviewFileLength * 1024 * 1024) {
				// 他人分享，需要判断文件是否允许下载
				if (shareId && downloadAble !== 1) {
					utils.showModal({
						title: '预览提示',
						content: `超过${maxPreviewFileLength}MB的文件不支持预览`,
						showCancel: false
					})
					return
				}
				utils.showModal({
					title: '预览提示',
					content: `超过${maxPreviewFileLength}MB的文件不支持预览，请您下载后查看`,
					confirmText: '下载',
					success: (res) => {
						if (res.confirm) {
							if (shareId && isLock) {
								uni.$myUtils.showErrorMsg({
									message: "原文件已被锁定，无法下载"
								})
							} else {
								downloadFileCallback({
									file,
									downloadCheck,
									secretText,
									sensitiveText,
									pageType
								})
							}
						}
					}
				})
				return
			}
			previewFileCallback(file, previewType)
		})
	} else if (previewType === 'pic') {
		previewImgCallback(file, fileList, pageType)
	} else if (previewType && previewType.indexOf('media-') !== -1) {
		if (length > maxPreviewMediaLength * 1024 * 1024) {
			utils.showModal({
				title: '预览提示',
				content: `超过${maxPreviewMediaLength}MB的媒体文件不支持预览，请您下载后查看`,
				confirmText: '下载',
				success: (res) => {
					let flag
					if (res.confirm) {
						downloadFileCallback({
							file,
							downloadCheck,
							secretText,
							sensitiveText,
							pageType
						})
					}
				}
			})
			return
		}
		previewMediaCallback(file, previewType, pageType)
	} else {
		uni.$myUtils.showErrorMsg({
			message: "该文件无法预览"
		})
	}

}

function getPreviewType(fileName) {
	const fileType = utils.getFileType(fileName)
	// 若为图片 则图片预览
	if (IMG_TYPE_LIST.includes(fileType)) {
		return 'pic'
	}
	// 若是文件，则文件预览
	if (FILE_TYPE_LIST.includes(fileType)) {
		return 'file'
	}
	// 若是媒体资源，则媒体预览
	if (VIDEO_TYPE_LIST.includes(fileType)) {
		return 'media-video'
	}
	if (AUDIO_TYPE_LIST.includes(fileType)) {
		return 'media-audio'
	}
	if (REFUSE_MEDIA_TYPE_LIST.includes(fileType)) {
		return 'illegalMedia'
	}
	return null
}

function previewFileCallback(file, previewType) {
	const {
		fileId,
		shareId
	} = file
	let API
	const params = {
		fileId,
		checkStatus: 1
	}
	let src
	if (shareId) {
		API = assignedSharePreview
		params.assignedShareId = shareId
		src = assignedSharePreviewV2
	} else {
		API = fiPreview
		src = filePreviewV2
	}
	uni.$myUtils.request({
		api: API,
		params
	}).then((data) => {
		const responseData = data.data
		if (responseData.code === 0) {
			// 将当前预览文件保存到vuex 然后跳转文件预览页面
			setFileToVuex(file, previewType, src)
			uni.$myRoute.router({
				url: '/pages/preview/preview',
			})
		} else if (responseData.code === 1) {
			uni.$myUtils.showErrorMsg({
				message: "您选择的文件正在预览处理中，请稍后再进行预览"
			})
		} else {
			uni.$myUtils.showErrorMsg({
				message: "文件预览失败，请稍后再进行预览"
			})
		}
	})
}

function previewImgCallback(file, fileList, pageType) {
	let currentIndex
	const images = fileList.filter((item) => {
		let previewType = getPreviewType(item.fileName)
		return previewType === 'pic'
	}).map((image, index) => {
		if (pageType === 'otherShare') {
			image.shareId = image.id
		} else {
			image.fileId = image.id
		}
		if (file.fileId === image.fileId) {
			currentIndex = index
		}
		return getImageSrc(image)
	})
	uni.previewImage({
		current: currentIndex,
		urls: images,
		indicator: 'number',
	})
}

function getImageSrc(file) {
	const {
		fileId,
		shareId
	} = file
	let requestUrl
	const baseUrl = config.baseUrl.cloudStorage
	if (!shareId) {
		requestUrl = baseUrl + fileDownloadImg.path + '?fileId=' + fileId + '&type=2'
	} else {
		requestUrl = baseUrl + assignedShareDownloadFile.path + '?queryStr=' +
			encodeURI(JSON.stringify({
				fileArr: [{
					assignedShareId: shareId,
					fileIds: [fileId]
				}],
				type: 2
			}))
	}
	return requestUrl
}

function previewMediaCallback(file, previewType, pageType) {
	const src = `${config.baseUrl.cloudStorage}${downloadSingle.path}?fileId=${file.fileId}&type=2`
	// 将当前预览文件保存到vuex
	setFileToVuex(file, previewType, src)
	// 然后触发预览音视频组件
	if (previewType === 'media-video') {
		uni.$emit(`${pageType}previewMedia`)
	} else {
		// #ifndef MP-WEIXIN
		uni.$emit(`${pageType}previewMedia`)
		// #endif
		// #ifdef MP-WEIXIN
		// 微信小程序
		uni.$emit(`${pageType}previewMedia`)
		// #endif
	}
}

function setFileToVuex(file, previewType, src) {
	uni.$myStore.commit('setCurrentPreview', {
		type: previewType,
		file,
		src
	})
}

function downloadFileCallback({
	file,
	downloadCheck,
	secretText,
	sensitiveText,
	pageType
}) {
	uni.$myUtils.downloader.downloadEvent({
		files: [file],
		pageType,
		downloadCheck,
		secretText,
		sensitiveText
	})
}

export default {
	preview
}