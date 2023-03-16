<template>
	<uni-list class="list-container">
		<view class="bread-crumb">
			面包屑
		</view>
		<uni-list-item v-for="(data, index) in listData" :key="data.id" in :title="data.fileName + ''"></uni-list-item>
	</uni-list>
</template>

<script>
	export default {
		name: "file-list",
		props: {
			listData: {
				type: Array,
				default: () => []
			}
		},
		data() {
			return {

			};
		}
	}
</script>

<style lang="scss" scoped>
	@import '@/common/styles/styles.scss';

	.list-container {
		padding-top: 50rpx;

		.bread-crumb {
			height: 50rpx;
			width: 100%;
			position: fixed;
			z-index: 1;
			top: calc(var(--status-bar-height) + 50px);
			background-color: white;
		}

		::v-deep .uni-list-item__content-title {
			// color: $cloud-theme-color;
		}
	}
</style>
