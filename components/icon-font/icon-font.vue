<template>
	<view>
		<i :class="['iconfont', iconFont]"></i>
	</view>
</template>

<script>
	export default {
		name: "icon-font",
		props: {
			icon: {
				type: String,
				require: true
			}
		},
		computed: {
			iconFont() {
				return 'icon-' + this.icon
			}
		},
		data() {
			return {

			}
		}
	}
</script>

<style lang="scss" scoped>
	@import '@/common/styles/styles.scss';

	.iconfont {
		font-size: 44px;
		color: $cloud-theme-color;
	}
</style>