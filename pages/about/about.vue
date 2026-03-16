<template>
	<view class="about-page">
    <!-- 状态栏占位块 -->
    <view class="status_bar" />

		<!-- 顶部导航栏 -->
		<view class="navbar">
			<view class="navbar-left" @click="goBack">
				<i class="iconfont icon-arrow-left"></i>
			</view>
			<text class="navbar-title">关于</text>
		</view>
		
		<!-- 页面内容 -->
		<view class="content">
			<!-- Logo 图标 -->
			<view class="logo-container">
				<image class="logo" src="/static/favicon.ico" mode="aspectFit"></image>
			</view>
			
			<!-- 信息卡片 -->
			<view class="info-card">
				<!-- 版本信息 -->
				<view class="info-item">
					<text class="info-label">当前版本</text>
					<text class="info-value">{{ version }}</text>
				</view>
				
				<!-- 作者信息 -->
				<view class="info-item">
					<text class="info-label">作者</text>
					<text class="info-value">{{ author }}</text>
				</view>
				
				<!-- Github 信息 -->
				<view class="info-item" @click="openGithub">
					<text class="info-label">Github</text>
					<view class="info-value github-link">
						<text class="github-url">NetEaseCloudMusic</text>
						<i class="iconfont icon-arrow-right"></i>
					</view>
				</view>
				
				<!-- 版权信息 -->
				<view class="info-item">
					<text class="info-label">版权信息</text>
					<text class="info-value">{{ copyright }}</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, onMounted } from 'vue'

// 版本信息（从 manifest.json 读取）
const version = ref('1.0.0')

// 作者信息
const author = ref('Traveller-QH')

// Github 信息
const githubUrl = ref('github.com/Traveller-QH/NeteaseCloudMusic')

// 版权信息
const copyright = ref('开源项目')

onMounted(() => {})

// 返回上一页
const goBack = () => {
	uni.navigateBack()
}

// 打开 Github 链接
const openGithub = () => {
	uni.setClipboardData({
		data: 'https://github.com/Traveller-QH/NeteaseCloudMusic',
		success: () => {
			uni.showModal({
				title: '提示',
				content: '项目地址已复制到剪贴板，是否现在在浏览器中打开？',
				showCancel: true,
				cancelText: '稍后',
				confirmText: '打开',
				success: (res) => {
					if (res.confirm) {
						plus.runtime.openURL('https://github.com/Traveller-QH/NeteaseCloudMusic')
					}
				}
			})
		}
	})
}
</script>

<style lang="scss" scoped>
.about-page {
	display: flex;
	flex-direction: column;
	height: 100vh;
	background: #f5f5f5;
}

.status_bar {
  height: var(--status-bar-height);
  width: 100%;
  background-color: white;
}

// 顶部导航栏
.navbar {
	position: relative;
	display: flex;
	align-items: center;
	justify-content: center;
	height: 88rpx;
	background: #fff;
	border-bottom: 1rpx solid #eaeaea;
	padding: 0 30rpx;
	
	.navbar-left {
		position: absolute;
		left: 30rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 60rpx;
		height: 60rpx;
		
		i {
			font-size: 40rpx;
			color: #333;
		}
		
		&:active {
			opacity: 0.6;
		}
	}
	
	.navbar-title {
		font-size: 32rpx;
		font-weight: bold;
		color: #333;
	}
}

// 页面内容
.content {
	flex: 1;
	padding: 60rpx 30rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
}

// Logo 容器
.logo-container {
	display: flex;
	justify-content: center;
	margin-bottom: 60rpx;
	
	.logo {
		width: 160rpx;
		height: 160rpx;
		border-radius: 24rpx;
		box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.1);
	}
}

// 信息卡片
.info-card {
	width: 100%;
	background: #fff;
	border-radius: 16rpx;
	overflow: hidden;
	box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.08);
}

// 信息项
.info-item {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 36rpx 30rpx;
	border-bottom: 1rpx solid #f0f0f0;
	
	&:last-child {
		border-bottom: none;
	}
	
	&:active {
		background: #f9f9f9;
	}
	
	.info-label {
		font-size: 28rpx;
		color: #666;
	}
	
	.info-value {
		font-size: 28rpx;
		color: #333;
		font-weight: 500;
		
		&.github-link {
			display: flex;
			align-items: center;
			gap: 12rpx;
			color: #1e80ff;
			
			.github-url {
				color: #1e80ff;
			}
			
			i {
				font-size: 28rpx;
				color: #1e80ff;
			}
		}
	}
}
</style>
