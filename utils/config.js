// API 基础配置
const config = {
	// 后端 API 地址
	// 本地环境
	// baseUrl: 'http://localhost:3000',
	// 线上环境
	baseUrl: 'https://miraitowa.cloud/netease-cloud-music-api/',
	
	// 请求超时时间
	timeout: 15000,
	
	// 请求头
	header: {
		'Content-Type': 'application/json'
	},
	
	// 真实 IP 地址（用于解决某些接口需要客户端 IP 的问题）
	// 可以设置为空字符串由服务器自动获取，或设置为中国 IP 如 116.25.19.177
	realIP: '116.25.19.177'
}

export default config
