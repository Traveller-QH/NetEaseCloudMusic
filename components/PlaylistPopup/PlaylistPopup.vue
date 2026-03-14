<template>
  <u-popup v-model:show="visible" mode="bottom" :round="20">
    <view class="playlist-popup">
      <!-- 顶部导航条 -->
      <view class="popup-header">
        <view class="header-left">
          <text class="header-title">播放列表</text>
          <text class="header-count">({{ musicStore.state.playlist.length }}首)</text>
        </view>
        <view class="header-right">
          <!-- 循环模式切换按钮 -->
          <view class="header-btn" @click="handleTogglePlayMode">
            <i 
              class="iconfont header-icon" 
              :class="playModeIconClass"
              :title="playModeText"
            />
          </view>
          <!-- 清空播放列表按钮 -->
          <view class="header-btn" @click="handleClearPlaylist">
            <i class="iconfont icon-shanchu header-icon" title="清空列表"></i>
          </view>
        </view>
      </view>

      <!-- 播放列表内容 -->
      <scroll-view 
        scroll-y 
        class="playlist-scroll"
        :scroll-top="scrollTop"
        :scroll-with-animation="true"
      >
        <view class="playlist-content">
          <view
            class="playlist-item"
            v-for="(song, index) in musicStore.state.playlist"
            :key="song.id"
            :class="{ 'active': index === musicStore.state.playlistIndex }"
            @click="handlePlaySong(index)"
          >
            <!-- 正在播放图标 (只在当前播放的歌曲显示) -->
            <view class="item-playing" v-if="index === musicStore.state.playlistIndex">
              <i class="iconfont icon-zhengzaibofang playing-icon"></i>
            </view>
            
            <!-- 歌曲信息 (歌曲名和歌手名在同一行) -->
            <view class="item-info">
              <text class="item-song-name">{{ song.name }}</text>
              <text class="item-separator"> · </text>
              <text class="item-artist-name">{{ getArtistNames(song) }}</text>
            </view>
            
            <!-- 删除按钮 -->
            <view class="item-action" @click.stop="handleRemoveSong(song.id)">
              <i class="iconfont icon-guanbi action-icon"></i>
            </view>
          </view>
          
          <!-- 空状态提示 -->
          <view class="empty-state" v-if="musicStore.state.playlist.length === 0">
            <text class="empty-text">播放列表为空</text>
          </view>
        </view>
      </scroll-view>
    </view>
  </u-popup>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { useMusicStore } from '@/utils/musicStore.js'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])

const musicStore = useMusicStore()

// 弹窗显示状态
const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

// 滚动位置
const scrollTop = ref(0)

// 循环模式图标
const playModeIconClass = computed(() => {
  const mode = musicStore.state.playMode
  if (mode === 'single') return 'icon-danquxunhuan'
  if (mode === 'random') return 'icon-suijibofang' // 假设有这个图标
  return 'icon-liebiaoxunhuan'
})

// 循环模式文字
const playModeText = computed(() => {
  const mode = musicStore.state.playMode
  if (mode === 'single') return '单曲循环'
  if (mode === 'random') return '随机播放'
  return '列表循环'
})

// 获取歌手名称
const getArtistNames = (song) => {
  const artists = song.ar || song.artists || []
  if (!artists.length) return '未知歌手'
  return artists.map(a => a.name).join(' / ')
}

// 切换循环模式
const handleTogglePlayMode = () => {
  musicStore.togglePlayMode()
}

// 清空播放列表
const handleClearPlaylist = () => {
  uni.showModal({
    title: '提示',
    content: '确定要清空播放列表吗？',
    success: (res) => {
      if (res.confirm) {
        musicStore.clearPlaylist()
        visible.value = false
        uni.showToast({
          title: '已清空',
          icon: 'none',
          duration: 1500
        })
      }
    }
  })
}

// 播放指定歌曲
const handlePlaySong = (index) => {
  musicStore.playFromPlaylist(index)
}

// 移除歌曲
const handleRemoveSong = (songId) => {
  musicStore.removeFromPlaylist(songId)
}

// 监听弹窗显示状态，确保当前播放的歌曲在视野中
watch(visible, async (newVal) => {
  if (newVal && musicStore.state.playlist.length > 0) {
    await nextTick()
    
    // 计算当前播放歌曲的滚动位置
    const currentIndex = musicStore.state.playlistIndex
    if (currentIndex >= 0) {
      // 每首歌曲的高度约为 120rpx (包括 padding 和 border)
      // 转换为 px (假设设计稿宽度为 750rpx)
      const systemInfo = uni.getSystemInfoSync()
      const screenWidth = systemInfo.windowWidth
      const rpxToPx = screenWidth / 750
      
      // 每首歌曲的实际高度 (根据 CSS 调整)
      const itemHeight = 120 * rpxToPx
      
      // 让当前歌曲显示在第 3 个位置 (前面显示 2 首)
      const targetIndex = Math.max(0, currentIndex - 2)
      scrollTop.value = targetIndex * itemHeight
    }
  }
})
</script>

<style lang="scss" scoped>
.playlist-popup {
  background: #fff;
  border-radius: 20rpx 20rpx 0 0;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}

.popup-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
  
  .header-left {
    display: flex;
    align-items: center;
    
    .header-title {
      font-size: 32rpx;
      font-weight: bold;
      color: #333;
    }
    
    .header-count {
      font-size: 24rpx;
      color: #999;
      margin-left: 10rpx;
    }
  }
  
  .header-right {
    display: flex;
    align-items: center;
    gap: 20rpx;
    
    .header-btn {
      width: 60rpx;
      height: 60rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      
      &:active {
        background: #f5f5f5;
      }
      
      .header-icon {
        font-size: 40rpx;
        color: #666;
      }
    }
  }
}

.playlist-scroll {
  flex: 1;
  max-height: calc(80vh - 100rpx);
  
  .playlist-content {
    min-height: 200rpx;
  }
  
  .playlist-item {
    display: flex;
    align-items: center;
    padding: 20rpx 30rpx;
    transition: background 0.2s;
    
    &:active {
      background: #f5f5f5;
    }
    
    &.active {
      background: rgba(236, 65, 65, 0.05);
      
      .item-info {
        .item-song-name,
        .item-artist-name {
          color: #1E90FF;
        }
      }
      
      .playing-icon {
        color: #1E90FF;
      }
    }
    
    .item-playing {
      width: 60rpx;
      height: 60rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 10rpx;
      flex-shrink: 0;
      
      .playing-icon {
        font-size: 36rpx;
        /* 去掉旋转动画 */
      }
    }
    
    .item-info {
      flex: 1;
      overflow: hidden;
      display: flex;
      align-items: center;
      
      .item-song-name {
        font-size: 28rpx;
        color: #333;
        display: inline;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-weight: 500;
      }
      
      .item-separator {
        font-size: 24rpx;
        color: #999;
        margin: 0 4rpx;
        flex-shrink: 0;
      }
      
      .item-artist-name {
        font-size: 24rpx;
        color: #999;
        display: inline;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
    
    .item-action {
      width: 60rpx;
      height: 60rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      margin-left: 10rpx;
      
      &:active {
        opacity: 0.6;
      }
      
      .action-icon {
        font-size: 36rpx;
        color: #999;
      }
    }
  }
  
  .empty-state {
    padding: 100rpx 0;
    text-align: center;
    
    .empty-text {
      font-size: 28rpx;
      color: #999;
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
</style>
