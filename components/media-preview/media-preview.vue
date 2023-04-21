<template>
	<view v-if='previewingMedia' class="media-container">
		<icon-font class="close-media" icon="close-circle" :is-colourful="false"
			@click.native="closeMediaPreview"></icon-font>
		<view v-if="isVideo" class="container">
			<video id="myVideo" ref="myVideo" :src="currentPreview.src" @error="videoErrorCallback"
				:autoplay="true"></video>
		</view>
		<view v-if="isAudio" class="container">
			<audio id="myAudio" style="text-align: left" :src="currentPreview.src" poster=""
				:name="currentPreview.file.fileName" author="" :action="audioAction" controls
				@error="audioErrorCallback"></audio>
		</view>
	</view>
</template>

<script>
	import {
		mapGetters
	} from 'vuex'
	import utils from '@/utils/utils.js'

	export default {
		name: "media-preview",
		props: {
			pageType: {
				type: String,
				default: 'personal'
			}
		},
		computed: {
			...mapGetters(['currentPreview']),
			isVideo() {
				return this.currentPreview.type === 'media-video'
			},
			isAudio() {
				return this.currentPreview.type === 'media-audio'
			}
		},
		data() {
			return {
				previewingMedia: false,
				audioAction: {
					method: 'pause'
				},
				src: ''
			}
		},
		beforeMount() {
			uni.$on(`${this.pageType}previewMedia`, this.previewMedia)
		},
		beforeDestroy() {
			uni.$off(`${this.pageType}previewMedia`)
		},
		methods: {
			closeMediaPreview() {
				this.previewingMedia = false
			},
			previewMedia() {
				console.log('currentPreview', this.currentPreview)
				// this.src = this.currentPreview.src
				this.previewingMedia = true
				// this.$nextTick(() => {
				// 	let videoDom = document.getElementById('myVideo').firstChild.firstChild
				// 	videoDom.load()
				// 	videoDom.play()
				// })
			},
			videoErrorCallback(e) {
				console.log('video ErrorCallback', e)
				this.closeMediaPreview()
				utils.showModal({
					title: '预览提示',
					content: e.target.errMsg || '视频加载失败',
					showCancel: false
				})
			},
			audioErrorCallback(e) {
				console.log('audio ErrorCallback', e)
				this.closeMediaPreview()
				const errCode = Number(e.detail.errMsg || 0)
				const errList = ['获取资源被用户禁止', '网络错误', '解码错误', '不合适资源']
				utils.showModal({
					title: '预览提示',
					content: errList[errCode - 1] || '音频加载失败',
					showCancel: false
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	.media-container {
		width: 100%;
		height: 100%;
		position: fixed;
		top: 0;
		background-color: rgba(0, 0, 0, 0.5);

		.close-media {
			font-size: 50rpx;
			color: rgba(0, 0, 0, 0.7);
			position: absolute;
			top: 300rpx;
			right: 75rpx;
		}

		.container {
			width: 100%;
			height: 100%;
			display: flex;
			justify-content: center;
			align-items: center;

			#myVideo,
			#myAudio {
				max-width: 88vw;
			}
		}
	}
</style>