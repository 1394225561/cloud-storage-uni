// 媒体文件api
// uni.chooseImage(OBJECT) 从本地相册选择图片或使用相机拍照
// uni.chooseVideo(OBJECT) 拍摄视频或从手机相册中选视频，返回视频的临时文件路径
// 非媒体文件api
// uni.chooseFile(OBJECT) 仅支持h5

// Android & h5
// 插件id lsj-upload

/**
 * @description 上传类
 * 提供方法：
 * 	构造文件列表对象（构造传输列表）
 * 	{
		 id,
		 guid,
		 file, File对象
		 name,
		 size,
		 path,
		 chunks, 总共的分片数
		 chunk, 已上传分片数
		 fileCategory, 上传类型（个人文件、共享文件、交换区、同步文件）
		 dirId, 上传到的目标文件夹
		 dirName, 
		 state, 等待中
		 stateCode, waiting success error intercept
		 stateText, 具体的状态文描
		 uploadType, 是否是上传新版本 'newVersion' 'personalFile'
		 uploadNewId, 上传新版本时 目标文件id
		 isUploadingNew, 上传新版本时 置为true 正在上传 防止重复上传新版本 等待文件上传完成 置为false 相同uploadNewId才可继续上传新版本
	}
 * 	检查分片信息
 * 	上传前置校验（权限、账户剩余存储空间、文件格式、文件大小等）
 * 	文件加入队列（通过前置校验的文件可以开始上传）
 *  上传参数配置（请求头、请求参数）
 * 	文件秒传（校验md5）
 * 	开始上传
 * 	断点续传（暂停 继续 读取分片信息）
 * 	文件状态轮询
 * 	文件上传成功回调
 * 	文件上传失败回调
 * 	文件上传完成回调
 * @param {String}  = [key] 上传实例key
 * @param {String}  = [url] 上传请求地址
 * @param {String}  = [uploadMethod] 上传请求类型
 * @param {Number}  = [chunkSize] 分片大小
 * @param {Number}  = [maxUploadSize] 最大上传单文件大小 单位：兆
 * @param {Object}  = [header] 上传接口请求头
 * @param {Object}  = [formData] 上传接口额外参数
 */
export class Uploader {
	constructor({
		key,
		url,
		uploadMethod = 'POST',
		chunkSize = 10485760,
		maxUploadSize = 4096,
		header = {},
		formData = {},
		removeFileFn = () => {},
	}) {
		this.key = key
		this.url = url
		this.uploadMethod = uploadMethod
		this.chunkSize = chunkSize
		this.maxUploadSize = maxUploadSize
		this.header = header
		this.formData = formData
		this.removeFileFn = removeFileFn
	}

	// 构造文件对象
	createFile({
		guid = Math.random().toString(36).substr(2),
		file,
		path,
		name,
		size,
		fileCategory = 1,
		dirId = 'rootpath',
		dirName = '',
		uploadType = 'personalFile',
		uploadNewId = '',
		isUploadingNew = false
	}) {
		let fileObj = {
			id: guid,
			guid,
			file,
			path,
			name,
			size,
			chunk: 0,
			fileCategory,
			dirId,
			dirName,
			uploadType,
			uploadNewId,
			isUploadingNew,
			state: '等待中',
			stateCode: 'waiting',
			stateText: '文件等待上传'
		}
		this.checkChunks(fileObj)
		return fileObj
	}

	// 检查文件大小 是否需要分片
	checkChunks(file) {
		const chunks = Math.ceil(file.size / this.chunkSize) // 总共的分片数
		file.chunks = chunks
	}
	// 前置校验
	preCheck(file) {
		// console.log('uni.$myStore', uni.$myStore)
		// 文件发送前进行条件判断
		// exe不能上传 不支持的格式不能上传
		// 直接标记为取消
		const fileName = file.name
		const canBeUploadTypeData = uni.$myStore.getters.canBeUploadTypeData
		const suffix = fileName.substring(fileName.lastIndexOf('.') + 1, fileName.length).toLowerCase()
		// false才能传 禁止上传exe
		const isExe = suffix === 'exe'
		// true能传
		const canUpload = canBeUploadTypeData[0] === '*' ? true : canBeUploadTypeData.indexOf(suffix) !== -1
		// 文件剩余容量判断
		if (file.size > uni.$myStore.getters.details.quota - uni.$myStore.getters.details.usedSize) {
			const fileObj = {
				...file,
				stateCode: 'intercept',
				state: '拦截',
				stateText: '用户剩余容量不足,如有疑问请联系管理员！'
			}
			uni.$myStore.commit('SET_uploaderList', fileObj)
			// uni.$myStore.commit('SET_interceptList', fileObj)
			// this.syncFile(true)
			return false
		}
		if (file.size === 0) {
			const fileObj = {
				...file,
				stateCode: 'intercept',
				state: '拦截',
				stateText: '空文件暂不支持上传！'
			}
			uni.$myStore.commit('SET_uploaderList', fileObj)
			// uni.$myStore.commit('SET_interceptList', fileObj)
			// this.syncFile(true)
			return false
		}
		// 文件上限判断
		if (file.size / (1024 * 1024) > this.maxUploadSize) {
			const fileObj = {
				...file,
				stateCode: 'intercept',
				state: '拦截',
				stateText: '文件大小超过系统设置,如有疑问请联系管理员！'
			}
			uni.$myStore.commit('SET_uploaderList', fileObj)
			// uni.$myStore.commit('SET_interceptList', fileObj)
			// this.syncFile(true)
			return false
		}
		// 文件格式判断
		if (isExe || !canUpload) {
			const fileObj = {
				...file,
				stateCode: 'intercept',
				state: '拦截',
				stateText: '暂不支持此格式上传,如有疑问请联系管理员！'
			}
			uni.$myStore.commit('SET_uploaderList', fileObj)
			// uni.$myStore.commit('SET_interceptList', fileObj)
			// this.syncFile(true)
			return false
		}
		uni.$myStore.commit('SET_uploaderList', file)
		uni.$myStore.commit('SET_fileState', {
			id: file.id,
			stateCode: 'uploading',
			state: '开始上传',
			stateText: '文件开始上传处理！'
		})
		file.chunk = 0
		return true
	}
	// 加入队列 修改状态为开始上传
	// 前置校验通过的开始上传请求处理
	// 前置校验结束的 无论是否通过 都需要清除内存中的临时文件 防止下次选择文件后有旧文件
	// TODO:从缓存中删除会触发onChange事件 为防止vuex中的文件数组异常 通过标识符控制
	addQueue(file) {
		let pass = this.preCheck(file)
		this.removeFileFn(file.name)
		if (pass) {
			// this.startUpload(file)
			return file
		}
		return false
	}
	// 判断能否秒传
	secondUpload() {}
	// 计算当前文件的md5
	getFileMD5() {}
	getBlobInApp(file) {
		return new Promise((resolve, reject) => {
			let xhr = new XMLHttpRequest()
			xhr.open('GET', file.path, true)
			xhr.responseType = 'blob'
			xhr.onload = function() {
				if (this.status === 200) {
					resolve(this.response)
				} else {
					reject(this.response)
				}
			}
			xhr.onerror = function(e) {
				reject(e)
			}
			xhr.send()
		})
	}
	// 不能秒传的文件 开始上传操作
	async startUpload(file) {
		let blob
		// #ifdef H5
		blob = file.file
		// #endif
		// #ifdef APP-PLUS
		blob = await this.getBlobInApp(file)
		// #endif
		let totalPieces = file.chunks
		let start = 0
		let end
		let fileSize = file.size
		let fileName = file.name
		let result

		while (start <= fileSize) {
			if (file.chunk >= totalPieces) {
				result = {
					state: 'complete'
				}
				break
			}
			end = start + this.chunkSize
			if (end > fileSize) {
				end = fileSize
			}
			let chunkBlob = blob.slice(start, end) // 获取切片blob
			let addFileResult = await this.addFile(file, chunkBlob).then(res => {
				console.log('addFile 成功 res', res)
				// if (file.chunk + 1 === totalPieces && res.filepath) {
				// 	this.fileurl = res.filepath
				// 	file.percent = 100
				// }
				start = end
				file.chunk++
				result = {
					state: 'success'
				}
				return result
			}).catch((error) => {
				console.log('addFile 失败 error', error)
				result = {
					state: 'fail',
					info: error
				}
				return result
			})
			if (addFileResult.state === 'fail') {
				break
			}
		}
		return {
			...result,
			file: file
		}
	}
	// 上传请求发出前 配置上传额外参数
	queryFn(file, blob) {
		let appendObj = {
			...this.formData,
			...file,
			file: blob,
			chunkSize: this.chunkSize,
			encryChunkSize: blob.size
		}
		if (file.chunks <= 1) {
			delete appendObj.chunks
		}
		let formData = new FormData()
		Object.keys(appendObj).forEach((key) => {
			formData.append(key, appendObj[key])
		})
		return formData
	}
	addFile(file, chunkBlob) {
		let formData = this.queryFn(file, chunkBlob)
		return new Promise((resolve, reject) => {
			let xmlRequest = new XMLHttpRequest()
			xmlRequest.open(this.uploadMethod, this.url, true)

			for (let keys in this.header) {
				xmlRequest.setRequestHeader(keys, this.header[keys])
			}

			xmlRequest.upload.addEventListener(
				'progress',
				(event) => {
					// console.log('progress event', event)
					if (event.lengthComputable) {
						let uploaded = event.loaded + file.chunk * this.chunkSize
						let progress = Math.ceil((uploaded * 100) / file.size)
						file.progress = progress < 100 ? progress : 100
						// #ifdef H5
						this.onprogress(file)
						// #endif
					}
				}
			)

			xmlRequest.ontimeout = () => {
				return reject({
					status: 5001,
					text: '请求超时'
				})
			}

			xmlRequest.onreadystatechange = ev => {
				// console.log('xmlRequest', xmlRequest)
				// console.log('ev', ev)
				if (xmlRequest.readyState == 4) {
					if (xmlRequest.status == 200) {
						return resolve({
							status: xmlRequest.status,
							text: xmlRequest.responseText
						})
					} else if (xmlRequest.status == 0) {
						return reject({
							status: xmlRequest.status,
							text: '{"errorCode":"400dfs-000","errorMessage":"请检查请求头Content-Type与服务端是否匹配，服务端已正确开启跨域，并且nginx未拦截阻止请求"}'
						})
					}
					return reject({
						status: xmlRequest.status,
						text: xmlRequest.responseText
					})
				}
			}
			file.xmlRequest = xmlRequest
			xmlRequest.send(formData)
		})
	}
	onprogress(file) {
		console.log('onprogress file.progress', file.progress, file.progress, file.progress)
	}
	// 暂停
	pauseUpload() {}
	// 继续
	resumeUpload() {}
	// 轮询上传后的文件状态 是否涉敏涉密
	checkFileStatus() {}
	// 上传成功
	uploadSuccess(cb, file, response) {}
	// 上传失败
	uploadFail(cb, file, error) {}
	// 上传完成
	uploadComplete(result) {
		console.log('~~~~~~~~~~~~~~~ uploadComplete result', result)
	}
}
