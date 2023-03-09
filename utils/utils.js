export function addAPIInterceptor(api) {
	uni.addInterceptor(api, {
		invoke(args) {
			// api触发前拦截 进行api入参的处理
			console.log('addAPIInterceptor invoke', args)
		},
		returnValue(args) {
			// 方法调用后触发 处理返回值
			console.log('addAPIInterceptor returnValue', args)
			return args
		},
		success(args) {
			// 请求成功后，修改code值为1
			console.log('addAPIInterceptor success', args)
		},
		fail(err) {
			console.log('addAPIInterceptor fail', args)
		},
		complete(res) {
			console.log('addAPIInterceptor complete', args)
		}
	})
}
