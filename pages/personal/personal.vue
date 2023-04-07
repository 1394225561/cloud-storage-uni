<template>
	<view>
		<file-page ref="filePage" :page-type='pageType'></file-page>
	</view>
</template>

<script>
	import {
		mapGetters
	} from 'vuex'

	export default {
		data() {
			return {
				pageType: 'personal'
			}
		},
		computed: {
			// 因为是首页 所以需要判断是否为登录状态
			...mapGetters([
				'isSignedIn'
			])
		},
		watch: {
			isSignedIn: {
				handler(newValue) {
					if (newValue) {
						this.$nextTick(() => {
							// 登录状态下 再初始化应用数据
							this.$store.dispatch('getTenantInfo')
							this.$store.dispatch('getPermissionBtns')
							this.$store.dispatch('getCanBeUploadType')
							this.$refs.filePage.refreshList()
						})
					}
				},
				immediate: true
			}
		},
		onLoad(option) {
			console.log('personal onLoad', option.fromLogin)
		},
		onShow() {
			if (this.isSignedIn) {
				this.$nextTick(() => {
					this.$refs.filePage.refreshList()
				})
			}
		},
		onReady() {},
		onUnload() {},
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
			uni.$emit(`${this.pageType}refreshList`)
		},
		onReachBottom(args) {
			uni.$emit(`${this.pageType}loadMore`)
		},
		methods: {

		}
	}
</script>

<style lang="scss" scoped>

</style>