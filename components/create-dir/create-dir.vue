<template>
	<view class="body-container__view">
		<view class="body-icon">
			<icon-font class="file-icon" :icon="fileIcon(data)"></icon-font>
		</view>
		<view :class="['body-content']">
			<view class="content-left">
				<view class="file-name">
					<uni-easyinput v-model="dirName" placeholder="请输入文件夹名称"></uni-easyinput>
				</view>
				<view v-show="createDirResult" class="file-result">
					{{ createDirResult }}
				</view>
			</view>
			<view class="content-right">
				<icon-font :class="['dir-icon']" icon="close-circle" :is-colourful="false"
					@click.native="cancel"></icon-font>
				<icon-font :class="['dir-icon']" icon="check-circle" :is-colourful="false"
					@click.native="submit"></icon-font>
			</view>
		</view>
	</view>
</template>

<script>
	import utils from '@/utils/utils.js'
	import {
		mkdir,
		shareFileMkdir
	} from '@/common/apis/file/file.js'

	export default {
		name: "create-dir",
		props: {
			data: {
				type: Object,
				default: () => {
					return {}
				}
			},
			pageType: {
				type: String,
				default: 'personal'
			},
			fileId: {
				type: String,
				default: 'rootpath'
			}
		},
		data() {
			return {
				dirName: '新建文件夹',
				createDirResult: ''
			}
		},
		methods: {
			fileIcon(data) {
				let typeFlag
				if (this.pageType === 'share' && this.fileId === 'rootpath') {
					typeFlag = 2
				}
				return utils.getIcon(data, typeFlag)
			},
			cancel() {
				uni.$emit(`${this.pageType}createDirCancel`, this.data)
			},
			submit() {
				if (!this.dirName) {
					this.createDirResult = '文件名不能为空'
					return
				}
				let result = utils.checkSpecialCharacters(this.dirName)
				if (!result.pass) {
					this.createDirResult = result.message
					return
				}
				uni.$myUtils.request({
					api: this.pageType === 'personal' ? mkdir : shareFileMkdir,
					params: {
						dirName: this.dirName,
						pid: this.fileId
					}
				}).then((data) => {
					uni.$emit(`${this.pageType}refreshList`)
					uni.$myUtils.showSuccessMsg("新建成功")
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	@import '@/common/styles/styles.scss';

	.body-container__view {
		width: 100%;
		height: 100%;
		display: flex;

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

		.body-content {
			width: 90%;
			height: 100%;
			display: flex;

			.content-left {
				width: 80%;
				height: 100%;
				display: flex;

				.file-name {
					flex: 4;
					height: 100%;
					position: relative;
					display: flex;
					align-items: center;
				}

				.file-result {
					flex: 3;
					font-size: 28rpx;
					height: 100%;
					display: flex;
					align-items: center;
					justify-content: flex-start;
					color: $cloud-theme-color;
					padding: 0 18rpx;
					white-space: nowrap;
					overflow-x: auto;

					&::-webkit-scrollbar {
						display: none;
					}
				}
			}

			.content-right {
				width: 20%;
				height: 100%;
				display: flex;
				justify-content: space-around;
				align-items: center;

				.dir-icon {
					flex: 1;
					height: 100%;
					font-size: 28rpx;
					color: #7f8389;
					display: flex;
					justify-content: center;
					align-items: center;
				}
			}
		}
	}
</style>