import {
	getAppVersion
} from '@/common/apis/appConfig/appConfig.js'
import utils from '@/utils/utils.js'

export function checkVersion() {
	plus.runtime.getProperty(plus.runtime.appid, function(widgetInfo) {
		const version = widgetInfo.version
		const versionCode = parseInt(widgetInfo.versionCode)
		uni.$myUtils.request({
			api: getAppVersion,
			params: {
				clientType: 1
			},
			needLoading: false
		}).then((res) => {
			let isNeedUpdate = false
			let isForceUpdate = false
			// 获取的服务端数据
			const latestVersion = res.data.versionName || '0.0.0'
			const versionDesc = res.data.versionDesc
			const updateUrl = res.data.updateUrl
			const latestVersionCode = res.data.versionCode || 0
			const isForce = res.data.isForce
			const lastForceVersion = res.data.lastForceVersion || 0
			if (versionCode < latestVersionCode && (isForce === 1 || versionCode < lastForceVersion)) {
				// 本地版本号小于服务端版本号 并且 （为强制更新 或者 非强制更新时本地版本号小于最小强制更新版本号） 需要强制更新
				isForceUpdate = true
				isNeedUpdate = true
			}
			if (versionCode < latestVersionCode && isForce === 0) {
				// 本地版本号小于服务端版本号 并且 不是强制更新
				isForceUpdate = false
				isNeedUpdate = true
			}
			if (isNeedUpdate) {
				utils.showModal({
					title: '新版本提示',
					content: `发现新的应用安装包（${latestVersion}），点击确定立即更新！`,
					showCancel: !isForceUpdate,
					success: function(res) {
						if (res.confirm) {
							downloadApp(updateUrl)
						} else if (res.cancel) {}
					}
				})
			} else {}
		})
	})
}

function downloadApp(downloadUrl) {
	uni.showLoading({
		title: '下载更新中...'
	})
	uni.downloadFile({
		// 存放最新安装包的地址
		url: downloadUrl,
		success: (downloadResult) => {
			uni.hideLoading()
			if (downloadResult.statusCode === 200) {
				uni.showLoading({
					title: '安装更新中...'
				})
				plus.runtime.install(
					downloadResult.tempFilePath, {
						force: false
					},
					function() {
						uni.hideLoading()
						plus.runtime.restart()
					},
					function(e) {
						uni.hideLoading()
						uni.showToast({
							title: '安装失败！',
							icon: "error",
							duration: 2000
						})
					}
				)
			} else {

			}
		}
	})
}