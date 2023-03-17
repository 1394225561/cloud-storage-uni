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
	</view>
</template>

<script>
	export default {
		name: "operate-popup",
		props: {
			pageType: {
				type: String,
				default: 'personal'
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
				filesProcessing: false,
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
			uni.$on('clearFile', this.clear)
			uni.$on('filesProcessingEnd', () => {
				this.filesProcessing = false
				console.log('修改 this.filesProcessing', this.filesProcessing)
			})
		},
		beforeDestroy() {
			console.log('beforeDestroy popup')
			uni.$off('clearFile')
			uni.$off('filesProcessingEnd')
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
				console.log('当前选择的文件列表：', JSON.stringify([...files.values()]));
				let currentFiles = [...files.values()]
				if (this.filesProcessing) {
					if (currentFiles.length) {
						console.log('文件上传处理中，请稍后重试')
						this.clear()
					} else {
						console.log('文件数量为0')
					}
					return
				}
				this.filesProcessing = true
				uni.$emit(`create${this.pageType}File`, currentFiles)
			},
			// 移除某个文件
			clear(name = null) {
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
