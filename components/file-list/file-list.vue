<template>
	<uni-list class="list-container">
		<view class="bread-crumb">
			<!-- 面包屑 -->
			<bread-crumb ref="breadCrumb" :page-type="pageType"></bread-crumb>
		</view>
		<uni-list-item direction="column" v-for="(data, index) in listData" :key="data.id" :clickable="false"
			:title="data.fileName + ''">
			<template v-slot:body>
				<!-- 文件信息展示 -->
				<view class="body-container">
					<view v-show="isSelecting" class="check-box-container" @click="handleCheck(data)">
						<view :class="['check-box', judgeActive(data) ? 'check-box-active-border' : '']">
							<view :class="['check-box-checked', judgeActive(data) ? 'check-box-active' : '']">
							</view>
						</view>
					</view>
					<view class="body-icon">
						<icon-font class="file-icon" :icon="fileIcon(data)"></icon-font>
					</view>
					<view :class="['body-content', isSelecting ? 'less-width' : '']" @click="handleFile(data)">
						<view class="content-left">
							<span class="file-name">{{ data.fileName }}</span>
							<span class="file-time">{{ transformTime(data.gmtModified) }}</span>
						</view>
						<view v-if="data.length" class="content-right">
							<span class="file-size">{{ transformSize(data.length) }}</span>
						</view>
					</view>
					<view class="body-arrow" @click="switchHandleOperationBar(data)">
						<icon-font class="arrow-icon" :icon="arrowIcon(data)" :is-colourful="false"></icon-font>
					</view>
				</view>
			</template>
			<template v-slot:footer>
				<!-- 单文件操作bar -->
				<view v-show="data.showOperationBar" class="operation-bar-container">
					<operate-bar :page-type="pageType" :file-data="data" :file-id="fileId"
						:is-selecting="isSelecting"></operate-bar>
				</view>
			</template>
		</uni-list-item>
	</uni-list>
</template>

<script>
	import {
		downloadSingle
	} from '@/common/apis/file/file.js'
	import utils from '@/utils/utils.js'
	import {
		mapGetters
	} from 'vuex'

	export default {
		name: "file-list",
		props: {
			listData: {
				type: Array,
				default: () => []
			},
			pageType: {
				type: String,
				default: 'personal'
			},
			fileId: {
				type: String,
				default: 'rootpath'
			},
			isSelecting: {
				type: Boolean,
				default: false
			}
		},
		computed: {
			...mapGetters(['personalRelated', 'shareRelated']),
			currentRelated() {
				let related = {}
				switch (this.pageType) {
					case 'personal':
						related.data = this.personalRelated
						related.selectMethodName = 'selectPersonalFile'
						related.unselectMethodName = 'unselectPersonalFile'
						related.selectAllMethodName = 'selectAllPersonalFile'
						related.setMethodName = 'setPersonalDatas'
						related.unselectAllMethodName = 'unselectAllPersonalFile'
						related.clearMethodName = 'clearPersonalDatas'
						related.resetMethodName = 'resetPersonal'
						break;
					case 'share':
						related.data = this.shareRelated
						related.selectMethodName = 'selectShareFile'
						related.unselectMethodName = 'unselectShareFile'
						related.selectAllMethodName = 'selectAllShareFile'
						related.setMethodName = 'setShareDatas'
						related.unselectAllMethodName = 'unselectAllShareFile'
						related.clearMethodName = 'clearShareDatas'
						related.resetMethodName = 'resetShare'
						break;
					default:
						break;
				}
				return related
			}
		},
		watch: {
			'currentRelated.data.selectedDatas.length': {
				handler(newLength) {
					if (newLength) {
						if (newLength === this.listData.length) {
							// 通过单个选择达到了全选状态 只需要改变标识符
							this.$store.commit(this.currentRelated.selectAllMethodName)
						} else {
							// 此时为单个选择 并且还不是全选状态 标识符为 false
							this.$store.commit(this.currentRelated.unselectAllMethodName)
						}
					} else {
						// 都取消了勾选
						console.log('选中0个')
					}
				},
				deep: true
			}
		},
		data() {
			return {}
		},
		methods: {
			judgeActive(data) {
				let index = this.currentRelated.data.selectedDatas.findIndex((item) => {
					return item.id === data.id
				})
				if (index !== -1) {
					return true
				}
				return false
			},
			handleCheck(data) {
				let isChecked = this.judgeActive(data)
				if (isChecked) {
					// 取消选中
					this.$store.commit(this.currentRelated.unselectMethodName, data)
				} else {
					// 选中
					this.$store.commit(this.currentRelated.selectMethodName, data)
				}
			},
			fileIcon(data) {
				let typeFlag
				if (this.pageType === 'share' && this.fileId === 'rootpath') {
					typeFlag = 2
				}
				return utils.getIcon(data, typeFlag)
			},
			transformSize(data) {
				return utils.transformSize(data)
			},
			transformTime(data) {
				return utils.transformTime(data)
			},
			arrowIcon(data) {
				return data.showOperationBar ? 'up' : 'down'
			},
			switchHandleOperationBar(data) {
				this.$set(data, 'showOperationBar', !data.showOperationBar)
			},
			handleFile(data) {
				console.log('点击文件 data', data)
				if (data.isDir) {
					// 文件夹下探
					// 添加面包屑
					let param = {
						fileId: data.id,
						fileName: data.fileName,
						parentId: data.pid,
					}
					this.$refs.breadCrumb.crumbPush(param)
				} else {
					// 预览
					console.log('preview')
				}
			},
			downloadFile(file) {
				let requestPath = downloadSingle.path + '?fileId=' + file.id
				// #ifdef APP-PLUS
				let downloadItem = uni.$myUtils.downloader.createDownloadItem(file)
				uni.$myUtils.downloader.downloadFile(downloadItem, requestPath)
				// #endif

				// #ifdef H5
				uni.$myUtils.downloader.downloadFile(file, requestPath)
				// #endif
			}
		}
	}
</script>

<style lang="scss" scoped>
	@import '@/common/styles/styles.scss';

	.list-container {
		padding-top: 50rpx;
		width: 100%;

		.bread-crumb {
			height: 50rpx;
			line-height: 50rpx;
			width: 100%;
			padding: 0 20rpx;
			border-bottom: 1px solid rgba(127, 131, 137, .5);
			background-color: #fafafa;
			position: fixed;
			z-index: 1;
			top: calc(var(--status-bar-height) + 50px);
			white-space: nowrap;
			overflow-x: auto;
		}

		.body-container {
			padding-top: 5px;
			padding-bottom: 5px;
			padding-right: 5px;
			padding-left: 10px;
			height: 80rpx;
			width: calc(100% - 15px);
			display: flex;

			.check-box-container {
				width: 8%;
				display: flex;
				justify-content: center;
				align-items: center;

				.check-box {
					width: 25rpx;
					height: 25rpx;
					display: flex;
					justify-content: center;
					align-items: center;
					border-radius: 50%;
					border: 1px solid #7f8389;

					.check-box-checked {
						width: 16rpx;
						height: 16rpx;
						border-radius: 50%;
					}
				}

				.check-box-active-border {
					border: 1px solid $cloud-theme-color;
				}

				.check-box-active {
					background-color: $cloud-theme-color;
				}
			}

			.body-icon {
				width: 10%;
				height: 100%;
				display: flex;
				align-items: center;

				.file-icon {
					width: 60rpx;
					height: 60rpx;
				}
			}

			.less-width {
				width: 74% !important;
			}

			.body-content {
				width: 82%;
				height: 100%;
				display: flex;

				.content-left {
					width: 75%;
					display: flex;
					flex-direction: column;
					align-items: flex-start;

					.file-name {
						font-size: 28rpx;
						height: 65%;
						width: 100%;
						display: flex;
						align-items: center;
						justify-content: flex-start;
						white-space: nowrap;
						overflow-x: auto;

						&::-webkit-scrollbar {
							display: none;
						}
					}

					.file-time {
						font-size: 22rpx;
						height: 35%;
						display: flex;
						align-items: center;
						justify-content: flex-start;
						color: #7f8389;
					}
				}

				.content-right {
					width: 25%;
					display: flex;
					justify-content: flex-end;
					align-items: center;

					.file-size {
						font-size: 22rpx;
						color: #7f8389;
					}
				}
			}

			.body-arrow {
				width: 8%;
				height: 100%;
				display: flex;
				align-items: center;
				justify-content: center;
				color: #7f8389;

				.arrow-icon {
					font-size: 24rpx;
				}
			}
		}

		.operation-bar-container {
			height: 80rpx;
			width: 100%;
			background-color: #fafafa;
		}

		::v-deep .uni-list-item__container {
			padding: 0;
		}
	}
</style>