export const generateBase64 = {
	app: 'cloudStorage',
	path: '/api/captcha/generateBase64',
	method: 'get'
}
export const getTenantList = {
	app: 'cloudStorage',
	path: '/api/tenant/list',
	method: 'get'
}
export const validatCheckCode = {
	path: '/spacex/captcha/validate',
	app: 'cloudStorage',
	method: 'get'
}
export const login = {
	path: '/spacex/login?ajax=true',
	app: 'cloudStorage',
	method: 'post',
	dataType: 'application/x-www-form-urlencoded'
}
export const logout = {
	path: '/spacex/logout',
	app: 'cloudStorage',
	method: 'post',
	dataType: 'json'
}
export const getTenantInfo = {
	path: '/api/tenant/info/get',
	app: 'cloudStorage',
	method: 'get'
}
export const dictGroupGet = {
	app: 'cloudStorage',
	path: '/api/dict/group/get',
	method: 'get'
}
