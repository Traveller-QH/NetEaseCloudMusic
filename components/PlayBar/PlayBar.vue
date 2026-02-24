<template>
	<view class="play-bar" :style="{ 'z-index': isModalVisible ? 99 : 1000 }">
		<!-- 进度条 -->
		<view class="progress-line" :style="{ width: musicStore.state.currentSong ? musicStore.progress.value + '%' : '0%' }"></view>
		
		<!-- 播放控制区域 -->
		<view class="play-content" @click="handleGoToPlayer">
			<!-- CD圆盘样式专辑封面 -->
			<view class="album-cover">
				<!-- CD外圈 -->
				<view class="cd-outer" :class="{ 'playing': isPlaying }">
					<!-- CD内圈（专辑封面） -->
					<view class="cd-inner">
						<image 
							v-if="musicStore.albumCover.value" 
							class="cover-img" 
							:src="musicStore.albumCover.value" 
							mode="aspectFill"
						></image>
						<i v-else class="iconfont icon-yinle cover-icon" :class="{ 'default-state': !musicStore.state.currentSong }"></i>
					</view>
					<!-- CD中心孔 -->
					<view class="cd-hole"></view>
					<!-- CD高光效果 -->
					<view class="cd-highlight"></view>
				</view>
			</view>
			
			<!-- 歌曲信息 -->
			<view class="song-info">
				<view class="song-name text-ellipsis">{{ musicStore.songName.value || '网易云音乐' }}</view>
				<view class="artist-name text-ellipsis">{{ musicStore.artistNames.value || '点击播放音乐' }}</view>
			</view>
			
			<!-- 控制按钮 -->
			<view class="control-buttons">
				<!-- 播放/暂停按钮 -->
				<view class="control-btn" @click.stop="handleTogglePlay">
					<i 
						class="iconfont control-icon" 
						:class="musicStore.state.isPlaying ? 'icon-zantingbofang1' : 'icon-bofang1'"
					></i>
				</view>
				
				<!-- 播放列表按钮 -->
				<view class="control-btn" @click.stop="handleShowPlaylist">
					<i class="iconfont icon-bofangliebiao control-icon"></i>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { useMusicStore } from '@/utils/musicStore.js'
import { ref, onMounted, onUnmounted, watch } from 'vue'

const musicStore = useMusicStore()

// CD旋转状态
const isPlaying = ref(false)

// 模态弹窗显示状态
const isModalVisible = ref(false)

// 监听应用级别的弹窗事件
const showModal = () => {
  isModalVisible.value = true
}

const hideModal = () => {
  isModalVisible.value = false
}

// 将方法暴露给全局，供其他组件调用
if (!globalThis.musicPlayerModalManager) {
  globalThis.musicPlayerModalManager = {
    showModal,
    hideModal
  }
} else {
  // 如果已经存在，更新方法引用以保持最新
  globalThis.musicPlayerModalManager.showModal = showModal
  globalThis.musicPlayerModalManager.hideModal = hideModal
}

// 跳转到播放页面
const handleGoToPlayer = () => {
	if (musicStore.state.currentSong?.id) {
		uni.navigateTo({
			url: `/pages/player/player?id=${musicStore.state.currentSong.id}`
		})
	}
}

// 播放/暂停切换
const handleTogglePlay = () => {
	musicStore.togglePlay()
}

// 显示播放列表（这里可以后续扩展）
const handleShowPlaylist = () => {
	// TODO: 后续可以实现播放列表功能
}

// 更新播放状态
const updatePlayState = () => {
	isPlaying.value = musicStore.state.isPlaying
}

// 监听播放状态变化
watch(() => musicStore.state.isPlaying, () => {
	updatePlayState()
})

// 监听歌曲变化
watch(() => musicStore.state.currentSong?.id, () => {
	updatePlayState()
})

onMounted(() => {
	updatePlayState()
})

onUnmounted(() => {
	// 清理工作
})
</script>

<style lang="scss" scoped>
.play-bar {
	position: fixed;
	left: 0;
	right: 0;
	bottom: 100rpx; /* 底部导航栏高度约为100rpx */
	height: 120rpx;
	background: #fff;
	box-shadow: 0 -2rpx 20rpx rgba(0, 0, 0, 0.1);
	z-index: 1000; /* 比底部导航栏的z-index高 */
	
	// 进度条
	.progress-line {
		position: absolute;
		top: 0;
		left: 0;
		height: 4rpx;
		background: $theme-color;
		transition: width 0.1s linear;
		z-index: 2;
	}
	
	// 播放内容区域
	.play-content {
		position: relative;
		height: 100%;
		display: flex;
		align-items: center;
		padding: 0 30rpx;
		z-index: 1;
	}
	
	// CD圆盘样式
	.album-cover {
		position: relative;
		width: 80rpx;
		height: 80rpx;
		flex-shrink: 0;
		margin-right: 20rpx;
		
		// CD外圈（银色边框）
		.cd-outer {
			position: relative;
			width: 100%;
			height: 100%;
			border-radius: 50%;
			background: linear-gradient(135deg, #e0e0e0 0%, #f5f5f5 50%, #d0d0d0 100%);
			box-shadow: 
				0 4rpx 12rpx rgba(0, 0, 0, 0.3),
				inset 0 2rpx 4rpx rgba(255, 255, 255, 0.8),
				inset 0 -2rpx 4rpx rgba(0, 0, 0, 0.1);
			display: flex;
			align-items: center;
			justify-content: center;
			overflow: hidden;
			
			// 无限旋转动画
			animation: cdRotate 20s linear infinite;
			animation-play-state: paused;
			
			&.playing {
				animation-play-state: running;
			}
			
			// CD内圈（专辑封面区域）
			.cd-inner {
				position: relative;
				width: 70%;
				height: 70%;
				border-radius: 50%;
				overflow: hidden;
				z-index: 2;
				
				.cover-img {
					width: 100%;
					height: 100%;
				}
				
				.cover-icon {
					font-size: 28rpx;
					color: #666;
					width: 100%;
					height: 100%;
					display: flex;
					align-items: center;
					justify-content: center;
					background: linear-gradient(135deg, #f0f0f0 0%, #e0e0e0 100%);
					
					&.default-state {
						color: #999;
						background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%);
					}
				}
			}
			
			// CD中心孔
			.cd-hole {
				position: absolute;
				top: 50%;
				left: 50%;
				transform: translate(-50%, -50%);
				width: 12%;
				height: 12%;
				border-radius: 50%;
				background: #333;
				box-shadow: 
					inset 0 1rpx 2rpx rgba(0, 0, 0, 0.5),
					0 1rpx 1rpx rgba(255, 255, 255, 0.3);
				z-index: 3;
			}
			
			// CD高光效果
			.cd-highlight {
				position: absolute;
				top: 15%;
				left: 15%;
				width: 30%;
				height: 30%;
				border-radius: 50%;
				background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.8), transparent 70%);
				z-index: 4;
			}
		}
	}
	
	// 歌曲信息
	.song-info {
		flex: 1;
		min-width: 0;
		margin-right: 20rpx;
		
		.song-name {
			font-size: 28rpx;
			color: #333;
			font-weight: 500;
			line-height: 1.4;
			margin-bottom: 6rpx;
		}
		
		.artist-name {
			font-size: 24rpx;
			color: #999;
			line-height: 1.4;
		}
		
		// 默认状态样式
		&:not(:has(.song-name:not(:empty))) {
			.song-name {
				color: #666;
			}
			.artist-name {
				color: #bbb;
			}
		}
	}
	
	// 控制按钮
	.control-buttons {
		display: flex;
		align-items: center;
		gap: 30rpx;
		
		.control-btn {
			width: 60rpx;
			height: 60rpx;
			display: flex;
			align-items: center;
			justify-content: center;
			border-radius: 50%;
			
			&:active {
				background: #f5f5f5;
			}
			
			.control-icon {
				font-size: 40rpx;
				color: #333;
			}
		}
	}
}

// CD旋转动画
@keyframes cdRotate {
	from {
		transform: rotate(0deg);
	}
	to {
		transform: rotate(360deg);
	}
}

// 适配安全区域
.safe-area-bottom {
	padding-bottom: env(safe-area-inset-bottom);
}
</style>