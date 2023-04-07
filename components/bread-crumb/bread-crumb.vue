<template>
	<view class="bread-crumb-container">
		<view :class="{
			'bread-crumb__item': true,
			'bread-crumb__item_active': index === routes.length - 1
		}" v-for="(item, index) in routes" :key="item.id" @click="crumbTrigger(item,index)">
			<text>{{ item.name }}</text>
			<text v-if="index < routes.length - 1" class="separator"> > </text>
		</view>
	</view>
</template>

<script>
	export default {
		name: "bread-crumb",
		props: {
			pageType: {
				type: String,
				default: 'personal'
			}
		},
		data() {
			return {
				routes: [{
					id: 'rootpath',
					name: '全部文件',
					parentId: 'rootpath'
				}]
			}
		},
		beforeMount() {
			uni.$on(`${this.pageType}crumbPop`, this.crumbPop)
		},
		beforeDestroy() {
			uni.$off(`${this.pageType}crumbPop`)
		},
		methods: {
			crumbPush(data) {
				this.routes.push({
					id: data.fileId,
					name: data.fileName,
					parentId: data.parentId
				})
				uni.$emit(`${this.pageType}updateFiles`, data)
			},
			// 返回上一级文件目录
			crumbPop() {
				this.routes.pop()
				let lastOne = this.routes[this.routes.length - 1]
				let param = {
					fileId: lastOne.id,
					fileName: lastOne.name,
					parentId: lastOne.parentId,
				}
				uni.$emit(`${this.pageType}updateFiles`, param)
			},
			// 跳转文件目录
			crumbTrigger(route, index) {
				this.routes.splice(index + 1)
				let param = {
					fileId: route.id,
					fileName: route.name,
					parentId: route.parentId,
				}
				uni.$emit(`${this.pageType}updateFiles`, param)
			}
		}
	}
</script>

<style lang="scss" scoped>
	@import '@/common/styles/styles.scss';

	.bread-crumb-container {
		height: 100%;
		display: flex;
		font-size: 12px;

		.bread-crumb__item {
			color: $cloud-theme-color;

			.separator {
				margin-left: 20rpx;
				margin-right: 20rpx;
			}
		}

		.bread-crumb__item_active {
			color: #7f8389;
		}
	}
</style>