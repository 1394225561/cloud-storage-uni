<template>
	<view class="popup-content">
		<view v-for="item in operates" :key="item.operate + pageType" class="operate-item" @tap="handleOperate(item)">
			<view v-if="item.operate === 'upload'" class="operate-item__container">
				<!-- 跨平台选择本地文件的插件 获取的文件用于传递给上传实例进行上传操作 -->
				<lsj-upload :ref="uploaderRef" :childId="uploaderId" :width="width" :height="height" :option="option"
					:size="maxUploadSize" :count="count" :formats="formats" :debug="debug" :instantly="instantly"
					@change="onChange">
					<view class="upload-btn" :style="{width: width,height: height}">
						<icon-font class="operate-item-icon" :icon="item.iconClass" :is-colourful="false"></icon-font>
						<text>
							{{item.label}}
						</text>
					</view>
				</lsj-upload>
			</view>
			<view v-else class="operate-item__container">
				<icon-font class="operate-item-icon" :icon="item.iconClass" :is-colourful="false"></icon-font>
				<text>
					{{item.label}}
				</text>
			</view>
		</view>
	</view>
</template>

<script>
	import utils from '@/utils/utils.js'

	export default {
		name: "operate-popup",
		props: {
			pageType: {
				type: String,
				default: 'personal'
			},
			fileId: {
				type: String,
				default: 'rootpath'
			},
			permissionType: {
				type: Number,
				default: -1
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
				filesProcessing: false
			}
		},
		computed: {
			uploaderRef() {
				return 'lsjUploaderRef' + this.pageType
			},
			uploaderId() {
				return 'lsjUploaderId' + this.pageType
			},
			operates() {
				// 共享文件 1查看者 2上传者 3协作者 4创建者 5管理者 6下载者
				let allOperates = [{
						label: '新建文件夹',
						operate: 'createDir',
						permission: 'newFolder',
						iconClass: 'folder-add',
						permissionTypes: [4, 5]
					},
					{
						label: '新建文档',
						operate: 'createTxt',
						permission: 'upload',
						iconClass: 'file-text1',
						permissionTypes: [2, 3, 4, 5]
					},
					{
						label: '上传',
						operate: 'upload',
						permission: 'upload',
						iconClass: 'upload',
						permissionTypes: [2, 3, 4, 5]
					}
				]
				let operates
				if (this.pageType === 'personal') {
					operates = allOperates
				} else {
					if (this.fileId === 'rootpath') {
						operates = [allOperates[0]].filter((item) => {
							return item.permissionTypes.indexOf(this.permissionType) !== -1
						})
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
			uni.$on(`${this.pageType}clearFile`, this.clear)
			uni.$on(`${this.pageType}filesProcessingEnd`, () => {
				// 文件处理（构建上传列表并判断是否能上传）结束
				this.filesProcessing = false
			})
		},
		beforeDestroy() {
			// console.log('beforeDestroy top opreate popup')
			uni.$off(`${this.pageType}clearFile`)
			uni.$off(`${this.pageType}filesProcessingEnd`)
		},
		methods: {
			handleOperate(operate) {
				this[operate.operate]()
				if (operate.operate !== 'upload') {
					this.$emit('closeTopPopup')
				}
			},
			createDir() {
				this.$emit('createDir')
			},
			createTxt() {
				this.$emit('createTxt')
			},
			upload() {},
			// 文件选择回调
			onChange(files) {
				// clear() 清除文件缓存Map的操作也会调用onChange
				// console.log('当前选择的文件列表：', JSON.stringify([...files.values()]))
				let currentFiles = [...files.values()]
				console.log('当前选择的文件列表：', currentFiles)
				if (this.filesProcessing) {
					// 如果选择的文件还在处理中 
					if (currentFiles.length) {
						// 选择了新文件 需要提示并清空
						// console.log('文件上传处理中，请稍后重试')
						this.clear()
					} else {
						// 此时为触发了clear()
						// console.log('文件数量为0')
					}
					return
				}
				this.filesProcessing = true
				uni.$emit(`create${this.pageType}File`, currentFiles)
			},
			// 移除某个文件
			clear(name) {
				// name=指定文件名，不传name默认移除所有文件
				this.$refs[this.uploaderRef][0].clear(name);
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
		z-index: 99;
		top: calc(var(--status-bar-height) + 50px);

		.operate-item {
			flex: 1;
			height: 100%;

			.operate-item__container {
				color: #7f8389;
				width: 100%;
				height: 100%;
				display: flex;
				flex-direction: column;
				justify-content: center;
				align-items: center;

				.upload-btn {
					display: flex;
					flex-direction: column;
					justify-content: center;
					align-items: center;
				}

				.operate-item-icon {
					font-size: 48rpx;
					margin-bottom: 10rpx;
				}
			}
		}
	}
</style>