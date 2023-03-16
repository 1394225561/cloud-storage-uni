<template>
	<view>
		<file-page ref="filePageShare" :page-type='pageType'></file-page>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				pageType: 'share'
			}
		},
		onShow() {
			this.$nextTick(() => {
				this.$refs.filePageShare.refreshList()
			})
		},
		onTabItemTap(args) {
			console.log('onTabItemTap', args)
		},
		onPullDownRefresh(args) {
			uni.$emit('refreshList')
		},
		onReachBottom(args) {
			uni.$emit('loadMore')
		}
	}
</script>

<style lang="scss" scoped>

</style>
