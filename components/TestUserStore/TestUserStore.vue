<template>
	<view class="test-container">
		<view class="test-header">
			<text class="title">UserStore 测试组件</text>
		</view>
		
		<view class="test-section">
			<text class="section-title">登录状态</text>
			<view class="status-item">
				<text>是否登录: {{ userStore.isLogin ? '是' : '否' }}</text>
			</view>
			<view class="status-item">
				<text>登录方式: {{ userStore.loginMethod || '未登录' }}</text>
			</view>
			<view class="status-item">
				<text>登录时间: {{ loginTime }}</text>
			</view>
		</view>
		
		<view class="test-section">
			<text class="section-title">用户信息</text>
			<view class="status-item">
				<text>用户ID: {{ userStore.userInfo.userId || '未登录' }}</text>
			</view>
			<view class="status-item">
				<text>昵称: {{ userStore.userInfo.nickname || '未登录' }}</text>
			</view>
			<view class="status-item">
				<text>头像: {{ userStore.userInfo.avatarUrl || '未设置' }}</text>
			</view>
			<view class="status-item">
				<text>VIP类型: {{ userStore.userInfo.vipType }}</text>
			</view>
		</view>
		
		<view class="test-section">
			<text class="section-title">账户信息</text>
			<view class="status-item">
				<text>账户ID: {{ userStore.accountInfo.id || '未登录' }}</text>
			</view>
			<view class="status-item">
				<text>用户名: {{ userStore.accountInfo.userName || '未登录' }}</text>
			</view>
			<view class="status-item highlight">
				<text>包月版本 (baoyueVersion): {{ userStore.accountInfo.baoyueVersion }}</text>
			</view>
			<view class="status-item">
				<text>Token版本: {{ userStore.accountInfo.tokenVersion }}</text>
			</view>
		</view>
		
		<view class="test-section">
			<text class="section-title">操作按钮</text>
			<view class="button-group">
				<button @click="testRestore" size="mini">恢复登录状态</button>
				<button @click="testClear" size="mini">清除登录状态</button>
				<button @click="testFetch" size="mini">刷新用户信息</button>
			</view>
		</view>
		
		<view class="test-section">
			<text class="section-title">本地存储检查</text>
			<view class="button-group">
				<button @click="checkStorage" size="mini">检查存储</button>
				<button @click="clearStorage" size="mini">清除存储</button>
			</view>
			<view class="storage-info">
				<text v-if="storageInfo">{{ storageInfo }}</text>
				<text v-else>点击"检查存储"查看信息</text>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useUserStore } from '@/utils/userStore.js'

const userStore = useUserStore()
const storageInfo = ref('')

// 计算登录时间显示
const loginTime = computed(() => {
	if (userStore.loginTimestamp) {
		return new Date(userStore.loginTimestamp).toLocaleString()
	}
	return '未登录'
})

// 测试恢复登录状态
const testRestore = async () => {
	try {
		uni.showLoading({ title: '恢复中...' })
		const result = await userStore.restoreLoginState()
		uni.hideLoading()
		
		uni.showToast({
			title: result ? '恢复成功' : '恢复失败',
			icon: result ? 'success' : 'none'
		})
	} catch (error) {
		uni.hideLoading()
		console.error('恢复登录状态失败:', error)
		uni.showToast({
			title: '恢复失败',
			icon: 'none'
		})
	}
}

// 测试清除登录状态
const testClear = () => {
	userStore.clearLoginState()
	uni.showToast({
		title: '已清除',
		icon: 'success'
	})
}

// 测试刷新用户信息
const testFetch = async () => {
	try {
		uni.showLoading({ title: '刷新中...' })
		const result = await userStore.fetchUserInfo()
		uni.hideLoading()
		
		uni.showToast({
			title: result ? '刷新成功' : '刷新失败',
			icon: result ? 'success' : 'none'
		})
	} catch (error) {
		uni.hideLoading()
		console.error('刷新用户信息失败:', error)
		uni.showToast({
			title: '刷新失败',
			icon: 'none'
		})
	}
}

// 检查存储
const checkStorage = () => {
	const keys = [
		'isLoggedIn',
		'loginTimestamp',
		'loginMethod',
		'userInfo',
		'accountInfo',
		'token',
		'cookie'
	]
	
	let info = ''
	keys.forEach(key => {
		const value = uni.getStorageSync(key)
		if (value) {
			if (typeof value === 'string' && value.length > 100) {
				info += `${key}: 存在 (长度: ${value.length})\n`
			} else {
				info += `${key}: ${JSON.stringify(value)}\n`
			}
		} else {
			info += `${key}: 不存在\n`
		}
	})
	
	storageInfo.value = info
}

// 清除存储
const clearStorage = () => {
	const keys = [
		'isLoggedIn',
		'loginTimestamp',
		'loginMethod',
		'userInfo',
		'accountInfo',
		'token',
		'cookie'
	]
	
	keys.forEach(key => {
		uni.removeStorageSync(key)
	})
	
	storageInfo.value = '存储已清除'
	
	uni.showToast({
		title: '存储已清除',
		icon: 'success'
	})
}
</script>

<style lang="scss" scoped>
.test-container {
	padding: 20rpx;
	background: #f5f5f5;
	min-height: 100vh;
}

.test-header {
	background: #fff;
	padding: 30rpx;
	border-radius: 16rpx;
	margin-bottom: 20rpx;
	text-align: center;
	
	.title {
		font-size: 36rpx;
		font-weight: bold;
		color: #333;
	}
}

.test-section {
	background: #fff;
	padding: 30rpx;
	border-radius: 16rpx;
	margin-bottom: 20rpx;
	
	.section-title {
		display: block;
		font-size: 32rpx;
		font-weight: bold;
		color: #333;
		margin-bottom: 20rpx;
		padding-bottom: 10rpx;
		border-bottom: 2rpx solid #f0f0f0;
	}
	
	.status-item {
		padding: 15rpx 0;
		border-bottom: 1rpx solid #f5f5f5;
		
		&:last-child {
			border-bottom: none;
		}
		
		text {
			font-size: 28rpx;
			color: #666;
		}
		
		&.highlight text {
			color: #EC4141;
			font-weight: bold;
		}
	}
	
	.button-group {
		display: flex;
		gap: 20rpx;
		flex-wrap: wrap;
		margin-bottom: 20rpx;
	}
	
	.storage-info {
		background: #f9f9f9;
		padding: 20rpx;
		border-radius: 12rpx;
		font-size: 24rpx;
		color: #666;
		line-height: 1.6;
		white-space: pre-line;
	}
}
</style>