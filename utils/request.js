/**
 * 网络请求封装
 */
import config from './config.js'

// 请求拦截器
const requestInterceptor = (options) => {
	// 添加基础URL
	if (!options.url.startsWith('http')) {
		options.url = config.baseUrl + options.url
	}
	
	// 添加请求头
	options.header = {
		...config.header,
		...options.header
	}
	
	// 添加超时时间
	options.timeout = options.timeout || config.timeout
	
	// 获取本地存储的cookie
	const cookie = uni.getStorageSync('cookie')
	if (cookie) {
		console.log('[Request] 本地Cookie:', cookie.substring(0, 100) + '...')
		
		// 对于所有环境，都将cookie作为请求参数传递（网易云API规范）
		if (!options.data) {
			options.data = {}
		}
		options.data.cookie = cookie
		console.log('[Request] Cookie通过参数传递')
	}
	
	return options
}

// 响应拦截器
const responseInterceptor = (response) => {
	const { statusCode, data } = response
	
	if (statusCode === 200) {
		// 保存cookie - 优先从响应体中获取（网易云API的登录接口会返回cookie字段）
		if (data && data.cookie) {
			uni.setStorageSync('cookie', data.cookie)
			console.log('[Request] Cookie已保存（从body）:', data.cookie.substring(0, 50) + '...')
		}
		// 其次从响应头中获取
		else if (response.cookies && response.cookies.length) {
			const cookieStr = response.cookies.join('; ')
			uni.setStorageSync('cookie', cookieStr)
			console.log('[Request] Cookie已保存（从header）:', cookieStr.substring(0, 50) + '...')
		}
		return data
	} else {
		return Promise.reject({
			code: statusCode,
			message: data.message || '请求失败'
		})
	}
}

// 封装请求方法
const request = (options) => {
	options = requestInterceptor(options)
	
	console.log('=== 请求参数 ===')
	console.log('最终options:', options)
	console.log('=== 请求参数结束 ===')
	
	return new Promise((resolve, reject) => {
		uni.request({
			...options,
			success: (res) => {
				try {
					const data = responseInterceptor(res)
					resolve(data)
				} catch (error) {
					reject(error)
				}
			},
			fail: (error) => {
				reject({
					code: -1,
					message: error.errMsg || '网络请求失败'
				})
			}
		})
	})
}

// GET请求
export const get = (url, params = {}) => {
	// 将参数拼接到URL中
	const queryString = Object.keys(params).map(key => 
		`${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`
	).join('&')
	
	const fullUrl = queryString ? `${url}?${queryString}` : url
	
	console.log('GET请求完整URL:', fullUrl)
	console.log('参数:', params)
	
	return request({
		url: fullUrl,
		method: 'GET'
	})
}

// POST请求
export const post = (url, data = {}) => {
	console.log('POST请求URL:', url)
	console.log('数据:', data)
	
	return request({
		url,
		method: 'POST',
		data
	})
}

export default {
	get,
	post,
	request
}
