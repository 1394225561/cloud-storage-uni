export const fileUpload = {
	path: '/api/v2/file/inner/upload',
	app: 'cloudStorage',
	method: 'post',
	dataType: 'application/x-www-form-urlencoded',
	responseType: 'blob'
}
// 文件文件夹混合下载
export const downloadMulti = {
	path: '/api/file/download/multi',
	app: 'cloudStorage',
	method: 'get'
}
// 单个文件的下载
export const downloadSingle = {
	path: '/api/file/download/single',
	app: 'cloudStorage',
	method: 'get'
}
// 他人分享的文件下载
export const assignedShareDownload = {
	path: '/api/v2/sharing/receiveFile/download',
	app: 'cloudStorage',
	method: 'get'
}
// 文件版本下载
export const fileVersionDownload = {
	path: '/api/fileVersion/download/single',
	app: 'cloudStorage',
	method: 'get'
}
// 预览相关下载接口
export const fileDownloadImg = {
	path: '/api/file/download/img',
	app: 'cloudStorage',
	method: 'get'
}
export const assignedShareDownloadFile = {
	path: '/api/assignedShare/receiveUser/downloadFile',
	app: 'cloudStorage',
	method: 'get'
}
// 文件安全校验
export const fileSafeCheck = {
	path: '/api/v2/file/fileSafe/check',
	app: 'cloudStorage',
	method: 'post'
}

// 外网下载根据文件版本检查
export const fileVersionCheck = {
	path: '/api/v2/file/fileVersion/check',
	app: 'cloudStorage',
	method: 'post'
	// dataType: 'application/x-www-form-urlencoded'
}

// 外网下载/预览批量文件检查
export const multipleFileCheck = {
	path: '/api/v2/file/multipleFile/check',
	app: 'cloudStorage',
	method: 'post'
	// dataType: 'json'
}

// 用户继续/放弃下载涉敏文件
export const fileKeepOnDownload = {
	path: '/api/v2/file/keepOnDownload',
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
export const mkdir = {
	path: '/api/file/mkdir',
	app: 'cloudStorage',
	method: 'post',
	dataType: 'application/x-www-form-urlencoded'
}
export const shareFileMkdir = {
	path: '/api/shareFile/mkDir',
	app: 'cloudStorage',
	method: 'post',
	dataType: 'application/x-www-form-urlencoded'
}
export const createTxt = {
	path: '/api/file/createTxt',
	app: 'cloudStorage',
	method: 'post',
	dataType: 'application/x-www-form-urlencoded'
}
export const keepOnCreateTxt = {
	path: '/api/file/keepOnCreateTxt',
	app: 'cloudStorage',
	method: 'post',
	dataType: 'application/x-www-form-urlencoded'
}