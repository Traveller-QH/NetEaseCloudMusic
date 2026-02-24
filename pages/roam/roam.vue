<template>
	<view class="roam-page">
		<!-- 侧边栏 -->
		<Sidebar :show="showSidebar" @close="closeSidebar" />
		
		<!-- 自定义顶部导航栏 -->
		<view class="custom-navbar">
			<!-- 左侧菜单按钮 -->
			<view class="nav-left" @click="openSidebar">
				<i class="iconfont icon-caidanliebiao nav-icon"></i>
			</view>
			
			<!-- 中间标题 -->
			<view class="nav-title">漫游</view>
			
			<!-- 右侧时钟按钮 -->
			<view class="nav-right" @click="() => {}">
				<i class="iconfont icon-shijian nav-icon"></i>
			</view>
		</view>
		
		<!-- 主内容区 -->
		<scroll-view scroll-y class="roam-content" :style="{ height: scrollHeight }" :scroll-top="scrollTop" @scroll="onScroll">
			<!-- 当前播放 -->
			<view class="now-playing">
				<view class="playing-bg"></view>
				<view class="playing-content">
					<view class="playing-cover">
						<view class="cover-inner rotating">
							<i class="iconfont icon-yinle cover-music-icon"></i>
						</view>
						<view class="cover-ring"></view>
					</view>
					<view class="playing-info">
						<text class="playing-title">开启你的音乐漫游</text>
						<text class="playing-subtitle">发现属于你的音乐世界</text>
					</view>
					<view class="playing-action">
						<view class="action-btn">
							<i class="iconfont icon-bofang2 action-play-icon"></i>
						</view>
					</view>
				</view>
			</view>
			
			<!-- 漫游模式选择 -->
			<view class="mode-section">
				<view class="section-header">
					<text class="section-title">选择漫游模式</text>
				</view>
				<view class="mode-grid">
					<view class="mode-item" v-for="(mode, index) in roamModes" :key="index">
						<view class="mode-icon" :style="{ background: mode.bgColor }">
							<i class="iconfont mode-iconfont" :class="'icon-' + mode.icon"></i>
						</view>
						<view class="mode-info">
							<text class="mode-name">{{ mode.name }}</text>
							<text class="mode-desc">{{ mode.desc }}</text>
						</view>
					</view>
				</view>
			</view>
			
			<!-- 猜你喜欢 -->
			<view class="guess-section">
				<view class="section-header">
					<text class="section-title">猜你喜欢</text>
					<view class="section-refresh" @click="refreshGuess">
						<i class="iconfont icon-shuaxin refresh-icon"></i>
						<text class="refresh-text">换一批</text>
					</view>
				</view>
				<view class="guess-list">
					<view class="guess-item" v-for="(item, index) in guessSongs" :key="item.id" @click="playSong(item)">
						<view class="guess-cover">
							<image class="cover-img" :src="item.picUrl || item.song?.album?.picUrl" mode="aspectFill"></image>
						</view>
						<view class="guess-info">
							<text class="guess-name">{{ item.name }}</text>
							<text class="guess-artist">{{ getArtistNames(item.song?.artists || item.artists) }}</text>
						</view>
						<view class="guess-action">
							<i class="iconfont icon-bofang1 guess-play-icon"></i>
						</view>
					</view>
				</view>
			</view>
			
			<!-- 音乐心情 -->
			<view class="mood-section">
				<view class="section-header">
					<text class="section-title">音乐心情</text>
				</view>
				<scroll-view scroll-x class="mood-scroll">
					<view class="mood-item" v-for="(mood, index) in moods" :key="index">
						<view class="mood-cover" :style="{ background: mood.bgColor }">
							<text class="mood-emoji">{{ mood.emoji }}</text>
						</view>
						<text class="mood-name">{{ mood.name }}</text>
					</view>
				</scroll-view>
			</view>
			
			<!-- 场景音乐 -->
			<view class="scene-section">
				<view class="section-header">
					<text class="section-title">场景音乐</text>
				</view>
				<view class="scene-grid">
					<view class="scene-item" v-for="(scene, index) in scenes" :key="index">
						<view class="scene-card" :style="{ background: scene.bgColor }">
							<i class="iconfont scene-iconfont" :class="'icon-' + scene.icon"></i>
							<text class="scene-name">{{ scene.name }}</text>
						</view>
					</view>
				</view>
			</view>
			

		</scroll-view>
		
		<!-- 播放控制条 -->
		<PlayBar />
		
		<!-- 底部导航栏 -->
		<AppTabBar :current-page="'roam'" @tabChange="onTabChange" />
	</view>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { getPersonalFm, getRecommendNewSong, getPersonalized } from '@/utils/api.js'
import AppTabBar from '@/components/AppTabBar/AppTabBar.vue'
import Sidebar from '@/components/Sidebar/Sidebar.vue'
import PlayBar from '@/components/PlayBar/PlayBar.vue'

const showSidebar = ref(false)

// 添加当前页面索引，漫游页面是第2个（索引为1）
const activeTab = ref(1)

// 滚动控制
const scrollTop = ref(0)
let lastScrollTop = 0

// 滚动区域高度
const scrollHeight = ref('') // 动态计算高度

// 动态计算滚动区域高度
const calculateScrollHeight = () => {
	const systemInfo = uni.getSystemInfoSync()
	const windowHeight = systemInfo.windowHeight
	const statusBarHeight = systemInfo.statusBarHeight || 0
	const navbarHeight = 60 // 与discovery页面一致的导航栏高度
	const tabbarHeight = 50 // 底部导航栏高度
	const playbarHeight = 80 // 播放控制条高度
	const bottomSafeArea = systemInfo.safeAreaInsets?.bottom || 0 // 底部安全区域
	
	// 计算可用高度：窗口高度 - 状态栏 - 导航栏 - 底部导航栏 - 播放控制条 - 底部安全区域
	const availableHeight = windowHeight - statusBarHeight - navbarHeight - tabbarHeight - playbarHeight - bottomSafeArea
	scrollHeight.value = availableHeight + 'px'
}

// 监听屏幕旋转和尺寸变化
let resizeTimer = null
const handleResize = () => {
	if (resizeTimer) clearTimeout(resizeTimer)
	resizeTimer = setTimeout(() => {
		calculateScrollHeight()
	}, 100)
}

// 处理滚动事件，防止滚动溢出
const onScroll = (e) => {
	const currentScrollTop = e.detail.scrollTop
	
	// 记录最后一次滚动位置
	lastScrollTop = currentScrollTop
	
	// 防止滚动溢出
	const maxScrollTop = e.target.scrollHeight - e.target.clientHeight
	if (currentScrollTop <= 0) {
		// 滚动到顶部时，锁定在顶部
		scrollTop.value = 0
	} else if (currentScrollTop >= maxScrollTop) {
		// 滚动到底部时，锁定在底部
		scrollTop.value = maxScrollTop
	}
}

// 打开侧边栏
const openSidebar = () => {
	showSidebar.value = true
}

// 关闭侧边栏
const closeSidebar = () => {
	showSidebar.value = false
}

// 漫游模式
const roamModes = ref([
	{ name: '私人fm', desc: '专属你的音乐电台', icon: 'FM', bgColor: 'linear-gradient(135deg, #EC4141, #FF6666)' },
	{ name: '心动模式', desc: '播放你收藏的歌曲', icon: 'xindongmoshi', bgColor: 'linear-gradient(135deg, #FF2D55, #FF6B8A)' },
	{ name: '智能推荐', desc: '基于你的喜好推荐', icon: 'zhinengtuijian', bgColor: 'linear-gradient(135deg, #FFCC00, #FF9500)' },
	{ name: '新歌雷达', desc: '发现最新音乐', icon: 'xiaoxi', bgColor: 'linear-gradient(135deg, #5AC8FA, #007AFF)' },
])

// 私人fm当前歌曲
const currentFmSong = ref(null)

// 猶你喜欢的歌曲
const guessSongs = ref([])

// 心情
const moods = ref([
	{ name: '愉悦', emoji: '😊', bgColor: 'linear-gradient(135deg, #FFCC00, #FF9500)' },
	{ name: '伤感', emoji: '😢', bgColor: 'linear-gradient(135deg, #5AC8FA, #007AFF)' },
	{ name: '安静', emoji: '😌', bgColor: 'linear-gradient(135deg, #34C759, #30D158)' },
	{ name: '激情', emoji: '🔥', bgColor: 'linear-gradient(135deg, #FF2D55, #FF6B8A)' },
	{ name: '浪漫', emoji: '💕', bgColor: 'linear-gradient(135deg, #FF6B8A, #FF8A80)' },
])

// 场景
const scenes = ref([
	{ name: '工作', icon: 'gongzuotai', bgColor: 'linear-gradient(135deg, #667eea, #764ba2)' },
	{ name: '运动', icon: 'yundong', bgColor: 'linear-gradient(135deg, #34C759, #30D158)' },
	{ name: '睡前', icon: 'tubiao_shuiqianpingjia', bgColor: 'linear-gradient(135deg, #5AC8FA, #007AFF)' },
	{ name: '通勤', icon: 'zhanghaodakaijiashimoshi', bgColor: 'linear-gradient(135deg, #FFCC00, #FF9500)' },
])

// 获取歌手名称
const getArtistNames = (artists) => {
	if (!artists || !artists.length) return '未知歌手'
	return artists.map(a => a.name).join(' / ')
}

// 播放歌曲
const playSong = (song) => {
	console.log('Play song:', song)
	// 实现播放逻辑
}

// 获取私人fm
const fetchPersonalFm = async () => {
	try {
		const res = await getPersonalFm()
		if (res.code === 200 && res.data && res.data.length > 0) {
			currentFmSong.value = res.data[0]
		}
	} catch (error) {
		console.error('获取私人fm失败:', error)
	}
}

// 获取推荐歌曲（猶你喜欢）
const fetchGuessSongs = async () => {
	try {
		const res = await getRecommendNewSong(10)
		if (res.code === 200) {
			guessSongs.value = res.result || []
		}
	} catch (error) {
		console.error('获取推荐歌曲失败:', error)
	}
}

// 换一批
const refreshGuess = () => {
	fetchGuessSongs()
}

// 初始化数据
const initData = async () => {
	await Promise.all([
		fetchPersonalFm(),
		fetchGuessSongs()
	])
}

onMounted(() => {
	// 初始化高度计算
	calculateScrollHeight()
	
	// 监听屏幕尺寸变化（如旋转屏幕）
	// #ifdef H5
	window.addEventListener('resize', handleResize)
	// #endif
	
	initData()
})

onUnmounted(() => {
	// 清理事件监听器
	// #ifdef H5
	window.removeEventListener('resize', handleResize)
	// #endif
})

// tab切换
const onTabChange = (name) => {
	console.log('Tab changed to:', name)
}


</script>

<style lang="scss" scoped>
.roam-page {
	min-height: 100vh;
	background: #f5f5f5;
  position: relative;
  overflow: hidden;
}

// 自定义顶部导航栏
.custom-navbar {
	display: flex;
	align-items: center;
	justify-content: space-between;
	height: 60px; // 与discovery页面一致的导航栏高度
	padding: 0 24rpx;
	background: #fff;
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	z-index: 100;
	border-bottom: 1rpx solid #f0f0f0;

	.nav-left, .nav-right {
		width: 60rpx;
		height: 60rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		border-radius: 50%;
		transition: background-color 0.2s;
		
		&:active {
			background-color: #f0f0f0;
		}
		
		.nav-icon {
			font-size: 44rpx; // 与discovery页面一致的图标大小
			color: #333;
		}
	}

	.nav-title {
		font-size: 36rpx; // 与discovery页面一致的标题大小
		font-weight: bold;
		color: #333;
	}
}


// 主内容区
.roam-content {
	// 高度由JavaScript动态计算
	margin-top: 60px; // 与discovery页面一致
}

// 当前播放
.now-playing {
	position: relative;
	padding: 60rpx 24rpx;
	background: linear-gradient(180deg, #fff 0%, #f5f5f5 100%);
	
	.playing-content {
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	
	.playing-cover {
		position: relative;
		width: 280rpx;
		height: 280rpx;
		
		.cover-inner {
			width: 100%;
			height: 100%;
			background: linear-gradient(135deg, #333, #666);
			border-radius: 50%;
			display: flex;
			align-items: center;
			justify-content: center;
			
			&.rotating {
				animation: rotate 20s linear infinite;
			}
			
			.cover-music-icon {
				font-size: 80rpx;
				color: #fff;
			}
		}
		
		.cover-ring {
			position: absolute;
			top: -20rpx;
			left: -20rpx;
			right: -20rpx;
			bottom: -20rpx;
			border: 4rpx solid rgba(236, 65, 65, 0.3);
			border-radius: 50%;
		}
	}
	
	.playing-info {
		margin-top: 40rpx;
		text-align: center;
		
		.playing-title {
			display: block;
			font-size: 36rpx;
			font-weight: bold;
			color: #333;
		}
		
		.playing-subtitle {
			display: block;
			font-size: 26rpx;
			color: #999;
			margin-top: 12rpx;
		}
	}
	
	.playing-action {
		margin-top: 40rpx;
		
		.action-btn {
			width: 100rpx;
			height: 100rpx;
			background: #EC4141;
			border-radius: 50%;
			display: flex;
			align-items: center;
			justify-content: center;
			box-shadow: 0 8rpx 30rpx rgba(236, 65, 65, 0.4);
			
			.action-play-icon {
				font-size: 64rpx;
				color: #fff;
			}
		}
	}
}

@keyframes rotate {
	from {
		transform: rotate(0deg);
	}
	to {
		transform: rotate(360deg);
	}
}

// 通用section
.section-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 24rpx;
	
	.section-title {
		font-size: 32rpx;
		font-weight: bold;
		color: #333;
	}
	
	.section-refresh {
		display: flex;
		align-items: center;
		
		.refresh-icon {
			font-size: 32rpx;
			color: #EC4141;
		}
		
		.refresh-text {
			font-size: 24rpx;
			color: #EC4141;
			margin-left: 8rpx;
		}
	}
}

// 漫游模式
.mode-section {
	background: #fff;
	padding: 24rpx;
	margin-top: 20rpx;
	
	.mode-grid {
		display: flex;
		flex-wrap: wrap;
		gap: 20rpx;
		
		.mode-item {
			width: calc(50% - 10rpx);
			display: flex;
			align-items: center;
			padding: 24rpx;
			background: #f8f8f8;
			border-radius: 16rpx;
			
			.mode-icon {
				width: 80rpx;
				height: 80rpx;
				border-radius: 50%;
				display: flex;
				align-items: center;
				justify-content: center;
				
				.mode-iconfont {
					font-size: 48rpx;
					color: #fff;
				}
			}
			
			.mode-info {
				margin-left: 20rpx;
				
				.mode-name {
					display: block;
					font-size: 28rpx;
					font-weight: 500;
					color: #333;
				}
				
				.mode-desc {
					display: block;
					font-size: 20rpx;
					color: #999;
					margin-top: 6rpx;
				}
			}
		}
	}
}

// 猜你喜欢
.guess-section {
	background: #fff;
	padding: 24rpx;
	margin-top: 20rpx;
	
	.guess-list {
		.guess-item {
			display: flex;
			align-items: center;
			padding: 16rpx 0;
			border-bottom: 1rpx solid #f5f5f5;
			
			&:last-child {
				border-bottom: none;
			}
			
			.guess-cover {
				width: 90rpx;
				height: 90rpx;
				border-radius: 12rpx;
				overflow: hidden;
				
				.cover-img {
					width: 100%;
					height: 100%;
				}
			}
			
			.guess-info {
				flex: 1;
				margin-left: 20rpx;
				
				.guess-name {
					display: block;
					font-size: 28rpx;
					color: #333;
				}
				
				.guess-artist {
					display: block;
					font-size: 22rpx;
					color: #999;
					margin-top: 8rpx;
				}
			}
			
			.guess-action {
				.guess-play-icon {
					font-size: 64rpx;
					color: #EC4141;
				}
			}
		}
	}
}

// 心情
.mood-section {
	background: #fff;
	padding: 24rpx;
	margin-top: 20rpx;
	
	.mood-scroll {
		white-space: nowrap;
		
		.mood-item {
			display: inline-block;
			text-align: center;
			margin-right: 30rpx;
			
			.mood-cover {
				width: 120rpx;
				height: 120rpx;
				border-radius: 50%;
				display: flex;
				align-items: center;
				justify-content: center;
				
				.mood-emoji {
					font-size: 48rpx;
				}
			}
			
			.mood-name {
				display: block;
				font-size: 24rpx;
				color: #333;
				margin-top: 12rpx;
			}
		}
	}
}

// 场景
.scene-section {
	background: #fff;
	padding: 24rpx;
	margin-top: 20rpx;
	
	.scene-grid {
		display: flex;
		flex-wrap: wrap;
		gap: 16rpx;
		
		.scene-item {
			width: calc(50% - 8rpx);
			
			.scene-card {
				display: flex;
				align-items: center;
				padding: 30rpx 24rpx;
				border-radius: 16rpx;
				
				.scene-iconfont {
					font-size: 48rpx;
					color: #fff;
				}
				
				.scene-name {
					font-size: 28rpx;
					color: #fff;
					margin-left: 16rpx;
					font-weight: 500;
				}
			}
		}
	}
}

// 底部占位（已移除）


</style>
