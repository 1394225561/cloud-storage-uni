// 图片的预览和单个文件的下载
export const preview = {
	path: '/api/file/download/single',
	app: 'cloudStorage',
	method: 'get'
}

// 文件的预览
export const fiPreview = {
	path: '/api/file/preview',
	app: 'cloudStorage',
	method: 'get'
}
// 他人分享预览
export const assignedSharePreview = {
	path: '/api/assignedShare/preview',
	app: 'cloudStorage',
	method: 'get'
}
export const filePreviewV2 = {
	path: '/api/v2/preview',
	app: 'cloudStorage',
	method: 'get'
}
export const assignedSharePreviewV2 = {
	path: '/api/v2/assignedShare/preview',
	app: 'cloudStorage',
	method: 'get'
}

export const previewOnlyofficeFile = {
	path: '/api/v2/onlyoffice/edit',
	app: 'cloudStorage',
	method: 'post',
	dataType: 'application/x-www-form-urlencoded'
}

export const onlyofficeClose = {
	path: '/api/v2/onlyoffice/close',
	app: 'cloudStorage',
	method: 'get'
}
export const onlyofficeCandownload = {
	path: '/api/v2/onlyoffice/candownload',
	app: 'cloudStorage',
	method: 'get'
}