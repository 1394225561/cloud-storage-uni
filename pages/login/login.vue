<template>
	<view class="login-container">
		<text v-show="errorMsg" class="error-msg">{{errorMsg}}</text>
		<view class="logo-container">
			<text>{{sysConfig.brandName}}</text>
		</view>
		<view class="form-container">
			<view class="input-container">
				<view v-for="(value,key) in formData" :key="key" class="input-item">
					<view class="input-item__label">{{value.label}}</view>
					<view class="input-item__input">
						<text v-if="key === 'tenant'" :class="{
							'input-item__input__tenant':true,
							'placeholder-color':!value.text
						}" @tap="selectTenant">
							{{value.text || value.placeholder}}
						</text>
						<uni-easyinput v-else v-model="value.text" :placeholder="value.placeholder" :type="value.type"
							:inputBorder="false">
						</uni-easyinput>
					</view>
					<view v-if="key === 'captcha'" class="input-item__captcha">
						<image class="captcha" ref="captcha" :src="formData.captcha.url" @click="getCaptcha" />
					</view>
				</view>
			</view>
			<button type="default" class="login-button" @click="doLogin">登 录</button>
		</view>
		<view class="popup-container">
			<uni-popup ref="popup" background-color="#fff" @change="popupChange">
				<view class="popup-content">
					<view class="popup-content__tree-container">
					</view>
					<button type="default" class="login-button" @click="confirmTenant">确 定</button>
				</view>
			</uni-popup>
		</view>
	</view>
</template>

<script>
	import {
		generateBase64,
		getTenantList
	} from '@/common/apis/tenantApi.js/tenantApi.js'
	import {
		mapGetters
	} from 'vuex'


	export default {
		data() {
			return {
				errorMsg: '',
				formData: {
					tenant: {
						label: '单位',
						text: '',
						tenantCode: '',
						icon: '',
						type: 'text',
						placeholder: '请选择单位'
					},
					account: {
						label: '账号',
						text: '',
						icon: '',
						type: 'text',
						placeholder: '请输入账号'
					},
					password: {
						label: '密码',
						text: '',
						icon: '',
						type: 'password',
						placeholder: '请输入密码'
					},
					captcha: {
						label: '验证码',
						text: '',
						url: '',
						icon: '',
						type: 'text',
						placeholder: '请输入验证码'
					}
				},
				tenantList: []
			}
		},
		computed: {
			...mapGetters([
				'sysConfig'
			])
		},
		onLoad() {
			this.getCaptcha()
			this.getTenantList()
		},
		methods: {
			getCaptcha(cb) {
				uni.$myUtils.request({
					api: generateBase64,
					needLoading: false
				}).then((response) => {
					this.formData.captcha.url = 'data:image/png;base64,' + response.data.base64Str
					cb && cb()
				})
			},
			getTenantList() {
				this.tenantList = []
				uni.$myUtils.request({
					api: getTenantList
				}).then((res) => {
					let data = res.data
					if (!data.length) {
						return
					}
					for (let i = 0; i < data.length; i++) {
						this.tenantList.push(data[i])
					}
					if (!data[0].children.length && data.length === 1) {
						this.formData.tenant.text = data[0].tenantName
						this.formData.tenant.tenantCode = data[0].tenantCode
					}
				})
			},
			selectTenant() {
				this.$refs.popup.open('bottom')
			},
			popupChange() {

			},
			confirmTenant() {

			},
			saveLoginInfo() {
				// 保存上次登录时选择的单位和账号
				uni.setStorageSync('loginInfo', {
					tenantCode: this.formData.tenant.tenantCode,
					tenantName: this.formData.tenant.text,
					account: this.formData.account.text
				})
			},
			doLogin() {
				for (let key in this.formData) {
					let action = '输入'
					if (key === 'tenant') {
						action = '选择'
					}
					if (!this.formData[key].text) {
						this.errorMsg = `请${action}${this.formData[key].label}`
						return
					}
				}
				console.log('doLogin')
			},
			requestLogin() {

			}
		}
	}
</script>

<style lang="scss" scoped>
	@import '@/common/styles/styles.scss';

	.login-container {
		height: 100%;
		position: relative;

		.error-msg {
			position: fixed;
			/* #ifdef H5 */
			top: calc(var(--status-bar-height) + 50px);
			/* #endif */
			/* #ifdef APP-PLUS */
			top: 10px;
			/* #endif */
			z-index: 1;
			color: $cloud-theme-color;
			height: 50rpx;
			width: 100%;
			display: flex;
			justify-content: center;
			align-items: center;
		}

		.logo-container {
			height: 30%;
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: center;
			border-bottom: 1px solid rgba(0, 0, 0, .1);
		}

		.form-container {
			background-color: white;

			.input-container {
				padding-left: 20rpx;
				padding-right: 20rpx;

				.input-item {
					height: 100rpx;
					line-height: 100rpx;
					display: flex;

					.input-item__label {
						width: 20%;
					}

					.input-item__input {
						flex: 1;

						::v-deep .uni-easyinput,
						::v-deep .uni-easyinput__content,
						::v-deep .uni-easyinput__content-input {
							height: 100%;
						}

						.input-item__input__tenant {
							padding-left: 10px;
						}

						.placeholder-color {
							color: #999;
						}
					}

					.input-item__captcha {
						width: 20%;

						.captcha {
							width: 100%;
							height: 100%;
						}
					}

				}

				.input-item:not(:last-child) {
					border-bottom: 1px solid rgba(0, 0, 0, .1);
				}
			}

		}

		.login-button {
			background-color: $cloud-theme-color;
			color: white;
		}

		.login-button::after {
			border: none;
		}

		.popup-container {
			.popup-content {
				.popup-content__tree-container {
					width: calc(100vw - 20px);
					height: 70vh;
					padding: 10px;
					overflow: auto;
				}
			}
		}
	}
</style>
