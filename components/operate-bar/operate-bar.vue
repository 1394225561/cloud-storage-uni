<template>
	<view class="operate-bar-container">
		<!-- 文件操作bar 兼容单文件、多文件选择 -->
		<view v-for="item in normalOptions" :key="item.id" class="operate-bar-item">
			<icon-font id="option" :class="['operate-item-icon', item.disabled ? 'disabled' : '']"
				:icon="getOperateBarIcon(item)" :is-colourful="false"
				@click.native="handleEvent(item.event, item, $event)"></icon-font>
		</view>
		<!-- 单文件操作bar 更多操作 -->
		<view v-if="isSingle && options.length > spliceNum" class="operate-bar-item">
			<icon-font :class="['operate-item-icon']" icon="ellipsis" :is-colourful="false"
				@click.native="showMore"></icon-font>
		</view>
		<!-- 单文件操作bar 需要底部弹出popup进行更多操作 -->
		<uni-popup v-if="isSingle" ref="operate-popup" type="bottom" class="operate-popup">
			<view :class="['operate-popup-content', isSelecting ? 'more-bottom-distance' : '']">
				<view v-for="item in action" :key="item.id" class="operate-popup__item"
					@click="handleEvent(item.event, item, $event, true)">
					<text>{{ item.toolTip }}</text>
				</view>
			</view>
		</uni-popup>
	</view>
</template>

<script>
	import {
		getSingleOptions,
		getFullMultiOptions
	} from '@/utils/operation-auth.js'
	import {
		mapGetters
	} from 'vuex'

	export default {
		name: "operate-bar",
		props: {
			//  业务类型 personal(个人文件),share(共享文件),otherShare(他人分享),favorite(我的收藏)
			pageType: {
				type: String,
				default: 'personal'
			},
			isSingle: {
				type: Boolean,
				default: true
			},
			fileData: {
				type: Object,
				default: () => {
					return {}
				}
			},
			fileId: {
				type: String,
				default: 'rootpath'
			},
			isEnableTts: {
				type: Boolean,
				default: false
			},
			isSelecting: {
				type: Boolean,
				default: false
			}
		},
		computed: {
			isRootPath() {
				return this.fileId === 'rootpath'
			},
			normalOptions() {
				if (this.isSingle) {
					return this.options.filter((item, index) => {
						return index < this.spliceNum
					})
				} else {
					return this.options
				}
			},
			...mapGetters([
				'tenantInfo', 'details', 'personalRelated', 'shareRelated'
			]),
			currentRelated() {
				let related = {}
				switch (this.pageType) {
					case 'personal':
						related.data = this.personalRelated
						break;
					case 'share':
						related.data = this.shareRelated
						break;
					default:
						break;
				}
				return related
			},
			operatePopupCloseMethodName() {
				// 拼接id 确保每个operate-bar都有唯一的关闭popup方法名
				let name = `closeOperatePopup${this.fileData.id || 'batchBar'}${this.pageType}`
				return name
			}
		},
		watch: {
			currentRelated: {
				handler(newValue) {
					this.getCurrentOptions()
				},
				deep: true
			}
		},
		data() {
			return {
				spliceNum: 5,
				options: [],
				action: [],
				actionPopupIsShow: false,
				sharLink: null,
				type: null
			}
		},
		created() {
			if (this.isSingle) {
				let point = this.fileData.fileName.lastIndexOf('.')
				this.type = this.fileData.fileName.substring(point + 1).toLowerCase()
				this.sharLink = uni.$myUtils.config.baseUrl.cloudStorage + (this.fileData.shareUrl || '')
				// console.log('this.sharLink', this.sharLink)
			}
			this.getCurrentOptions()
		},
		beforeMount() {
			uni.$on(this.operatePopupCloseMethodName, this.closeOperatePopup)
		},
		beforeDestroy() {
			uni.$off(this.operatePopupCloseMethodName)
		},
		methods: {
			getOperateBarIcon(item) {
				let iconName
				if (item.id === 'collect') {
					let index = this.fileData.isFavorite ? 1 : 0
					iconName = item.iconClass[index]
				} else if (item.id === 'lock') {
					let index = this.fileData.isLock ? 1 : 0
					iconName = item.iconClass[index]
				} else {
					iconName = item.iconClass
				}
				return iconName
			},
			getCurrentOptions() {
				let handler = this.isSingle ? getSingleOptions : getFullMultiOptions
				let data = this.isSingle ? this.fileData : this.currentRelated.data.selectedDatas
				let options = handler(this.pageType, data, this.isRootPath, this.details) || []
				options.sort(this.sortOps('sort'))
				this.options = options
				this.getActions()
				// this.emitChange()
			},
			sortOps(prop) {
				return function(a, b) {
					var value1 = a[prop]
					var value2 = b[prop]
					return value1 - value2
				}
			},
			showMore() {
				this.actionPopupIsShow = true
				this.$refs['operate-popup'].open()
				// 记录当前显示popup的operate-bar注册的方法名到vuex中 因为同时只可能有一个popup显示
				this.$store.commit('setCurrentOperatePopupCloseMethodName', this.operatePopupCloseMethodName)
			},
			closeOperatePopup() {
				if (this.isSingle && this.actionPopupIsShow) {
					this.actionPopupIsShow = false
					this.$refs['operate-popup'].close()
					// 关闭popup时需要将vuex中的数据恢复
					this.$store.commit('setCurrentOperatePopupCloseMethodName', '')
				}
			},
			emitChange() {
				this.$parent.$emit('listenSingleOptionBar', this.options)
			},
			getActions() {
				if (this.options.length > this.spliceNum) {
					this.action = this.options.filter((item, index) => {
						return index >= this.spliceNum
					})
				}
				// 如果启用了TTS,且文件格式为txt或word,那么更多里面加入读一读功能
				if (this.isEnableTts) {
					let readOption = {
						toolTip: '读一读(支持word,txt)',
						event: 'readFile',
						iconClass: '',
						sort: 99
					}
					// #ifdef H5
					return
					// #endif
					if (this.type === 'txt' || this.type === 'doc' || this.type === 'docx') {
						this.action.push({
							name: readOption.toolTip,
							method: () => {
								this.handleEvent(readOption.event, readOption)
							}
						})
					}
				}
			},
			handleEvent(eventType, item, e, isFromMoreAction = false) {
				if (isFromMoreAction) {
					this.closeOperatePopup()
				}
				let data = this.isSingle ? this.fileData : this.currentRelated.data.selectedDatas
				console.log('eventType', eventType)
				console.log('item', item)
				console.log('data', data)
			}
		}
	}
</script>

<style lang="scss" scoped>
	.operate-bar-container {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;

		.operate-bar-item {
			flex: 1;
			display: flex;
			justify-content: center;
			align-items: center;

			.operate-item-icon {
				font-size: 36rpx;
				color: #7f8389;
			}
		}

		.operate-popup {
			width: 100%;

			.operate-popup-content {
				background-color: white;
				position: relative;
				/* #ifdef H5 */
				bottom: 50px;
				/* #endif */
			}

			.more-bottom-distance {
				// 底部全选操作栏高度 + 底部tabbar默认高度
				bottom: calc(80rpx + 50px);
			}

			.operate-popup__item {
				width: 100%;
				height: 70rpx;
				line-height: 70rpx;
				text-align: center;
				color: #7f8389;
				font-size: 12px;
			}

			.operate-popup__item:not(:last-child) {
				border-bottom: 1px solid rgba(127, 131, 137, .5);
			}
		}
	}
</style>