export const fileUpload = {
	path: '/api/v2/file/inner/upload',
	app: 'cloudStorage',
	method: 'post',
	dataType: 'application/x-www-form-urlencoded',
	responseType: 'blob'
}
export const downloadSingle = {
	path: '/api/file/download/single',
	app: 'cloudStorage',
	method: 'get'
}
export const getPersonalFile = {
	path: '/api/file/list',
	app: 'cloudStorage',
	method: 'post',
	dataType: 'application/x-www-form-urlencoded'
}
export const getShareFile = {
	path: '/api/shareFile/list',
	app: 'cloudStorage',
	method: 'post',
	dataType: 'application/x-www-form-urlencoded'
}
export const getFileCatalog = {
	path: '/api/file/fileCatalog',
	app: 'cloudStorage',
	method: 'post',
	dataType: 'application/x-www-form-urlencoded'
}
// 查询涉敏文件上传列表
export const keywordList = {
	path: '/api/v2/file/keyword/list',
	app: 'cloudStorage',
	method: 'get'
}
// 查询未处理的文件
export const unProcessList = {
	path: '/api/v2/file/unProcess/list',
	app: 'cloudStorage',
	method: 'get'
}
// 获取处理完成列表
export const processedList = {
	path: '/api/v2/file/processed/list',
	app: 'cloudStorage',
	method: 'post'
}
// 查询文件是否可以上传
export const canBeUploadType = {
	path: '/api/uploadType/canBeUploadType',
	app: 'cloudStorage',
	method: 'post',
	dataType: 'json'
}
// 继续涉敏文件上传列表
export const keepOnUpload = {
	path: '/api/v2/file/keepOnUpload',
	app: 'cloudStorage',
	method: 'get'
}
// 放弃涉敏文件上传列表
export const giveUpUpload = {
	path: '/api/v2/file/giveUpUpload',
	app: 'cloudStorage',
	method: 'get'
}