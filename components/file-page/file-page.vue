<template>
	<view :class="{
		'file-page-container': true,
		'fix-tab-bar': isSelecting
	}">
		<!-- <view class="status-bar"></view> -->
		<!-- 自定义导航栏 -->
		<uni-nav-bar :title="navbarTitle" backgroundColor="#44474d" fixed="true" statusBar="true" color="#ffffff"
			:left-icon="leftIcon" :height="50" :leftWidth="70" :rightWidth="70" @clickLeft='clickLeft'>
			<view class="clear-float navbar-text-container" slot="right">
				<text class="left-text" @tap="clickLeftText">{{ leftText }}</text>
				<text class="right-text" @tap="clickRightText">{{ rightText }}</text>
			</view>
		</uni-nav-bar>
		<view class="popup-container">
			<!-- 导航栏操作popup -->
			<uni-popup ref="popup" background-color="#fff" @change="popupChange">
				<operate-popup :page-type="pageType" :permission-type="permissionType" :option="option"
					:file-id="listParam.fileId">
				</operate-popup>
			</uni-popup>
		</view>
		<!-- 列表 -->
		<file-list :list-data="listData" :page-type="pageType" :file-id="listParam.fileId"
			:is-selecting="isSelecting"></file-list>
		<!-- 上拉加载更多 -->
		<uni-load-more color="#007AFF" :status="status" :contentText='contentText' />
		<!-- 上传实例 非单例 各页面间独立存在 -->
		<i-uploader :page-type="pageType" :dir-id="listParam.fileId" :dir-name="listParam.fileName"
			:file-category="fileCategory" :option="option"></i-uploader>
		<!-- 选择文件状态 底部栏 -->
		<uni-transition ref="ani" custom-class="transition" :mode-class="['fade', 'slide-bottom']" :show="isSelecting">
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
				<text class="select-popup__text">
					{{ `已选择${currentRelated.data.selectedDatas.length}个文件` }}
				</text>
			</view>
			<!-- 多文件操作bar -->
			<view class="operation-list">
				<operate-bar :page-type="pageType" :file-id="listParam.fileId" :is-single="false"></operate-bar>
			</view>
		</uni-transition>
	</view>
</template>

<script>
	import {
		getPersonalFile,
		getShareFile
	} from '@/common/apis/file/file.js'
	import {
		fileUpload
	} from '@/common/apis/file/file.js'
	import {
		mapGetters
	} from 'vuex'

	export default {
		name: "file-page",
		props: {
			pageType: {
				type: String,
				default: 'personal'
			}
		},
		data() {
			return {
				statusBar: 0, //状态栏高度
				isSelecting: false,
				status: 'noMore',
				statusOptions: ['more', 'loading', 'noMore'],
				contentText: {
					contentdown: '上拉查看更多',
					contentrefresh: '加载中...',
					contentnomore: '没有更多数据了'
				},
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
				listParam: {
					fileId: 'rootpath',
					fileName: 'rootpath',
					page: 0,
					size: 15,
					type: 'gmt_modified',
					order: 1
				},
				listData: [],
				isLast: true,
				permissionType: -1
			}
		},
		computed: {
			...mapGetters(['personalRelated', 'shareRelated', 'currentOperatePopupCloseMethodName']),
			currentRelated() {
				let related = {}
				switch (this.pageType) {
					case 'personal':
						related.data = this.personalRelated
						related.selectAllMethodName = 'selectAllPersonalFile'
						related.setMethodName = 'setPersonalDatas'
						related.unselectAllMethodName = 'unselectAllPersonalFile'
						related.clearMethodName = 'clearPersonalDatas'
						related.resetMethodName = 'resetPersonal'
						break;
					case 'share':
						related.data = this.shareRelated
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
			},
			isSelectedAll() {
				return this.currentRelated.data.isSelectedAll
			},
			leftIcon() {
				if (this.listParam.fileId === 'rootpath') {
					return ''
				} else {
					return 'left'
				}
			},
			navbarTitle() {
				let title
				switch (this.pageType) {
					case 'personal':
						title = '个人文件'
						break
					case 'share':
						title = '共享文件'
						break
					case 'transfer':
						title = '传输列表'
						break
					default:
						title = '未知'
						break
				}
				return title
			},
			leftText() {
				return '操作'
			},
			rightText() {
				return this.isSelecting ? '取消' : '选择'
			},
			fileCategory() {
				let fileCategory
				switch (this.pageType) {
					case 'personal':
						fileCategory = 1
						break
					case 'share':
						fileCategory = 2
						break
					case 'publicSpace':
						fileCategory = 3
						break
					default:
						fileCategory = -1
						break
				}
				return fileCategory
			}
		},
		watch: {
			listParam: {
				handler(newValue) {
					console.log('listParam newValue', newValue)
				},
				deep: true
			},
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
		created() {
			// this.refreshList()
		},
		beforeMount() {
			console.log('beforeMount')
			uni.$on(`${this.pageType}refreshList`, this.refreshList) // 下拉刷新
			uni.$on(`${this.pageType}loadMore`, this.loadMore) // 上拉加载更多
			uni.$on(`${this.pageType}updateFiles`, this.updateFiles) // 文件目录层级变化更新文件列表
		},
		beforeDestroy() {
			console.log('beforeDestroy')
			uni.$off(`${this.pageType}refreshList`)
			uni.$off(`${this.pageType}loadMore`)
			uni.$off(`${this.pageType}updateFiles`)
		},
		methods: {
			clickLeft() {
				if (!this.leftIcon) {
					return
				}
				uni.$emit(`${this.pageType}crumbPop`)
			},
			// 导航栏上的 “操作” 和 “选择” 操作互斥
			clickLeftText() {
				// 导航栏顶部 操作 入口按钮
				if (this.isSelecting) {
					// 取消文件选择状态
					this.clickRightText()
				}
				this.$refs.popup.open('top')
				this.closeOperatePopup()
			},
			closeOperatePopup() {
				// 关闭operate-bar中底部的更多操作popup
				// 当列表文件数量过多时 通讯过多可能影响性能
				// 所以
				// 通过每个operate-bar绑定唯一的方法名 并将显示了popup的bar的方法名保存到vuex中 实现精确通讯
				if (this.currentOperatePopupCloseMethodName) {
					uni.$emit(this.currentOperatePopupCloseMethodName)
				}
			},
			clickRightText() {
				// 导航栏顶部 选择 入口按钮
				if (!this.isSelecting) {
					// 打开文件选择时 确保顶部操作popup为关闭状态
					this.$refs.popup.close()
				}
				this.isSelecting = !this.isSelecting
			},
			popupChange(e) {},
			changeSelectedAll() {
				if (this.isSelectedAll) {
					// 取消全选
					this.$store.commit(this.currentRelated.unselectAllMethodName)
					this.$store.commit(this.currentRelated.clearMethodName)
				} else {
					// 全选
					this.$store.commit(this.currentRelated.selectAllMethodName)
					this.$store.commit(this.currentRelated.setMethodName, this.listData)
				}
			},
			getListData(isLoadMore = false) {
				if (!isLoadMore) {
					// 此时是获取新的文件列表 而不是上拉加载更多 需要清空vuex中选择的文件数据 即取消全选
					this.$store.commit(this.currentRelated.unselectAllMethodName)
					this.$store.commit(this.currentRelated.clearMethodName)
					this.closeOperatePopup()
				}
				let targetApi
				switch (this.pageType) {
					case 'personal':
						targetApi = getPersonalFile
						break
					case 'share':
						targetApi = getShareFile
						break
					default:
						targetApi = ''
						break
				}
				return new Promise((resolve, reject) => {
					uni.$myUtils.request({
						api: targetApi,
						params: this.listParam
					}).then((res) => {
						console.log('getListData ' + this.pageType + ' =======>', res)
						let data = res.data
						if (!isLoadMore) {
							this.listData = data.content
						}
						this.isLast = data.last
						this.status = data.last ? this.statusOptions[2] : this.statusOptions[0]
						this.permissionType = data.permissionType || -1
						resolve(data)
					}).catch((error) => {
						console.log('getListData error' + this.pageType + ' =======>', error)
					})
				})
			},
			reset() {
				// this.listData = []
				this.listParam.page = 0
				// this.listParam = {
				// 	fileId: 'rootpath',
				// 	page: 0,
				// 	size: 20,
				// 	type: 'gmt_modified',
				// 	order: 1
				// }
			},
			refreshList() {
				this.reset()
				this.getListData().finally(() => {
					uni.stopPullDownRefresh()
				})
			},
			loadMore() {
				if (this.isLast) {
					return
				}
				this.listParam.page++
				this.status = this.statusOptions[1]
				this.getListData(true).then((newData) => {
					console.log('loadMore newData' + this.pageType + ' =======>', newData)
					this.listData = this.listData.concat(newData.content)
					// 当上拉加载更多的时候 不需要清空vuex数据 但是需要将全选标识符改为false
					this.$store.commit(this.currentRelated.unselectAllMethodName)
				})
			},
			updateFiles(data) {
				this.reset()
				const {
					fileId,
					fileName
				} = data
				this.listParam.fileId = fileId
				this.listParam.fileName = fileName
				this.getListData().finally(() => {})
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

	.file-page-container {
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
<style lang="scss">
	.file-page-container {
		// .status-bar {
		// 	position: fixed;
		// 	top: 0;
		// 	height: var(--status-bar-height);
		// 	width: 100%;
		// 	z-index: 9999999999999999999999999;
		// 	background-color: #44474d;
		// }
	}
</style>