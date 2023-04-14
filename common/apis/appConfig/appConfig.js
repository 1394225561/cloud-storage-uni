// 查询系统配置
export const sysConfig = {
	app: 'cloudStorage',
	path: '/api/v2/defaultConfig/system/get',
	method: 'get'
}
export const getPermissionBtn = {
	app: 'cloudStorage',
	path: '/api/menu/pagePermissions',
	method: 'get'
}
// 租户系统配置
export const tenantConfig = {
	app: 'cloudStorage',
	path: '/api/v2/defaultConfig/tenant/get',
	method: 'get'
}