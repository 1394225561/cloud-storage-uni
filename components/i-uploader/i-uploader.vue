<template>
	<view class="uploader-container">
		<view :options='option' :change:options='uploadModule.getOptions'></view>
		<view :sizeLimit='maxUploadSize' :change:sizeLimit='uploadModule.getSizeLimit'></view>
		<view :files='currentUploadFile' :change:files='uploadModule.startUpload'></view>
	</view>
</template>

<script>
	import {
		Uploader
	} from '@/utils/uploader.js'
	import {
		processedList
	} from '@/common/apis/file/file.js'
	import {
		mapGetters
	} from 'vuex'

	export default {
		name: "i-uploader",
		props: {
			pageType: {
				type: String,
				default: 'personal'
			},
			dirId: {
				type: String,
				default: 'rootpath'
			},
			dirName: {
				type: String,
				default: 'rootpath'
			},
			fileCategory: {
				type: Number,
				default: 1
			},
			uploadNewId: {
				type: Number,
				default: 0
			},
			option: {
				type: Object,
				default: () => {
					return {}
				}
			}
		},
		data() {
			return {
				uploaderInstance: null,
				currentUploadFile: {}
			}
		},
		computed: {
			...mapGetters([
				'isUploadDetection', 'unProcessList', 'uploaderList', 'sensitiveFileIds'
			]),
			tableList() {
				const datas = (this.unProcessList.concat(this.uploaderList)).filter((item) => {
					return this.sensitiveFileIds.indexOf(item.fileId) === -1
				})
				return datas
			},
			maxUploadSize() {
				return Number(uni.$myStore.getters.sysConfig.uploadSize) || 4096
			}
		},
		mounted() {
			uni.$on(`create${this.pageType}File`, this.createFile)
			if (this.uploaderInstance) {
				// console.log('已 初始化上传实例')
			} else {
				// console.log('初始化上传实例')
				this.uploaderInstance = new Uploader({
					key: 'file-uploader',
					url: this.option.url,
					maxUploadSize: this.maxUploadSize,
					header: {},
					formData: {}
				})
			}
			uni.$on(`clear${this.pageType}UploadDetectionTimer`, this.clearUploadDetectionTimer)
		},
		beforeDestroy() {
			// console.log('beforeDestroy i-uploader' + this.pageType)
			uni.$off(`create${this.pageType}File`)
			uni.$off(`clear${this.pageType}UploadDetectionTimer`)
		},
		methods: {
			async createFile(files) {
				let currentUploadFiles = []
				let length = files.length
				// 构建uploaderList
				for (let i = 0; i < length; i++) {
					let file = files[i]
					let fileObj = this.uploaderInstance.createFile({
						file: file.file,
						path: file.path,
						name: file.name,
						size: file.size,
						fileCategory: this.fileCategory,
						dirId: this.dirId,
						dirName: this.dirName,
						uploadType: this.uploadNewId ? 'newVersion' : 'personalFile',
						uploadNewId: this.uploadNewId,
						isUploadingNew: this.uploadNewId ? true : false
					})
					// 判断加入上传队列的文件是否允许上传
					let addQueueResult = this.uploaderInstance.addQueue(fileObj)
					// 保存数据到vuex
					uni.$myStore.commit('SET_uploaderList', {
						...fileObj,
						...addQueueResult.stateObj
					})
					// 保存可以上传的文件
					if (addQueueResult.pass) {
						currentUploadFiles.push(fileObj)
					}
				}
				// 遍历可以上传的文件
				let uploadLength = currentUploadFiles.length
				for (let j = 0; j < uploadLength; j++) {
					let currentFile = currentUploadFiles[j]
					await this.prepareUpload(currentFile, j)
				}
				this.$nextTick(() => {
					// 单次所有文件处理完以后 及时从缓存中清除选中的文件 防止继续选择文件出现异常
					uni.$emit(`${this.pageType}clearFile`)
					// 修改标识位 允许选择新文件
					uni.$emit(`${this.pageType}filesProcessingEnd`)
				})
			},
			prepareUpload(currentUploadFile, index) {
				return new Promise((resolve, reject) => {
					// console.log('---------- startUpload currentUploadFile', index, currentUploadFile)
					// #ifdef H5
					this.uploaderInstance.startUpload(currentUploadFile).then((res) => {
						this.onuploadEnd(res)
					}).catch((error) => {
						this.onuploadEnd(error)
					})
					resolve()
					// #endif
					// app端上传需要借用renderjs能力
					// renderjs 通过监听数据改变进行通讯
					// 涉及到数据异步更新机制
					// 通过$nextTick防止一次选择多个文件时 renderjs只能接收到最后一个文件
					// #ifdef APP-PLUS
					this.$nextTick(() => {
						this.currentUploadFile = currentUploadFile
						// 坑：修改引用地址并不能触发renderjs对数据的监听 只有属性的增删改才能触发回调
						this.currentUploadFile.token = (new Date().getTime()) + Math.random().toString(36)
							.substr(2)
						resolve()
					})
					// #endif
				})
			},
			// 某文件上传结束回调(成功失败都回调)
			onuploadEnd(result) {
				let cb
				let stateCode
				let state
				let stateText = ''
				let response = JSON.parse(result.response.text)
				let file = result.file
				console.log('onuploadEnd response', response)
				if (result.state === "complete") {
					// 文件上传成功
					// 开启上传检测的话 传入轮询函数作为回调函数
					if (this.isUploadDetection) {
						cb = this.getprocessedList.bind(this)
					}
					if (response.handleStatus === 0) { // 不需要检测关键词
						state = '完成'
						stateCode = 'success'
						stateText = '文件上传成功'
						// 刷新文件列表
						uni.$emit(`${this.pageType}refreshList`)
					} else if (response.handleStatus === 1) { // 需要检测关键词
						state = '审核中'
						stateCode = 'processing'
						stateText = '文件扫描关键词中'
					} else { // 异常
						state = '失败'
						stateCode = 'error-unknow'
						stateText = '文件上传未知异常'
					}
				} else {
					// 文件上传异常
					console.log('!!!!!!!!!!!!!!! uploadFail onuploadEnd', result)
					state = '失败'
					stateCode = 'error'
					stateText = '文件上传失败'
				}
				uni.$myStore.commit('SET_fileState', {
					id: file.id,
					stateCode,
					state,
					stateText,
					fileId: response.fileId, // 服务端文件id
					fileVersionId: response.fileVersionId
				})
				this.uploaderInstance.uploadComplete(cb, result)
			},
			// 上传进度回调
			onprogress(file) {
				this.uploaderInstance.onprogress(file)
			},
			// 文件扫描结果轮询函数
			getprocessedList() {
				let arr = []
				for (let i in this.tableList) {
					// 前端构建的文件对象不含有handleStatus handleResult属性
					// 从后端接口获取的审核中的文件含有handleStatus属性为0
					// 审核结束后的文件才有handleResult属性
					if ((this.tableList[i].stateCode === 'processing' || this.tableList[i].stateCode === 'error-unknow' ||
							this.tableList[i].handleStatus === 0) && (Boolean(this.tableList[i].fileId))) {
						arr.push(this.tableList[i].fileId)
					}
				}
				// 没有审核中的文件
				if (arr.length === 0) {
					// 清除计时器
					this.clearUploadDetectionTimer()
					return
				}
				uni.$myUtils.request({
					api: processedList,
					params: arr,
					needLoading: false
				}).then((res) => {
					// 后台处理完成的data和本地的文件列表比对
					// 文件id相等时修改state的状态
					// 成功时刷新页面
					let data = res.data
					console.log('getprocessedList data', data)
					for (let i = 0; i < data.length; i++) {
						for (let j = 0; j < this.tableList.length; j++) {
							if (this.tableList[j].fileId === data[i].fileId) {
								if (data[i].handleResult === 1 || data[i].handleResult === 4) {
									uni.$myStore.commit('SET_fileState', {
										id: this.tableList[j].id,
										stateCode: 'success',
										state: '完成',
										stateText: '文件上传成功'
									})
									// 刷新文件列表
									uni.$emit(`${this.pageType}refreshList`)
								} else if (data[i].handleResult === 2) { // 涉密
									// this.isNeedCheckLastMsg = true
									uni.$myStore.commit('SET_fileState', {
										id: this.tableList[j].id,
										stateCode: 'intercept',
										state: '拦截',
										stateText: `包含预警关键字:${data[i].handleMessage}`
									})
								} else if (data[i].handleResult === 3 || data[i].handleResult === 5) { // 涉敏
									// this.isNeedCheckLastMsg = true
									this.tableList.splice([j], 1)
									this.$store.commit('SET_sensitiveFileIds', data[i].fileId)
								} else if (data[i].handleResult === 6) {
									uni.$myStore.commit('SET_fileState', {
										id: this.tableList[j].id,
										stateCode: 'intercept',
										state: '拦截',
										stateText: `暂不支持此格式上传,如有疑问请联系管理员!`
									})
								}
							}
						}
					}
					// this.$nextTick(() => {
					// 	if (this.isNeedCheckLastMsg) {
					// 		this.$root.$emit('getCheckNotice', 2)
					// 		this.isNeedCheckLastMsg = false
					// 	}
					// })
				})
			},
			clearUploadDetectionTimer() {
				this.uploaderInstance.clearUploadDetectionTimer()
			}
		}
	}
</script>

<script module='uploadModule' lang="renderjs">
	import {
		Uploader
	} from '@/utils/uploader.js'

	export default {
		data() {
			return {
				uploaderInstanceRenderjs: null,
				options: {},
				sizeLimit: 0
			}
		},
		mounted() {
			if (this.uploaderInstanceRenderjs) {
				// console.log('已 初始化上传实例 renderjs')
			} else {
				// console.log('初始化上传实例 renderjs')
				this.uploaderInstanceRenderjs = new Uploader({
					key: 'file-uploader-renderjs',
					url: this.options.url,
					maxUploadSize: this.sizeLimit,
					header: {},
					formData: {}
				})
			}
		},
		beforeDestroy() {
			// this.uploaderInstanceRenderjs = null
			// console.log('beforeDestroy renderjs')
		},
		methods: {
			getOptions(newValue, oldValue, ownerInstance, instance) {
				this.options = newValue
			},
			getSizeLimit(newValue, oldValue, ownerInstance, instance) {
				this.sizeLimit = newValue
			},
			startUpload(newValue, oldValue, ownerInstance, instance) {
				// console.log('========== newValue', newValue)
				// console.log('========== oldValue', oldValue)
				// console.log('ownerInstance', ownerInstance)
				if (newValue && newValue.file) {
					if (!oldValue || oldValue.id !== newValue.id) {
						console.log('nnnnnnnewValue ==========', newValue)
						this.uploaderInstanceRenderjs.startUpload(newValue).then((res) => {
							ownerInstance.callMethod('onuploadEnd', res)
						}).catch((error) => {
							ownerInstance.callMethod('onuploadEnd', error)
						})
					}
					if (newValue.progress) {
						ownerInstance.callMethod('onprogress', newValue)
						// this.uploaderInstanceRenderjs.onprogress(newValue)
					}
				}
			}
		}
	}
</script>

<style lang="scss" scoped>

</style>