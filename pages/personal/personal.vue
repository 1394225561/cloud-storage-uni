<template>
	<view>
		<file-page :page-type='pageType'></file-page>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				pageType: 'personal'
			}
		},
		onTabItemTap(args) {
			console.log('onTabItemTap', args)
		},
		onNavigationBarButtonTap(args) {
			console.log('onNavigationBarButtonTap', args)
			const index = args.index
			if (index === 0) {
				// uni.$emit('clickNavbarLeft', args)
			} else if (index === 1) {
				// uni.$emit('clickNavbarRight', args)
			} else {

			}
		},
		onPullDownRefresh(args) {
			setTimeout(function() {
				uni.stopPullDownRefresh()
			}, 3000)
		},
		onReachBottom(args) {
			uni.$emit('loadMore')
		}
	}
</script>

<style lang="scss" scoped>

</style>
