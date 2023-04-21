import utils from './utils.js'
import {
	downloadSingle,
	downloadMulti,
	assignedShareDownload,
	fileVersionDownload,
	fileSafeCheck,
	fileVersionCheck,
	multipleFileCheck,
	fileKeepOnDownload
} from '@/common/apis/file/file.js'
import {
	shareLinkDownload,
	openShareLinkDownload
} from '@/common/apis/share/share.js'

export class Downloader {
	// #ifdef APP-PLUS
	static downloadPath = plus.io.convertLocalFileSystemURL('_downloads')
	// #endif

	constructor() {
		this.downloadNeedCheckText = '您选择的文件未经保密检测，不能在外网预览或下载。是否现在进行保密检测？'
		this.multipledownloadCheckUnsafeText = '您选择的文件中包含未经保密检测的文件，请选择单个文件进行下载！'
		// #ifdef APP-PLUS
		// this.absoluteDownloadPath = ''
		this.savePath = this.getSavePath()
		this.onProgress = utils.throttle(this.commitProgress)
		// #endif
	}

	downloadEvent({
		files,
		pageType,
		downloadCheck,
		secretText,
		sensitiveText
	}) {
		let idKey
		let shareId = ''
		let isSingle
		if (pageType === 'otherShare') {
			// 他人分享页面 文件id的对应属性是fileId 属性id对应的是分享的id
			idKey = 'fileId'
			shareId = files[0].id
			if (files.length > 1) {
				isSingle = false
			} else {
				isSingle = !files[0].isDir && files[0].fileNum <= 1
			}
		} else {
			idKey = 'id'
			if (files.length > 1) {
				isSingle = false
			} else {
				isSingle = !files[0].isDir
			}
		}
		const ids = files.map((file) => {
			return file[idKey]
		}).join()
		console.log('ids', ids)
		if (!downloadCheck) {
			this.getDownloadFileUrl(files, isSingle, ids, shareId, pageType)
			return
		}
		this.judgeDownloadable({
			ids,
			isSingle,
			pageType,
			// otherShareSelectParam: pageType === 'otherShare' ? {
			// 	shareId
			// } : null
		}).then((judgeResult) => {
			console.log('judgeResult', judgeResult)
			if (judgeResult.pass) {
				// 直接下载
				this.getDownloadFileUrl(files, isSingle, ids, shareId, pageType)
			} else {
				// 不能直接下载
				if (judgeResult.needCheck) {
					// 提示需要进行扫描检测 此时肯定为单文件
					utils.showModal({
						title: '下载检测提示',
						content: this.downloadNeedCheckText,
						success: async (res) => {
							if (res.confirm) {
								let checkResult = await this.downloadCheck({
									ids,
									pageType,
									// otherShareSelectParam: pageType === 'otherShare' ? {
									// 	shareId
									// } : null
								})
								if (checkResult.pass) {
									this.getDownloadFileUrl(files, isSingle, ids, shareId,
										pageType)
								} else {
									if (checkResult.secret) {
										// 涉密
										this.updateSecretNotice(secretText)
									} else {
										// 涉敏
										const keyWord = checkResult.keyWord
										this.updateSensitiveNotice(keyWord, ids, sensitiveText)
											.then((flag) => {
												if (flag) {
													this.getDownloadFileUrl(files, isSingle,
														ids, shareId, pageType)
												}
											})
									}
								}
							} else if (res.cancel) {}
						}
					})
				} else {
					// 扫描过
					if (judgeResult.isSingle) {
						// 单文件直接展示涉敏/涉密
						if (judgeResult.secret) {
							// 涉密
							this.updateSecretNotice(secretText)
						} else {
							// 涉敏
							const keyWord = judgeResult.keyWord
							this.updateSensitiveNotice(keyWord, ids, sensitiveText).then((flag) => {
								if (flag) {
									this.getDownloadFileUrl(files, isSingle, ids, shareId, pageType)
								}
							})
						}
					} else {
						// 多文件 引导进行单文件下载
						utils.showModal({
							title: '下载检测提示',
							content: this.multipledownloadCheckUnsafeText,
							showCancel: false
						})
					}
				}
			}
		})
	}

	judgeDownloadable({
		ids = '', // id拼接的字符串
		isFileVersion = false, // 是否为查看历史版本下载
		isSingle = true, // 是否为单文件下载
		pageType, // 页面类型
		otherShareSelectParam // 他人分享下载
	}) {
		let API
		let params = {
			operateType: 1
		}
		if (isFileVersion) {
			API = fileSafeCheck
			params.vid = ids
		} else {
			if (isSingle) {
				API = fileSafeCheck
				params.fileId = ids
			} else {
				API = multipleFileCheck
				params.assignedShareId = pageType === 'otherShare' ? otherShareSelectParam.shareId : null
				params.fileIds = ids ? ids.split(',') : null
			}
		}

		return new Promise((resolve, reject) => {
			uni.$myUtils.request({
				api: API,
				params,
			}).then((response) => {
				let judgeResult = {
					isSingle,
					pass: false, // 是否可以直接下载
					secret: false, // 不可以直接下载时 是否涉密 不是涉密就是涉敏
					needCheck: false, // 不可以直接下载时 是否需要进行扫描检测
					keyWord: '' // 涉敏关键词
				}
				if (isSingle) {
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
				} else {
					if (response.data.result === 0) { // 通过
						judgeResult.pass = true
					} else { // 不通过，引导进行单文件下载
						judgeResult.pass = false
					}
				}
				resolve(judgeResult)
			})
		})
	}

	downloadCheck({
		ids = '', // id拼接的字符串
		isFileVersion = false, // 是否为查看历史版本下载
		pageType, // 页面类型
		otherShareSelectParam // 他人分享下载
	}) {
		let API
		let params = {
			operateType: 1
		}
		if (isFileVersion) {
			API = fileVersionCheck
			params.vid = ids
		} else {
			API = multipleFileCheck
			params.assignedShareId = pageType === 'otherShare' ? otherShareSelectParam.shareId : null
			params.fileIds = ids ? ids.split(',') : null
		}
		return new Promise((resolve, reject) => {
			uni.$myUtils.request({
				api: API,
				params,
			}).then((response) => {
				let checkResult = {
					pass: false, // 是否可以直接下载
					secret: false, // 不可以直接下载时 是否涉密 不是涉密就是涉敏
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

	updateSecretNotice(secretText) {
		utils.showModal({
			title: '下载检测提示',
			content: secretText,
			showCancel: false
		})
	}

	updateSensitiveNotice(keyWord, ids, sensitiveText) {
		return new Promise((resolve, reject) => {
			utils.showModal({
				title: '下载检测提示',
				content: sensitiveText,
				success: (res) => {
					let flag
					if (res.confirm) {
						flag = true
					} else if (res.cancel) {
						flag = false
					}
					// TODO:查看历史版本 下载操作
					let isFileVersion = false
					let params = {
						keepOn: flag,
						keyWord,
						type: 1 // 1下载 2预览
					}
					if (isFileVersion) {
						params.vid = this.vid
					} else {
						params.fileId = ids
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

	getDownloadFileUrl(files, isSingle, ids, shareId, pageType) {
		let url
		if (pageType === 'personal' || pageType === 'share' || pageType === 'backups') {
			if (isSingle) {
				url = downloadSingle.path + '?fileId=' + ids
			} else {
				url = downloadMulti.path + '?fileIds=' + ids
			}
		} else if (pageType === 'otherShare') {
			url = assignedShareDownload.path + '?shareId=' + shareId + '&fileIds=' + ids
		} else if (pageType === 'fileVersion') {
			url = fileVersionDownload.path + '?vid=' + this.vid
		} else if (pageType === 'shareLink') {
			url = shareLinkDownload.path + '?shareCode=' + this.shareLinkSelectParam
				.shareCode + '&fileId=' + this.shareLinkSelectParam.fileIds
		} else if (pageType === 'openShareLink') {
			url = openShareLinkDownload.path + '?shareCode=' + this.openShareLinkSelectParam
				.shareCode + '&fileId=' + this.openShareLinkSelectParam.fileIds
		}
		console.log('url getDownloadFileUrl', url)
		// #ifdef APP-PLUS
		let file
		if (isSingle) {
			// 单文件下载
			file = files[0]
		} else {
			// 批量下载（多文件、文件夹、文件和文件夹混合下载）
			file = {
				fileName: '批量下载.zip',
				size: this.getTotalSize(files)
			}
		}
		let downloadItem = this.createDownloadItem(file)
		uni.$myStore.dispatch('saveDownloadFileList', downloadItem)
		this.downloadFile(downloadItem, url)
		// #endif

		// #ifdef H5
		this.downloadFile({}, url)
		// #endif

	}

	getTotalSize(files) {
		return files.reduce((total, currentValue) => {
			return total + (currentValue.length || 0)
		}, 0)
	}

	createDownloadItem(file) {
		let item = {
			...file,
			guid: Math.random().toString(36).substr(2),
			state: '等待中',
			stateCode: 'waiting',
			stateText: '文件等待下载',
			time: new Date().getTime()
		}
		return item
	}

	downloadFile(file, requestPath) {
		let that = this
		let url = uni.$myUtils.config.baseUrl.cloudStorage + requestPath
		let fileName = file.fileName

		// #ifdef APP-PLUS
		let fullDownloadPath = 'file://' + (this.savePath || Downloader.downloadPath)
		let filename = fullDownloadPath + fileName // 利用保存路径，实现下载文件的重命名
		let dtask = plus.downloader.createDownload(url, {
			filename
		}, function(d, status) { // d为下载的文件对象 status下载状态
			console.log('createDownload 下载成功', d)
			if (status === 200) {
				uni.$myUtils.showSuccessMsg("下载成功")
				// d.filename是文件在保存在本地的相对路径，使用下面的API可转为平台绝对路径
				let fileSaveUrl = plus.io.convertLocalFileSystemURL(d.filename)
				console.log('fileSaveUrl', fileSaveUrl)
			} else {
				uni.$myUtils.showErrorMsg({
					message: "下载失败"
				})
				console.log('dtask.state 下载失败', dtask.state)
				uni.$myStore.commit('SET_DOWNLOAD_fileState', {
					guid: file.guid,
					stateCode: 'error',
					state: '失败',
					stateText: '文件下载失败'
				})
				// plus.downloader.clear() // 清除下载任务?
			}
		})
		dtask.addEventListener('statechanged', this.onStateChanged.bind(this, file), false)

		// uni.$myStore.commit('SET_DOWNLOAD_fileState', {
		// 	guid: file.guid,
		// 	downloadTask: dtask
		// })
		// file.downloadTask = dtask
		dtask.start() //启用
		// #endif

		// #ifdef H5
		let eleLink = document.createElement('a')
		eleLink.style.display = 'none'
		eleLink.href = url
		// eleLink.download = fileName
		// eleLink.target = '_blank'
		document.body.appendChild(eleLink)
		eleLink.click()
		document.body.removeChild(eleLink)
		// #endif
	}

	onStateChanged(file, download, status) {
		if (download.state === 3) {
			this.onProgress(download, file)
		}
		if (download.state === 4 && status === 200) {
			// 下载完成 
			this.downloadComplete(download, file)
		}
	}

	commitProgress(download, file) {
		console.log('download onStateChanged ========', download.downloadedSize, download.totalSize)
		let progress = Math.ceil((download.downloadedSize * 100) / download.totalSize)
		uni.$myStore.commit('SET_DOWNLOAD_fileState', {
			guid: file.guid,
			stateCode: 'downloading',
			state: (progress < 100 ? progress : 100) + '%',
			stateText: '文件下载中...'
		})
	}

	downloadComplete(download, file) {
		uni.$myStore.commit('SET_DOWNLOAD_fileState', {
			guid: file.guid,
			savePath: download.getFileName(),
			stateCode: 'success',
			state: '完成',
			stateText: '文件下载成功'
		})
		// 选择软件打开文件
		// plus.runtime.openFile(file.savePath)
	}

	// uni-app 暂不支持自定义保存路径为系统公共目录 需要借用native能力才能实现
	// 配置获取存储权限 持久化保存自定义路径
	getPath() {
		return new Promise((resolve, reject) => {
			let CODE_REQUEST = 1000
			let that = this
			let main = plus.android.runtimeMainActivity()
			if (plus.os.name == 'Android') {
				let Intent = plus.android.importClass('android.content.Intent')
				let intent = new Intent(Intent.ACTION_OPEN_DOCUMENT_TREE)
				// intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
				main.onActivityResult = function(requestCode, resultCode, data) {
					if (requestCode == CODE_REQUEST) {
						let uri = data.getData()
						plus.android.importClass(uri)
						let path = uri.getPath()
						that.handlePath(path)
						resolve(that.savePath)
					}
				}
				main.startActivityForResult(intent, CODE_REQUEST)
			}
		})
	}

	handlePath(path) {
		console.log('handleDownloadPath path', path)

		// this.absoluteDownloadPath = plus.io.convertLocalFileSystemURL(path)
		// console.log('this.absoluteDownloadPath', this.absoluteDownloadPath)

		let prefixPath = plus.io.convertLocalFileSystemURL('_downloads').split('/0/Android/data')[0]
		let array = path.split('/tree/primary:')
		console.log('handleDownloadPath array', array)
		let relativePath = array[1]
		let fullPath = `${prefixPath}/0/${relativePath}/`
		this.setSavePath(fullPath)
	}

	setSavePath(path = '') {
		this.savePath = path
		uni.setStorageSync('downloadSavePath', path)
	}
	getSavePath() {
		let value = uni.getStorageSync('downloadSavePath') || ''
		return value
	}
	clearSavePath() {
		this.setSavePath()
	}
}