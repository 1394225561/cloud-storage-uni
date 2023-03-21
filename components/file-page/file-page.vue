<template>
	<view class="file-page-container">
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
				<operate-popup :page-type="pageType" :permission-type="permissionType" :option="option">
				</operate-popup>
			</uni-popup>
			<!-- 底部全选popup -->
			<uni-popup ref="selectPopup" :mask-click="false" background-color="#fff" @change="selectPopupChange">
				<view class="select-popup">
					<text class="select-popup__select" @click="changeSelectedAll">
						{{ isSelectedAll ? '取消全选' : '全选' }}
					</text>
					<text class="select-popup__text">
						{{ `已选择${isSelectedAll}个文件` }}
					</text>
				</view>
			</uni-popup>
		</view>
		<!-- 列表 -->
		<file-list :list-data="listData"></file-list>
		<!-- 上拉加载更多 -->
		<uni-load-more color="#007AFF" :status="status" :contentText='contentText' />
		<i-uploader :page-type="pageType" :dir-id="listParam.fileId" :dir-name="listParam.fileName"
			:file-category="fileCategory" :option="option"></i-uploader>
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
				breadCrumb: [],
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
			leftIcon() {
				if (this.breadCrumb.length) {
					return 'left'
				} else {
					return ''
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
				// return this.isSelecting ? this.isSelectedAll ? '取消全选' : '全选' : '操作'
				return '操作'
			},
			isSelectedAll() {
				return true
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
			}
		},
		created() {
			// this.refreshList()
		},
		beforeMount() {
			console.log('beforeMount')
			uni.$on('refreshList', this.refreshList)
			uni.$on('loadMore', this.loadMore)
		},
		beforeDestroy() {
			console.log('beforeDestroy')
			uni.$off('refreshList', this.refreshList)
			uni.$off('loadMore', this.loadMore)
		},
		methods: {
			clickLeft() {
				if (!this.leftIcon) {
					return
				}
				console.log('back <<<<<<<<<<<')
			},
			clickRight() {

			},
			clickLeftText() {
				// if (this.isSelecting) {
				// 	// 全选/取消全选
				// 	if (this.isSelectedAll) {
				// 		console.log('取消全选')
				// 	} else {
				// 		console.log('全选')
				// 	}
				// } else {
				// 	// 展开下拉操作界面
				// 	this.$refs.popup.open('top')
				// }
				if (this.isSelecting) {
					return
				}
				this.$refs.popup.open('top')
			},
			clickRightText() {
				if (this.isSelecting) {
					this.$refs.selectPopup.close()
				} else {
					this.$refs.popup.close()
					this.$refs.selectPopup.open('bottom')
				}
				this.isSelecting = !this.isSelecting
			},
			popupChange(e) {
				console.log('popupChange', e)
			},
			selectPopupChange(e) {
				console.log('selectPopupChange', e)
			},
			changeSelectedAll() {
				console.log('this.isSelectedAll', this.isSelectedAll)
			},
			getListData(isLoadMore = false) {
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
						console.log('getListData data ==========>', res)
						let data = res.data
						if (!isLoadMore) {
							this.listData = data.content
						}
						this.isLast = data.last
						this.status = data.last ? this.statusOptions[2] : this.statusOptions[0]
						this.permissionType = data.permissionType || -1
						resolve(data)
					}).catch((error) => {
						console.log('getListData error', error)
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
					console.log('loadMore newData', newData)
					this.listData = this.listData.concat(newData.content)
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	@mixin flex {
		/* #ifndef APP-NVUE */
		display: flex;
		/* #endif */
		flex-direction: row;
	}

	.file-page-container {
		/* #ifdef H5 */
		padding-bottom: calc(40px + 50rpx);
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

		.popup-container {
			.select-popup {
				height: 80rpx;
				display: flex;
				align-items: center;
				padding: 0 20px;
				font-size: 12px;
				position: relative;
				z-index: 100;
				/* #ifdef H5 */
				bottom: 50px;
				/* #endif */
				background-color: white;

				.select-popup__select {
					flex: 1;
					text-align: left;
				}

				.select-popup__text {
					flex: 3;
					text-align: right;
				}
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
