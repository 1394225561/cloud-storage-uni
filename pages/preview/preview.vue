<template>
	<view class="preview-file-container">
		<view class="file-name">
			{{ currentPreview.file.fileName }}
		</view>
		<u-parse v-if="article" :content="article" @preview="preview" @navigate="navigate" noData="无内容" />
	</view>
</template>

<script>
	import uParse from '@/components/gaoyia-parse/parse.vue'
	import {
		mapGetters
	} from 'vuex'

	export default {
		components: {
			uParse
		},
		data() {
			return {
				article: ''
			}
		},
		computed: {
			...mapGetters(['currentPreview'])
		},
		onLoad() {
			this.getContent()
		},
		methods: {
			getContent() {
				const file = this.currentPreview.file
				const API = this.currentPreview.src
				let params = {
					fileId: file.fileId
				}
				if (file.shareId) {
					params.assignedShareId = file.shareId
				}
				uni.$myUtils.request({
					api: API,
					params
				}).then((data) => {
					this.article = data.data
				})
			},
			preview(src, e) {
				// do something
			},
			navigate(href, e) {
				// do something
			}
		}
	}
</script>

<style lang="scss" scoped>
	.preview-file-container {
		.file-name {
			width: 100%;
			height: 50rpx;
			line-height: 50rpx;
			white-space: nowrap;
			overflow-x: auto;
			text-align: center;
			margin-top: 10px;

			&::-webkit-scrollbar {
				display: none;
			}
		}

		::v-deep .wxParse {
			margin: 10px auto;
			width: 95vw;
			padding: 20px 10px;
			box-sizing: border-box;
			border-radius: 10px;
			border: 1px solid #E0E0E0;
			box-shadow: 2px 2px 10px #7d7d7d;
		}
	}
</style>