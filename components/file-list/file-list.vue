<template>
	<uni-list class="list-container">
		<view @click="onClick" class="bread-crumb">
			面包屑
		</view>
		<uni-list-item direction="column" v-for="(data, index) in listData" :key="data.id" :clickable="false"
			:title="data.fileName + ''">
			<template v-slot:body>
				<view class="body-container">
					<view class="body-icon">
						<icon-font class="file-icon" :icon="fileIcon(data)"></icon-font>
					</view>
					<view class="body-content" @click="handleFIle(data)">
						<view class="content-left">
							<span class="file-name">{{ data.fileName }}</span>
							<span class="file-time">{{ transformTime(data.gmtModified) }}</span>
						</view>
						<view v-if="data.length" class="content-right">
							<span class="file-size">{{ transformSize(data.length) }}</span>
						</view>
					</view>
					<view class="body-arrow" @click="handleOperationBar(data)">
						<icon-font class="arrow-icon" :icon="arrowIcon(data)" :is-colourful="false"></icon-font>
					</view>
				</view>
			</template>
			<template v-slot:footer>
				<view v-show="data.showOperationBar" class="operation-bar-container">
					<text>
						operation bar
					</text>
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

	export default {
		name: "file-list",
		props: {
			listData: {
				type: Array,
				default: () => []
			}
		},
		computed: {

		},
		data() {
			return {}
		},
		methods: {
			onClick(e) {

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
			arrowIcon(data) {
				return data.showOperationBar ? 'up' : 'down'
			},
			handleOperationBar(data) {
				this.$set(data, 'showOperationBar', !data.showOperationBar)
			},
			handleFIle(data) {
				if (data.isDir) {
					console.log('next')
				} else {
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
			width: 100%;
			position: fixed;
			z-index: 1;
			top: calc(var(--status-bar-height) + 50px);
			background-color: white;
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