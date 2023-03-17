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
			maxUploadSize() {
				return Number(uni.$myStore.getters.sysConfig.uploadSize) || 4096
			}
		},
		mounted() {
			uni.$on(`create${this.pageType}File`, this.createFile)
			if (this.uploaderInstance) {
				console.log('已 初始化上传实例')
			} else {
				console.log('初始化上传实例')
				this.uploaderInstance = new Uploader({
					key: 'file-uploader',
					url: this.option.url,
					maxUploadSize: this.maxUploadSize,
					header: {},
					formData: {}
				})
			}
		},
		beforeDestroy() {
			console.log('beforeDestroy i-uploader' + this.pageType)
			uni.$off(`create${this.pageType}File`)
		},
		methods: {
			async createFile(files) {
				let length = files.length
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
					if (addQueueResult.pass) {
						await this.prepareUpload(fileObj, i)
					}
				}
				// 单次所有文件处理完以后 及时从缓存中清除选中的文件 防止继续选择文件出现异常
				uni.$emit('clearFile')
				// 修改标识位 允许选择新文件
				uni.$emit('filesProcessingEnd')
			},
			prepareUpload(currentUploadFile, index) {
				return new Promise((resolve, reject) => {
					console.log('---------- startUpload currentUploadFile',
						index, currentUploadFile)

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
						this.currentUploadFile.token = Date.now()
						resolve()
					})
					// #endif
				})
			},
			// 某文件上传结束回调(成功失败都回调)
			onuploadEnd(result) {
				this.uploaderInstance.uploadComplete(result)
			},
			// 上传进度回调
			onprogress(file) {
				this.uploaderInstance.onprogress(file)
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
				console.log('已 初始化上传实例 renderjs')
			} else {
				console.log('初始化上传实例 renderjs')
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
			console.log('beforeDestroy renderjs')
		},
		methods: {
			getOptions(newValue, oldValue, ownerInstance, instance) {
				this.options = newValue
			},
			getSizeLimit(newValue, oldValue, ownerInstance, instance) {
				this.sizeLimit = newValue
			},
			startUpload(newValue, oldValue, ownerInstance, instance) {
				console.log('========== newValue', newValue)
				console.log('========== oldValue', oldValue)
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
					}
				}
			}
		}
	}
</script>

<style lang="scss" scoped>

</style>
