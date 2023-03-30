<template>
	<i :class="[isColourful ? 't-icon' : 'iconfont', iconFont]"></i>
</template>

<script>
	export default {
		name: "icon-font",
		props: {
			icon: {
				type: String,
				require: true
			},
			// false 可以修改颜色 但图标不是彩色
			// true 不可以修改颜色 但图标是彩色
			// 默认是彩色图标
			isColourful: {
				type: Boolean,
				default: true
			}
		},
		computed: {
			iconFont() {
				let prefix
				if (this.isColourful) {
					prefix = 't-icon-'
				} else {
					prefix = 'icon-'
				}
				return prefix + this.icon
			}
		},
		data() {
			return {

			}
		}
	}
</script>

<style lang="scss" scoped>
	.t-icon {
		width: 44px;
		height: 44px;
	}

	.iconfont {
		font-size: 44px;
	}
</style>