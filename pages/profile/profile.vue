<template>
	<view class="profile-container">
		<button type="default" class="login-button" @click="logout">退出登录</button>
		<button type="default" class="login-button" @click="goError">goError</button>
		<!-- #ifdef APP-PLUS -->
		<view @click="changeDownloadSavePath" class="downloadSavePath">
			{{ savePath }}
		</view>
		<!-- #endif -->
	</view>
</template>

<script>
	import {
		logout
	} from '@/common/apis/tenantApi/tenantApi.js'
	import {
		Downloader
	} from '@/utils/downloader.js'

	export default {
		data() {
			return {
				// #ifdef APP-PLUS
				savePath: uni.$myUtils.downloader.getSavePath() || Downloader.downloadPath,
				// #endif
			}
		},
		methods: {
			logout() {
				uni.$myUtils.request({
					api: logout
				}).then(() => {
					uni.$myUtils.toLogin()
				})
			},
			goError() {
				uni.$myRoute.router({
					url: '/pages/error/error',
					params: {
						error: {
							error: 'error'
						}
					}
				})
			},
			changeDownloadSavePath(e) {
				console.log('changeDownloadSavePath', e)
				console.log('plus.io.PUBLIC_DOWNLOADS', plus.io.convertLocalFileSystemURL('_downloads'))
				uni.$myUtils.downloader.getPath().then((result) => {
					this.savePath = result
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	.profile-container {
		.downloadSavePath {
			height: 50rpx;
			width: 100%;
			background-color: white;
			white-space: nowrap;
			overflow-x: auto;
		}
	}
</style>
