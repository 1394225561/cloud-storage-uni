<template>
	<view :class="{
		'transfer-page-container': true,
		'fix-tab-bar': isSelecting
	}">
		<uni-nav-bar :title="navbarTitle" backgroundColor="#44474d" fixed="true" statusBar="true" color="#ffffff"
			:height="50" :leftWidth="70" :rightWidth="70">
			<view class="clear-float navbar-text-container" slot="right">
				<text v-show="tableList.length && current !== 2" class="right-text"
					@tap="clickRightText">{{ rightText }}</text>
			</view>
		</uni-nav-bar>
		<!-- 公告栏 -->
		<uni-notice-bar show-icon scrollable :text="noticeBarText" :font-size="12" :speed="50" />
		<!-- tab栏 -->
		<uni-segmented-control :current="current" :values="tabItems" style-type="text" active-color="#E4393C"
			@clickItem="onClickTabItem" />
		<!-- 列表 -->
		<uni-list class="list-container">
			<uni-list-item direction="column" v-for="(data, index) in tableList"
				:key="data.guid || data.id || data.fileId" :clickable="false" :title="data.fileName">
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
						<view :class="['body-content', isSelecting ? 'less-width' : '']">
							<view class="content-left">
								<span class="file-name">{{ data.fileName }}</span>
								<span class="file-time">{{ transformTime(data.time || data.gmtModified) }}</span>
							</view>
							<view class="content-right">
								<span class="file-size">{{ transformSize(data.size || data.length) }}</span>
							</view>
						</view>
						<view class="body-state">
							<view v-if="data.handleResult !== undefined" class="body-state__sensitive">
								<view class="body-state__sensitive__cancel" @click="handleIntercept(data,'cancel')">
									放弃
								</view>
								<view class="body-state__sensitive__upload" @click="handleIntercept(data,'upload')">
									上传
								</view>
							</view>
							<view v-else :class="{
								'body-state__state': true,
								'upload-success': data.stateCode === 'success',
								'upload-error': data.stateCode === 'error' || data.stateCode === 'intercept'
							}">
								{{ data.state }}
							</view>
						</view>
					</view>
				</template>
				<template v-slot:footer>
					<!-- 涉敏列表 -->
					<view v-if="data.handleResult !== undefined" class="operation-bar-container">
						{{ `包含预警关键字:${data.handleMessage}` }}
					</view>
					<view v-else>
						<!-- 上传列表 本次构建的上传文件 且状态为：上传失败、拦截 -->
						<view
							v-show="data.handleResult === undefined && (data.stateCode === 'error' || data.stateCode === 'intercept') && data.stateText"
							class="operation-bar-container">
							{{ data.stateText }}
						</view>
						<!-- app端文件下载成功后的本地路径 -->
						<view v-show="data.savePath" class="operation-bar-container">
							{{ data.savePath }}
						</view>
					</view>
				</template>
			</uni-list-item>
		</uni-list>
		<!-- 选择文件状态 底部栏 -->
		<uni-transition ref="aniTransfer" custom-class="transition" :mode-class="['fade', 'slide-bottom']"
			:show="isSelecting">
			<view class="select-popup">
				<view class="select-popup__select" @click="changeSelectedAll">
					<view class="check-box-container">
						<view :class="['check-box', isSelectedAll ? 'check-box-active-border' : '']">
							<view :class="['check-box-checked', isSelectedAll ? 'check-box-active' : '']">
							</view>
						</view>
					</view>
					{{ isSelectedAll ? '取消全选' : '全选' }}
				</view>
				<view class="select-popup__cancel" @click="clickRightText">
					<icon-font class="select-popup__cancel__icon" icon="close-circle-o"
						:is-colourful="false"></icon-font>
				</view>
				<text class="select-popup__text">
					{{ `已选择 ${selectedDatas.length} 个文件` }}
				</text>
			</view>
			<view class="operation-list">
				<view class="delete-btn">

				</view>
			</view>
		</uni-transition>
	</view>
</template>

<script>
	import {
		mapGetters
	} from 'vuex'
	import utils from '@/utils/utils.js'
	import {
		keepOnUpload,
		giveUpUpload
	} from '@/common/apis/file/file.js'

	export default {
		data() {
			return {
				isSelecting: false,
				navbarTitle: '传输列表',
				selectedDatas: [],
				current: 0
			}
		},
		computed: {
			...mapGetters([
				'uploaderList', 'sensitiveFileIds', 'unProcessList', 'downloadFileList', 'waitFileList', 'sysConfig'
			]),
			noticeBarText() {
				return this.sysConfig?.business?.alarmMsg || '严禁上传国家秘密和工作秘密信息'
			},
			tabItems() {
				let items = ['上传列表', '下载列表', '涉敏处理']
				// #ifdef H5
				items.splice(1, 1)
				// #endif
				return items
			},
			rightText() {
				return this.isSelecting ? '取消' : '选择'
			},
			tableList() {
				let datas
				switch (this.current) {
					case 0:
						// 上传列表数据：后端审核中的数据 + 上传列表中非涉敏的数据
						datas = (this.unProcessList.concat(this.uploaderList)).filter((item) => {
							return this.sensitiveFileIds.indexOf(item.fileId) === -1
						})
						break;
					case 1:
						// #ifdef APP-PLUS
						datas = this.downloadFileList
						// #endif
						// #ifdef H5
						datas = this.waitFileList
						// #endif
						break;
					case 2:
						// 通过接口获取的涉敏文件
						datas = this.waitFileList
						break;
					default:
						datas = []
						break;
				}
				console.log('transfer tableList', datas)
				return datas
			},
			isSelectedAll() {
				return this.selectedDatas.length === this.tableList.length
			},
		},
		watch: {
			isSelecting: {
				handler(newValue) {
					if (newValue) {
						let hideTimer = setTimeout(() => {
							uni.hideTabBar()
							clearTimeout(hideTimer)
						})
					} else {
						let showTimer = setTimeout(() => {
							uni.showTabBar()
							clearTimeout(showTimer)
						}, 300)
					}
				},
				immediate: true
			}
		},
		onLoad(option) {
			console.log('transfer onLoad')
		},
		onShow() {
			this.$nextTick(() => {
				this.getCurrentTabDatas()
			})
		},
		methods: {
			getCurrentTabDatas() {
				switch (this.current) {
					case 0:
						// this.$store.dispatch('getUnProcessList').then((res) => {
						// 	console.log('getUnProcessList', res)
						// })
						break;
					case 1:
						// #ifdef APP-PLUS
						// #endif
						// #ifdef H5
						this.$store.dispatch('getWaitFileList')
						// #endif
						break;
					case 2:
						this.$store.dispatch('getWaitFileList')
						break;
					default:
						break;
				}
			},
			clickRightText() {
				this.isSelecting = !this.isSelecting
			},
			changeSelectedAll() {
				if (this.isSelectedAll) {
					// 取消全选
					this.selectedDatas = []
				} else {
					// 全选
					this.selectedDatas = [...this.tableList]
				}
			},
			onClickTabItem(e) {
				if (this.current !== e.currentIndex) {
					this.current = e.currentIndex
				}
				this.getCurrentTabDatas()
				this.restore()
			},
			restore() {
				this.isSelecting = false
				this.selectedDatas = []
			},
			judgeActive(data) {
				// 从后台获取的审核中文件 或者 从后台获取的检测出涉敏的文件
				if (data.handleResult !== undefined || data.handleStatus !== undefined) {
					data.id = data.fileId
				}
				let index = this.selectedDatas.findIndex((item) => {
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
					let index = this.selectedDatas.findIndex((item) => {
						return item.id === data.id
					})
					this.selectedDatas.splice(index, 1)
				} else {
					// 选中
					this.selectedDatas.push(data)
				}
			},
			fileIcon(data) {
				return utils.getIcon(data)
			},
			transformSize(data) {
				return utils.transformSize(data)
			},
			transformTime(data) {
				return utils.transformTime(data)
			},
			handleIntercept(row, type) {
				let API = type === 'upload' ? keepOnUpload : giveUpUpload
				uni.$myUtils.request({
					api: API,
					params: {
						handleResultId: row.handleResultId
					}
				}).then((data) => {
					this.$store.dispatch('getWaitFileList')
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	@import '@/common/styles/styles.scss';

	@mixin flex {
		/* #ifndef APP-NVUE */
		display: flex;
		/* #endif */
		flex-direction: row;
	}

	.fix-tab-bar {
		/* #ifdef APP-PLUS */
		padding-bottom: calc(80rpx + 50px);
		/* #endif */
		/* #ifdef H5 */
		padding-bottom: calc(50px + 80rpx) !important;
		/* #endif */
	}

	.transfer-page-container {
		/* #ifdef H5 */
		padding-bottom: 50px;
		/* #endif */

		.navbar-text-container {
			width: 100%;

			.left-text {
				float: left;
			}

			.right-text {
				float: right;
			}
		}

		.list-container {
			width: 100%;

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
					width: 64% !important;
				}

				.body-content {
					width: 72%;
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

				.body-state {
					width: 18%;
					height: 100%;
					display: flex;
					align-items: center;
					justify-content: center;
					color: #7f8389;
					font-size: 24rpx;

					.body-state__state {}

					.upload-success {
						color: #42b983;
					}

					.upload-error {
						color: $cloud-theme-color;
					}

					.body-state__sensitive {
						width: 100%;
						height: 100%;
						display: flex;
						align-items: center;
						color: $cloud-theme-color;
						padding: 0 10rpx;

						.body-state__sensitive__cancel {
							flex: 1;
							text-align: center;
						}

						.body-state__sensitive__upload {
							flex: 1;
							text-align: center;
						}
					}
				}
			}

			.operation-bar-container {
				height: 50rpx;
				max-width: 100%;
				background-color: #fafafa;
				text-align: center;
				line-height: 50rpx;
				font-size: 24rpx;
				overflow-x: auto;
				padding: 0 24rpx;
				white-space: nowrap;

				&::-webkit-scrollbar {
					display: none;
				}
			}

			::v-deep .uni-list-item__container {
				padding: 0;
			}
		}

		.transition {
			width: 100%;
			background-color: #fafafa;
			position: fixed;
			z-index: 99999999;
			/* #ifdef H5 */
			bottom: 0;
			/* #endif */
			/* #ifdef APP-PLUS */
			bottom: var(--window-bottom);
			/* #endif */

			.select-popup {
				height: 80rpx;
				display: flex;
				align-items: center;
				padding: 0 20px;
				font-size: 12px;
				border-top: 1px solid rgba(127, 131, 137, .5);
				border-bottom: 1px solid rgba(127, 131, 137, .5);
				position: relative;

				.select-popup__select {
					flex: 1;
					text-align: left;
					display: flex;

					.check-box-container {
						width: 50rpx;
						display: flex;
						justify-content: center;
						align-items: center;
						margin-right: 5rpx;

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
				}

				.select-popup__cancel {
					width: 50px;
					height: 100%;
					position: absolute;
					left: 50%;
					transform: translateX(-50%);
					z-index: 1;
					display: flex;
					justify-content: center;
					align-items: center;
					color: #7f8389;

					.select-popup__cancel__icon {
						font-size: 36rpx;
					}
				}

				.select-popup__text {
					flex: 3;
					text-align: right;
				}
			}

			.operation-list {
				width: 100%;
				height: 50px;
			}
		}
	}
</style>