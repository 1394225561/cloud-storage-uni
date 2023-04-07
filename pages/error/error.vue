<template>
	<view>
		<text>
			{{errorMsg}}
		</text>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				errorMsg: ''
			}
		},
		onLoad(params) {
			let errorMsg = params.error || {}
			this.errorMsg = JSON.stringify(errorMsg)
		}
	}
</script>

<style lang="scss">

</style>