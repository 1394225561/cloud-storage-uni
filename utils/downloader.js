import utils from './utils.js'

export class Downloader {
	// #ifdef APP-PLUS
	static downloadPath = plus.io.convertLocalFileSystemURL('_downloads')
	// #endif

	constructor() {
		// #ifdef APP-PLUS
		// this.absoluteDownloadPath = ''
		this.savePath = this.getSavePath()
		this.onProgress = utils.throttle(this.commitProgress)
		// #endif
	}

	createDownloadItem(file) {
		let item = {
			...file,
			guid: Math.random().toString(36).substr(2),
			state: '等待中',
			stateCode: 'waiting',
			stateText: '文件等待下载'
		}
		return item
	}

	downloadFile(file, requestPath) {
		// TODO: 下载前置检查
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
				uni.$myUtils.showErrorMsg("下载失败")
				console.log('dtask.state 下载失败', dtask.state)
				// plus.downloader.clear() // 清除下载任务?
			}
		})
		dtask.addEventListener('statechanged', this.onStateChanged.bind(this, file), false)

		file.downloadTask = dtask
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
		file.progress = progress < 100 ? progress : 100
		console.log(file)
	}

	downloadComplete(download, file) {
		file.progress = 100
		file.savePath = download.getFileName()
		console.log("Download success: " + download.getFileName())
		console.log(file)
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