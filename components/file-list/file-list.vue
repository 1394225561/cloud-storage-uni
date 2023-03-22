<template>
	<uni-list class="list-container">
		<view @click="onClick" class="bread-crumb">
			面包屑
		</view>
		<uni-list-item v-for="(data, index) in listData" :key="data.id" :clickable="true" @click="downloadFile(data)"
			:title="data.fileName + ''">
		</uni-list-item>
	</uni-list>
</template>

<script>
	import {
		downloadSingle
	} from '@/common/apis/file/file.js'

	export default {
		name: "file-list",
		props: {
			listData: {
				type: Array,
				default: () => []
			}
		},
		data() {
			return {}
		},
		methods: {
			onClick(e) {

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

		::v-deep .uni-list-item__content-title {
			// color: $cloud-theme-color;
		}
	}
</style>
