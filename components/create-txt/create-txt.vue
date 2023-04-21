<template>
	<view :class="['create-txt-popup-content']">
		<view class="top-btns">
			<button size="mini" @click="cancel">取消</button>
			<button size="mini" type="warn" @click="submit">确定</button>
		</view>
		<view v-show="errorTip" class="error-tip">
			{{ errorTip }}
		</view>
		<view class="container title">
			<view class="label title-label">
				<text class="label-icon">* </text>标题：
			</view>
			<uni-easyinput class="input-item" v-model="txtName" placeholder="请输入文档标题"
				:maxlength="nameMaxLength"></uni-easyinput>
		</view>
		<view class="container content">
			<view class="label content-label">
				<text class="label-icon">* </text>内容：
			</view>
			<uni-easyinput class="input-item" v-model="txtContent" placeholder="请输入文档内容" type="textarea"
				:maxlength="contentMaxLength" :autoHeight="true" :clearable="true" :cursorSpacing='300'></uni-easyinput>
		</view>
	</view>
</template>

<script>
	import utils from '@/utils/utils.js'
	import {
		createTxt,
		keepOnCreateTxt
	} from '@/common/apis/file/file.js'

	export default {
		name: "create-txt",
		props: {
			fileId: {
				type: String,
				default: 'rootpath'
			},
			txtNameSaved: {
				type: String,
				default: ''
			},
			txtContentSaved: {
				type: String,
				default: ''
			},
			pageType: {
				type: String,
				default: 'personal'
			}
		},
		data() {
			return {
				txtName: '',
				nameMaxLength: 30,
				txtContent: '',
				contentMaxLength: 300,
				errorTip: '',
			}
		},
		watch: {
			txtName: {
				handler(newValue) {
					this.$emit('saveTxtName', newValue)
				}
			},
			txtContent: {
				handler(newValue) {
					this.$emit('saveTxtContent', newValue)
				}
			}
		},
		beforeMount() {
			console.log('beforeMount create txt')
			this.txtName = this.txtNameSaved
			this.txtContent = this.txtContentSaved
		},
		methods: {
			cancel() {
				this.$emit('createTxtCancel')
			},
			submit() {
				this.errorTip = ''
				let validateResult = this.validate()
				if (validateResult.pass) {
					this.createTxt()
				} else {
					this.errorTip = validateResult.message
				}
			},
			validate() {
				let validateResult = {
					pass: true,
					message: ''
				}
				if (!this.txtName) {
					validateResult.pass = false
					validateResult.message = '请输入文档标题'
					return validateResult
				}
				let result = utils.checkSpecialCharacters(this.txtName)
				if (!result.pass) {
					validateResult.pass = false
					validateResult.message = result.message
					return validateResult
				}
				if (!this.txtContent) {
					validateResult.pass = false
					validateResult.message = '请输入文档内容'
					return validateResult
				}
				return validateResult
			},
			createTxt() {
				uni.$myUtils.request({
					api: createTxt,
					params: {
						txtName: this.txtName,
						txtContent: this.txtContent,
						dirId: this.fileId
					}
				}).then((data) => {
					// 处理状态 0完成 1处理中 2待同步内网 (新增文本用 3涉密 4涉敏) ,
					let handleStatus = data.data.handleStatus
					switch (handleStatus) {
						case 0:
							this.createTxtSuccess()
							break
						case 3:
							utils.showModal({
								title: '新建文档提示',
								content: '根据安全管理规定，发现您新建的文档中含有涉密信息，禁止新建该文档。',
								showCancel: false
							})
							break
						case 4:
							utils.showModal({
								title: '新建文档提示',
								confirmText: '继续保存',
								content: '根据安全管理规定，发现您新建的文档中含有涉密信息，如果泄露，需承认相应责任，请谨慎处理该文档。',
								success: (res) => {
									if (res.confirm) {
										this.keepOnCreateTxt(data.keywords)
									}
								}
							})
							break
						default:
							break
					}
				})
			},
			keepOnCreateTxt(keywords) {
				let params = {
					txtContent: this.txtContent,
					txtName: this.txtName,
					dirId: this.fileId,
					keywords: keywords
				}
				uni.$myUtils.request({
					api: keepOnCreateTxt,
					params
				}).then((data) => {
					this.createTxtSuccess()
				})
			},
			createTxtSuccess() {
				this.reset()
				this.cancel()
				uni.$emit(`${this.pageType}refreshList`)
				uni.$myUtils.showSuccessMsg("新建成功")
			},
			reset() {
				this.txtContent = ''
				this.txtName = ''
				this.errorTip = ''
			}
		}
	}
</script>

<style lang="scss" scoped>
	@import '@/common/styles/styles.scss';

	.create-txt-popup-content {
		background-color: white;
		position: relative;
		/* #ifdef H5 */
		bottom: 50px;
		/* #endif */
		height: 50vh;
		padding: 20rpx 40rpx;
		z-index: 99;

		.top-btns {
			display: flex;
			justify-content: space-between;
			margin-bottom: 20rpx;
		}

		.error-tip {
			margin-bottom: 20rpx;
			color: $cloud-theme-color;
		}

		.title {
			margin-bottom: 20rpx;
		}

		.container {
			display: flex;
			align-items: flex-start;

			.label {
				flex: 1;
				height: 35px;
				line-height: 35px;

				.label-icon {
					color: $cloud-theme-color;
				}
			}

			.input-item {
				flex: 5;
			}
		}
	}
</style>