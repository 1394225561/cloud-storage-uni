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
		<!-- 导航栏操作popup -->
		<view class="popup-container">
			<uni-popup ref="popup" background-color="#fff" @change="popupChange">
				<view class="popup-content">
					<text class="text">popup 内容</text>
				</view>
			</uni-popup>
		</view>
		<!-- 列表 -->
		<file-list :list-data="listData"></file-list>
		<!-- 上拉加载更多 -->
		<uni-load-more color="#007AFF" :status="status" :contentText='contentText' />
	</view>
</template>

<script>
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
				status: 'more',
				statusOptions: ['more', 'loading', 'noMore'],
				contentText: {
					contentdown: '上拉查看更多',
					contentrefresh: '加载中...',
					contentnomore: '没有更多数据了'
				},
				listData: [{
						id: 1
					},
					{
						id: 2
					},
					{
						id: 3
					},
					{
						id: 4
					},
					{
						id: 5
					},
					{
						id: 6
					},
					{
						id: 7
					},
					{
						id: 8
					},
					{
						id: 9
					},
					{
						id: 10
					},
					{
						id: 11
					},
					{
						id: 12
					},
					{
						id: 13
					},
					{
						id: 14
					},
					{
						id: 15
					},
					{
						id: 16
					},
					{
						id: 17
					},
					{
						id: 18
					},
					{
						id: 19
					},
					{
						id: 20
					},
					{
						id: 21
					},
					{
						id: 22
					},
					{
						id: 23
					}
				]
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
				return this.isSelecting ? this.isSelectedAll ? '反全选' : '全选' : '操作'
			},
			isSelectedAll() {
				return true
			},
			rightText() {
				return this.isSelecting ? '取消' : '选择'
			}
		},
		beforeCreate() {
			setTimeout(() => {
				this.breadCrumb.push('1')
			}, 3000)
		},
		beforeMount() {
			uni.$on('loadMore', this.loadMore)
		},
		beforeDestroy() {
			console.log('beforeDestroy')
			uni.$off('loadMore', this.loadMore)
		},
		methods: {
			clickLeft() {
				console.log('back <<<<<<<<<<<')
			},
			clickRight() {

			},
			clickLeftText() {
				console.log('left')
				if (this.isSelecting) {
					// 全选/取消全选
					if (this.isSelectedAll) {
						console.log('取消全选')
					} else {
						console.log('全选')
					}
				} else {
					// 展开下拉操作界面
					this.$refs.popup.open('top')
				}
			},
			clickRightText() {
				console.log('right')
				this.isSelecting = !this.isSelecting
			},
			popupChange() {

			},
			loadMore() {
				this.status = this.statusOptions[1]
				setTimeout(() => {
					this.status = this.statusOptions[0]
				}, 2000)
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
		.navbar-text-container {
			width: 100%;

			.left-text {
				float: left;
			}

			.right-text {
				float: right;
			}
		}

		.popup-content {
			@include flex;
			align-items: center;
			justify-content: center;
			padding: 30rpx;
			height: 150rpx;
			background-color: #fff;
			position: relative;
			z-index: 999;
			top: calc(var(--status-bar-height) + 50px);
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
