<script>
	import {
		mapGetters
	} from 'vuex'

	export default {
		computed: {
			...mapGetters([
				'sysConfig'
			])
		},
		onLaunch: function() {
			console.log('App Launch')
			this.$store.dispatch('getSysConfig').then(() => {
				// #ifdef H5
				window.document.title = this.sysConfig.brandName
				// #endif
				this.$store.dispatch('userGetInfo').then(() => {
					this.$store.commit('SET_isSignedIn', true)
				}).catch(() => {
					this.$store.commit('SET_isSignedIn', false)
				})
			}).catch((error) => {
				let type = Object.prototype.toString.call(error)
				if (type === '[object Object]') {
					error = JSON.stringify(error)
				}
				uni.$myRoute.router({
					url: '/pages/error/error',
					type: 'redirectTo',
					params: {
						error
					}
				})
			})
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		}
	}
</script>

<style lang="scss">
	/*每个页面公共css */
	@import '@/common/styles/styles.scss';
	@import '@/uni_modules/uni-scss/index.scss';
	@import '@/static/iconfont/iconfont-weapp-icon.css';

	/* #ifndef APP-NVUE */
	@import '@/static/customicons.css';
	@import '@/static/iconfont/iconfont.css';

	// 设置整个项目的背景色
	page {
		background-color: #f5f5f5;
		height: 100%;
	}

	/* #endif */

	.example-info {
		font-size: 14px;
		color: #333;
		padding: 10px;
	}

	.uni-page-head-btn {
		text-align: center;
	}
</style>