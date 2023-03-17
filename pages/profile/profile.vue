<template>
	<view>
		<button type="default" class="login-button" @click="logout">退出登录</button>
		<button type="default" class="login-button" @click="goError">goError</button>
	</view>
</template>

<script>
	import {
		logout
	} from '@/common/apis/tenantApi/tenantApi.js'

	export default {
		data() {
			return {

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
			}
		}
	}
</script>

<style lang="scss">

</style>
