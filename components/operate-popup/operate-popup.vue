<template>
	<view class="popup-content">
		<view v-for="item in operates" :key="item.operate + pageType" class="operate-item" @tap="handleOperate(item)">
			<view v-if="item.operate === 'upload'" class="operate-item__container">
				<lsj-upload :ref="uploaderRef" :childId="uploaderId" :width="width" :height="height" :option="option"
					:size="maxUploadSize" :count="count" :formats="formats" :debug="debug" :instantly="instantly"
					@change="onChange">
					<view class="upload-btn" :style="{width: width,height: height}">
						{{item.label}}
					</view>
				</lsj-upload>
			</view>
			<view v-else class="operate-item__container">
				<text>
					{{item.label}}
				</text>
			</view>
		</view>
		<view :options='option' :change:options='uploadModule.getOptions'></view>
		<view :sizeLimit='maxUploadSize' :change:sizeLimit='uploadModule.getSizeLimit'></view>
		<view :files='currentUploadFile' :change:files='uploadModule.startUpload'></view>
	</view>
</template>

<script>
	import {
		mapGetters
	} from 'vuex'
	import {
		Uploader
	} from '@/utils/uploader.js'
	import {
		fileUpload
	} from '@/common/apis/file/file.js'
	import utils from '@/utils/utils.js'

	export default {
		name: "operate-popup",
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
			permissionType: {
				type: Number,
				default: -1
			},
			uploadNewId: {
				type: Number,
				default: 0
			}
		},
		data() {
			return {
				uploaderRef: 'lsjUploaderRef',
				uploaderId: 'lsjUploaderId',
				// 上传接口参数
				option: {
					// 上传服务器地址
					url: uni.$myUtils.config.baseUrl.cloudStorage + fileUpload.path,
					// 上传附件的key
					name: 'file',
					// 根据你接口需求自定义请求头,默认不要写content-type,让浏览器自适配
					header: {
						// 示例参数可删除
						'Authorization': 'bearer eyJhbGciOiJSUzI1NiIsI',
						'uid': '99',
						'client': 'app',
						'accountid': 'DP',
					},
					// 根据你接口需求自定义body参数
					formData: {
						// 'orderId': 1000
					}
				},
				// 选择文件后是否立即自动上传，true=选择后立即上传
				instantly: false,
				// 必传宽高且宽高应与slot宽高保持一致
				width: '100%',
				height: '100%',
				// 限制允许上传的格式，空串=不限制，默认为空
				formats: '',
				// 文件数量限制
				count: 9,
				// 文件回显列表
				files: new Map(),
				// 是否打印日志
				debug: true,
				uploaderInstance: null,
				filesProcessing: false,
				currentUploadFile: null
			}
		},
		computed: {
			operates() {
				// 共享文件 1查看者 2上传者 3协作者 4创建者 5管理者 6下载者
				let allOperates = [{
						label: '新建文件夹',
						operate: 'createDir',
						permissionTypes: [4, 5]
					},
					{
						label: '新建文档',
						operate: 'createTxt',
						permissionTypes: [2, 3, 4, 5]
					},
					{
						label: '上传',
						operate: 'upload',
						permissionTypes: [2, 3, 4, 5]
					}
				]
				let operates
				if (this.pageType === 'personal') {
					operates = allOperates
				} else {
					if (this.fileId === 'rootpath') {
						operates = [allOperates[0]]
					} else {
						operates = allOperates.filter((item) => {
							return item.permissionTypes.indexOf(this.permissionType) !== -1
						})
					}
				}
				return operates
			},
			maxUploadSize() {
				return Number(uni.$myStore.getters.sysConfig.uploadSize) || 4096
			}
		},
		mounted() {
			// this.uploaderInstance = new Uploader({
			// 	key: 'file-uploader',
			// 	url: this.option.url,
			// 	maxUploadSize: this.maxUploadSize,
			// 	header: {},
			// 	formData: {},
			// 	removeFileFn: this.clear
			// })
			if (this.uploaderInstance) {
				console.log('已 初始化上传实例')
			} else {
				console.log('初始化上传实例')
				this.uploaderInstance = new Uploader({
					key: 'file-uploader',
					url: this.option.url,
					maxUploadSize: this.maxUploadSize,
					header: {},
					formData: {},
					removeFileFn: this.clear
				})
			}

			// utils.eventBus.$off('uploadComplete')
			// utils.eventBus.$on('uploadComplete', this.uploaderInstance.uploadComplete)
		},
		beforeDestroy() {
			console.log('beforeDestroy popup')
		},
		methods: {
			handleOperate(operate) {
				this[operate.operate]()
			},
			createDir() {},
			createTxt() {},
			upload() {},
			// 文件选择回调
			onChange(files) {
				if (this.filesProcessing) {
					// 文件上传处理中，请稍后重试
					return
				}
				this.filesProcessing = true
				console.log('当前选择的文件列表：', JSON.stringify([...files.values()]));
				let currentFiles = [...files.values()]
				currentFiles.forEach((file) => {
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
					let currentUploadFile = this.uploaderInstance.addQueue(fileObj)
					if (currentUploadFile) {
						setTimeout(() => {
							console.log('---------- startUpload file', currentUploadFile)
							// #ifdef APP-PLUS
							this.currentUploadFile = currentUploadFile
							// #endif
							// #ifdef H5
							this.uploaderInstance.startUpload(currentUploadFile).then((res) => {
								this.onuploadEnd(res)
								// utils.eventBus.$emit('uploadComplete', res)
							}).catch((error) => {
								this.onuploadEnd(error)
								// utils.eventBus.$emit('uploadComplete', error)
							})
							// #endif
						})
					}
				})
				this.filesProcessing = false
			},
			// 某文件上传结束回调(成功失败都回调)
			onuploadEnd(result) {
				this.uploaderInstance.uploadComplete(result)
			},
			// 上传进度回调
			onprogress(file) {
				this.uploaderInstance.onprogress(file)
			},
			// 移除某个文件
			clear(name = null) {
				// name=指定文件名，不传name默认移除所有文件
				this.$refs[this.uploaderRef][0].clear(name);
			}
		}
	}
</script>

<script module='uploadModule' lang="renderjs">
	import {
		Uploader
	} from '@/utils/uploader.js'
	import utils from '@/utils/utils.js'

	export default {
		data() {
			return {
				uploaderInstanceRenderjs: null,
				options: {},
				sizeLimit: 0
			}
		},
		mounted() {
			// this.uploaderInstanceRenderjs = new Uploader({
			// 	key: 'file-uploader-renderjs',
			// 	url: this.options.url,
			// 	maxUploadSize: this.sizeLimit,
			// 	header: {},
			// 	formData: {}
			// })
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
		// destroyed() {
		// 	console.log('this.uploaderInstanceRenderjs', this.uploaderInstanceRenderjs.startUpload)
		// },
		methods: {
			getOptions(newValue, oldValue, ownerInstance, instance) {
				this.options = newValue
			},
			getSizeLimit(newValue, oldValue, ownerInstance, instance) {
				this.sizeLimit = newValue
			},
			startUpload(newValue, oldValue, ownerInstance, instance) {
				console.log('newValue', newValue)
				console.log('oldValue', oldValue)
				// console.log('ownerInstance', ownerInstance)
				if (newValue && newValue.file) {
					if (!oldValue || oldValue.id !== newValue.id) {
						this.uploaderInstanceRenderjs.startUpload(newValue).then((res) => {
							ownerInstance.callMethod('onuploadEnd', res)
							// utils.eventBus.$emit('uploadComplete', res)
						}).catch((error) => {
							ownerInstance.callMethod('onuploadEnd', error)
							// utils.eventBus.$emit('uploadComplete', error)
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
	.popup-content {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 30rpx;
		height: 100rpx;
		background-color: #fff;
		position: relative;
		z-index: 999;
		top: calc(var(--status-bar-height) + 50px);

		.operate-item {
			flex: 1;
			height: 100%;

			.operate-item__container {
				width: 100%;
				height: 100%;
				display: flex;
				justify-content: center;
				align-items: center;

				.upload-btn {
					display: flex;
					justify-content: center;
					align-items: center;
				}
			}
		}
	}
</style>
