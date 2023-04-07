const share = {
	toolTip: '分享',
	id: 'share',
	event: 'share',
	iconClass: 'share',
	sort: 1
}

const banShare = {
	toolTip: '禁止分享',
	id: 'banShare',
	event: '',
	iconClass: 'share',
	sort: 1,
	disabled: true
}

const onlineEdit = {
	toolTip: '在线编辑',
	id: 'onlineEdit',
	event: 'edit',
	iconClass: 'edit',
	sort: 1,
	code: 'online-edit'
}

const download = {
	toolTip: '下载',
	id: 'download',
	event: 'download',
	iconClass: 'download',
	sort: 2,
	code: 'download'
}
// const b1 = {
//   toolTip: '禁止下载',
//   event: 'download',
//   iconClass: 'download',
//   sort: 2,
//   disabled: true
// }
const dele = {
	toolTip: '删除',
	id: 'delete',
	event: 'delete',
	iconClass: 'delete',
	sort: 3
}

const moveTo = {
	toolTip: '移动到',
	id: 'moveTo',
	event: 'move',
	iconClass: 'move',
	sort: 4
}

const copyTo = {
	toolTip: '复制到',
	id: 'copyTo',
	event: 'copy',
	iconClass: 'copy',
	sort: 5
}

const rename = {
	toolTip: '重命名',
	id: 'rename',
	event: 'rename',
	iconClass: 'Rename',
	sort: 6
}

const setShare = {
	toolTip: '设为共享',
	id: 'setShare',
	event: 'setShare',
	iconClass: 'usergroup',
	sort: 7
}

const settingShared = {
	toolTip: '设置共享成员',
	id: 'settingShared',
	event: 'settingShared',
	iconClass: 'usergroup',
	sort: 8
}

// eslint-disable-next-line
const uploaderNew = {
	toolTip: '上传新版本',
	id: 'uploadNew',
	event: 'uploaderNew',
	iconClass: 'Upload-new-version',
	sort: 9
}

const lookLast = {
	toolTip: '查看历史版本',
	id: 'lookLast',
	event: 'lookLast',
	iconClass: 'View-historical-ver',
	sort: 10
}

const shareAgain = {
	toolTip: '再次分享',
	id: 'shareAgain',
	event: 'share',
	iconClass: 'share',
	sort: 1
}

const restore = {
	toolTip: '还原',
	id: 'restore',
	event: 'restore',
	iconClass: 'reload',
	sort: 1
}

const cancelShare = {
	toolTip: '取消分享',
	id: 'cancelShare',
	event: 'cancel',
	iconClass: 'quit',
	sort: 1
}

const copyLink = {
	toolTip: '复制链接',
	id: 'copyLink',
	event: 'copyLink',
	iconClass: 'copy',
	sort: 1
}

const move2public = {
	toolTip: '移动到交换区',
	id: 'move2public',
	event: 'move2public',
	iconClass: 'move',
	sort: 11,
	code: 'public-space-button'
}

const copy2public = {
	toolTip: '复制到交换区',
	id: 'copy2public',
	event: 'copy2public',
	iconClass: 'copy',
	sort: 12,
	code: 'public-space-button'
}

const PERMISSION_UPLOAD = {
	toolTip: '上传',
	id: 'upload',
	event: 'upload',
	iconClass: 'upload',
	sort: 1
}

const PERMISSION_NEW_FOLDER = {
	toolTip: '新建文件夹',
	id: 'newFolder',
	event: 'newFolder',
	iconClass: 'newFolder',
	sort: 1
}

const PERMISSION_FAVORITE = {
	toolTip: '收藏',
	id: 'collect',
	event: ['favorite', 'cancelFavorite'],
	iconClass: ['star-o', 'star'],
	sort: 0
}
const PERMISSION_LOCK = {
	toolTip: '锁定',
	id: 'lock',
	event: ['lock', 'cancelLock'],
	iconClass: ['lock', 'unlock'],
	sort: 0
}
const networkEnv = uni.$myUtils.config.VUE_APP_LOCATION

// 读一读，和预览一样，不需要权限判断
export const judgeFileCanRead = (operationType) => {
	return operationType === 'readFile'
}

// 通过权限 过滤 单文件操作集合
function filterOptions(originalOptions) {
	let permissionBtn = uni.getStorageSync('permissionBtns') || ''
	permissionBtn = permissionBtn.split(uni.$myUtils.config.splitCharacter)
	originalOptions = originalOptions.filter(item => {
		return item.code === undefined || permissionBtn.indexOf(item.code) !== -1
	})
	return originalOptions
}

export const getSingleOptions = function(bizType, bizData, isRootpath, userData) {
	let originalOptions = getOriginalSingleOptions(bizType, bizData, isRootpath)
	if (bizType === 'share' && userData.id === bizData.userId) {
		// 上传者能下载和删除，必须是本人
		if (bizData.permissionType === 2) {
			if (originalOptions.findIndex((item) => {
					return item.event === 'delete'
				}) === -1) {
				originalOptions.push(dele)
			}
			if (originalOptions.findIndex((item) => {
					return item.event === 'edit'
				}) === -1) {
				originalOptions.unshift(onlineEdit)
			}
			originalOptions.push(download)
		}
		// 协作者本人才可以删除
		if (bizData.permissionType === 3) {
			if (originalOptions.findIndex((item) => {
					return item.event === 'delete'
				}) === -1) {
				originalOptions.push(dele)
			}
			if (originalOptions.findIndex((item) => {
					return item.event === 'edit'
				}) === -1) {
				originalOptions.unshift(onlineEdit)
			}
		}
	}
	if (bizType === 'personal' && !bizData.isDir) {
		originalOptions.unshift(PERMISSION_LOCK)
	}
	return filterOptions(originalOptions)
}

export const getOriginalSingleOptions = function(bizType, bizData, isRootPath) {
	const FILE_TYPE_LIST = ['txt', 'doc', 'docx', 'xlsx', 'xls', 'wps', 'wpt', 'pptx', 'ppt']
	let point = bizData.fileName.lastIndexOf('.')
	let type = bizData.fileName.substring(point + 1).toLowerCase()
	let concatArray = []
	if (FILE_TYPE_LIST.indexOf(type) > -1) {
		concatArray.push(onlineEdit)
	}
	switch (bizType) {
		// 个人文件
		case 'personal':
			if (bizData.isDir === 1) {
				return [share, dele, download, moveTo, copyTo, setShare, move2public, copy2public, rename,
					PERMISSION_FAVORITE
				]
			} else {
				if (bizData.isLock === 1) {
					return concatArray.concat([banShare, dele, download, moveTo, copyTo, move2public,
						copy2public,
						lookLast, PERMISSION_FAVORITE
					])
				} else {
					return concatArray.concat([share, dele, download, moveTo, copyTo, move2public, copy2public,
						rename, lookLast, PERMISSION_FAVORITE
					])
				}
			}
			// 交换区
		case 'publicSpace':
			if (bizData.isDir === 1) {
				if (networkEnv === 'FUJIAN') {
					return [download, dele, rename, move2public, copy2public]
				} else {
					return [download, dele, moveTo, copyTo, rename]
				}
			} else {
				if (bizData.isLock === 1) {
					return [download, dele, rename, lookLast]
				} else {
					if (networkEnv === 'FUJIAN') {
						return [download, dele, rename, lookLast, move2public, copy2public]
					} else {
						return [download, dele, moveTo, copyTo, rename, lookLast]
					}
				}
			}
			// 我的收藏
		case 'favorite':
			if (bizData.isLock === 1) {
				if (bizData.isOwner === 1) {
					return [banShare, PERMISSION_FAVORITE]
				}
				return [banShare, PERMISSION_FAVORITE]
			}
			return [share, PERMISSION_FAVORITE]
			// 他人分享
			// 根目录才可以删除
			// 能下载就可以复制到，两者并存
			// shareStatus, "" 代表永久有效， -1代表已经被删除，-2代表已经失效
			// isLock时，只能删除
			// downloadAble 代表可以下载
			// shareAble 代表可以再分享
			// 已经被删除的，什么操作都没有，
		case 'otherShare':
			let ops = []
			if (isRootPath) {
				ops = [dele]
			}
			if (bizData.isLock === 1) {
				return ops
			}
			if (bizData.shareAble === 1 && bizData.fileId) {
				ops.push(shareAgain)
			}
			if (bizData.shareAble === 0 || !bizData.fileId) {
				ops.push(banShare)
			}
			if (bizData.downloadAble === 1) {
				ops.push(download)
				ops.push(copyTo)
			}
			return ops
			// 回收站
		case 'recycle':
			return [dele, restore]
			// 发送同事分享
		case 'toAssigned':
			return [cancelShare]
		case 'linkShare':
			return [copyLink, cancelShare]
		case 'publicLinkShare':
			return [copyLink, cancelShare]
			// 共享文件
		case 'share':
			if (bizData.isLock !== 1) {
				if (bizData.pid === 'rootpath') {
					switch (bizData.permissionType) {
						case 4:
						case 5:
							// 根目录，并且是文件夹，才能设置共享成员
							if (bizData.isDir) {
								return [share, download, dele, rename, settingShared, PERMISSION_FAVORITE]
							} else {
								return [share, download, dele, rename, PERMISSION_FAVORITE]
							}
						case 3:
						case 6:
							return [share, download, PERMISSION_FAVORITE]
						case 1:
						case 2:
							return []
					}
				} else {
					if (bizData.isDir === 1) {
						switch (bizData.permissionType) {
							case 4:
							case 5:
								return [share, download, dele, rename, moveTo, copyTo, PERMISSION_FAVORITE]
							case 3:
							case 6:
								return [share, download, copyTo, PERMISSION_FAVORITE]
							case 1:
							case 2:
								return []
						}
					} else {
						switch (bizData.permissionType) {
							case 4:
							case 5:
								return concatArray.concat([share, dele, download, rename, moveTo, copyTo,
									lookLast,
									PERMISSION_FAVORITE
								])
							case 3:
								return [share, download, copyTo, lookLast, PERMISSION_FAVORITE]
							case 6:
								return [share, download, copyTo, PERMISSION_FAVORITE]
							case 1:
							case 2:
								return []
						}
					}
				}
			} else {
				switch (bizData.permissionType) {
					// 加锁文件，只有自己才有权限操作，除了分享操作。
					case 4:
						return concatArray.concat([banShare, dele, download, rename, moveTo, copyTo, lookLast,
							PERMISSION_FAVORITE
						])
					case 5:
					case 6:
					case 2:
					case 3:
					case 1:
						return []
				}
			}
	}
}

export const getFullMultiOptions = function(bizType, bizDatas, isRootPath, userData) {
	let options
	for (let i = 0; i < bizDatas.length; i++) {
		const singleOptions = getSingleOptionsByBatch(bizType, bizDatas[i], isRootPath, userData)
		if (options === undefined) {
			options = singleOptions
		} else {
			const intersectionSet = singleOptions.filter(subitem => {
				return undefined !== options.find(opitem => opitem.toolTip === subitem.toolTip)
			})
			options = intersectionSet
			if (options.length === 0) {
				break
			}
		}
	}
	let flag
	if (bizType === 'share' && bizDatas.length) {
		// 如果是共享文件
		if (bizDatas[0].permissionType === 2) {
			// 当前为上传者
			flag = 2
		}
		if (bizDatas[0].permissionType === 3) {
			// 当前为协作者
			flag = 3
		}
		let isOwn = bizDatas.every((item, index) => {
			return bizType === 'share' && userData.id === item.userId
		})
		// 如果选中文件都是本人创建
		if (isOwn) {
			// 且是上传者
			if (flag === 2 && options.findIndex((item) => {
					return item.event === 'delete'
				}) === -1) {
				// 批量操作增加下载 删除操作
				options.push(download)
				options.push(dele)
			}
			// 是协作者
			if (flag === 3 && options.findIndex((item) => {
					return item.event === 'delete'
				}) === -1) {
				// 批量操作增加删除操作
				options.push(dele)
			}
		}
	}
	return filterOptions(options || [])
}

export const getSingleOptionsByBatch = function(bizType, bizData, isRootpath, userData) {
	let originalOptions = getOriginalSingleOptionsByBatch(bizType, bizData, isRootpath)
	return originalOptions
}

export const getOriginalSingleOptionsByBatch = function(bizType, bizData, isRootPath) {
	switch (bizType) {
		// 个人文件
		case 'personal':
			if (bizData.isDir === 1) {
				return [share, download, dele, moveTo, copyTo]
			} else {
				if (bizData.isLock === 1) {
					return [banShare, download, dele, moveTo, copyTo]
				} else {
					return [share, download, dele, moveTo, copyTo]
				}
			}
			// 交换区
		case 'publicSpace':
			if (bizData.isDir === 1) {
				if (networkEnv === 'FUJIAN') {
					return [download, dele, move2public, copy2public]
				} else {
					return [download, dele, moveTo, copyTo]
				}
			} else {
				if (bizData.isLock === 1) {
					return [download, dele]
				} else {
					if (networkEnv === 'FUJIAN') {
						return [download, dele, move2public, copy2public]
					} else {
						return [download, dele, moveTo, copyTo]
					}
				}
			}
			// 我的收藏
		case 'favorite':
			if (bizData.isLock === 1) {
				if (bizData.isOwner === 1) {
					return []
				}
				return []
			}
			return [share]
			// 回收站
		case 'recycle':
			return [dele, restore]
			// 共享文件
		case 'share':
			if (bizData.isLock !== 1) {
				if (bizData.pid === 'rootpath') {
					switch (bizData.permissionType) {
						case 4:
						case 5:
							// 根目录，并且是文件夹，才能设置共享成员
							if (bizData.isDir) {
								return [share, download, dele]
							} else {
								return [share, download, dele]
							}
						case 3:
						case 6:
							return [share, download]
						case 1:
						case 2:
							return []
					}
				} else {
					if (bizData.isDir === 1) {
						switch (bizData.permissionType) {
							case 4:
							case 5:
								return [share, download, dele, moveTo, copyTo]
							case 3:
							case 6:
								return [share, download, copyTo]
							case 1:
							case 2:
								return []
						}
					} else {
						switch (bizData.permissionType) {
							case 4:
							case 5:
								return [share, download, dele, moveTo, copyTo]
							case 3:
								return [share, download, copyTo]
							case 6:
								return [share, download, copyTo]
							case 1:
							case 2:
								return []
						}
					}
				}
			} else {
				switch (bizData.permissionType) {
					// 加锁文件，只有自己才有权限操作，除了分享操作。
					case 4:
						return [download, dele, moveTo, copyTo]
					case 5:
					case 6:
					case 2:
					case 3:
					case 1:
						return []
				}
			}
			break
			// 他人分享全选目前只能删除，且必须在根目录
		case 'otherShare':
			if (isRootPath) {
				return [dele]
			}
			return []
		default:
			return []
	}
}