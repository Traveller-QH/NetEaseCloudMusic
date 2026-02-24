<template>
  <view class="video-player-page">
    <!-- 顶部导航栏 -->
    <view class="top-navbar">
      <view class="nav-left" @click="goBack">
        <i class="iconfont icon-arrow-left" />
      </view>
      <view class="nav-center">
        <text class="nav-title">视频播放</text>
      </view>
      <view class="nav-right">
        <!-- 可以放其他功能按钮 -->
      </view>
    </view>

    <!-- 主内容区域 -->
    <scroll-view class="main-content" scroll-y>
      <!-- 视频播放区域 -->
      <view class="video-container">
        <video 
          id="myVideo" 
          class="video-player" 
          :src="videoUrl" 
          :controls="true"
          :autoplay="false"
          :loop="false"
          :muted="false"
          @play="onVideoPlay"
          @pause="onVideoPause"
          @ended="onVideoEnded"
          @error="onVideoError"
          object-fit="contain"
          v-if="videoUrl"
        ></video>
        
        <!-- 视频加载失败时的占位符 -->
        <view class="video-placeholder" v-else>
          <view class="placeholder-content">
            <i class="iconfont icon-shipin" style="font-size: 60px; color: #ccc;" />
            <text class="placeholder-text">视频加载失败</text>
            <text class="placeholder-subtext">请检查网络连接或稍后再试</text>
            <button class="refresh-btn" @click="refreshVideo">重新加载</button>
          </view>
        </view>
      </view>

      <!-- 视频信息区域 -->
      <view class="video-info">
        <text class="video-title">{{ mvDetail.name || videoInfo.title || videoInfo.name || 'MV标题' }}</text>
        <view class="video-meta">
          <text class="video-artist">{{ mvDetail.artistName || videoInfo.creatorName || videoInfo.author || '未知艺术家' }}</text>
          <text class="video-play-count">{{ formatCount(mvDetail.playCount || videoInfo.playCount) }}次播放</text>
        </view>
      </view>

      <!-- 互动操作区域 -->
      <view class="video-actions">
        <!-- 点赞按钮 -->
        <view class="action-item" @click="toggleLike">
          <i class="iconfont" :class="{ 'icon-xihuan1': liked, 'icon-xihuan': !liked }" />
          <text class="action-text">{{ liked ? '已点赞' : '点赞' }}</text>
          <text class="action-count">{{ formatCount(likeCount) }}</text>
        </view>

        <!-- 评论按钮 -->
        <view class="action-item" @click="focusCommentInput">
          <i class="iconfont icon-pinglun" />
          <text class="action-text">评论</text>
          <text class="action-count">{{ formatCount(commentCount) }}</text>
        </view>

        <!-- 转发按钮 -->
        <view class="action-item" @click="handleForward">
          <i class="iconfont icon-fenxiang1" />
          <text class="action-text">分享</text>
          <text class="action-count">{{ formatCount(forwardCount) }}</text>
        </view>
      </view>

      <!-- MV百科信息 -->
      <view class="mv-wiki-section" v-if="mvWiki && mvWiki.desc">
        <view class="section-header">
          <text class="section-title">MV简介</text>
        </view>
        <text class="wiki-content">{{ mvWiki.desc }}</text>
      </view>
      
      <!-- MV详细信息 -->
      <view class="mv-detail-section" v-if="mvDetail && (mvDetail.mvName || mvDetail.artistRepVos || mvDetail.publishTime || mvDetail.desc)">
        <view class="section-header">
          <text class="section-title">详细信息</text>
        </view>
        <view class="detail-content">
          <view class="detail-row" v-if="mvDetail.mvName">
            <text class="label">MV名称：</text>
            <text class="value">{{ mvDetail.mvName }}</text>
          </view>
          <view class="detail-row" v-if="mvDetail.artistRepVos && mvDetail.artistRepVos.length > 0">
            <text class="label">艺人：</text>
            <text class="value">{{ mvDetail.artistRepVos.map(artist => artist.artistName).join('/') }}</text>
          </view>
          <view class="detail-row" v-if="mvDetail.publishTime">
            <text class="label">发布时间：</text>
            <text class="value">{{ formatDate(mvDetail.publishTime) }}</text>
          </view>
          <view class="detail-row" v-if="mvDetail.desc">
            <text class="label">描述：</text>
            <text class="value">{{ mvDetail.desc }}</text>
          </view>
        </view>
      </view>

      <!-- 评论区域 -->
      <view class="comments-section">
        <view class="section-header">
          <text class="section-title">评论 ({{ commentCount }})</text>
        </view>
        
        <!-- 发表评论输入框 -->
        <view class="comment-input-area" id="commentInput">
          <textarea 
            class="comment-input" 
            v-model="newComment" 
            :placeholder="replyPlaceholder"
            maxlength="140"
            :focus="isCommentInputFocused"
            @blur="isCommentInputFocused = false"
          />
          <button class="send-comment-btn" @click="postComment">发送</button>
        </view>
        
        <!-- 评论列表 -->
        <view class="comments-list">
          <view class="comment-item" v-for="comment in comments" :key="comment.commentId ? comment.commentId : comment.id">
            <image :src="comment.user.avatarUrl ? comment.user.avatarUrl : (comment.user.avatar ? comment.user.avatar : '/static/images/avatar_default.png')" class="comment-avatar" mode="aspectFill" />
            <view class="comment-content">
              <view class="comment-header">
                <text class="comment-user">{{ comment.user.nickname ? comment.user.nickname : (comment.user.userName ? comment.user.userName : '用户') }}</text>
                <text class="comment-time">{{ formatDate(comment.time) }}</text>
              </view>
              <!-- 显示被回复的评论 -->
              <view class="reply-to" v-if="comment.beReplied && comment.beReplied.length > 0">
                <text class="reply-prefix">@</text>
                <text class="reply-user">{{ comment.beReplied[0].user.nickname || comment.beReplied[0].user.userName || '用户' }}:</text>
                <text class="reply-content">{{ comment.beReplied[0].content }}</text>
              </view>
              <text class="comment-text">{{ comment.content }}</text>
              <view class="comment-actions">
                <text class="like-comment" @click="likeComment(comment)">👍 {{ comment.likedCount ? comment.likedCount : 0 }}</text>
                <text class="reply-comment" @click="replyComment(comment)">回复</text>
                <text class="delete-comment" v-if="canDeleteComment(comment)" @click="deleteComment(comment)">删除</text>
              </view>
            </view>
          </view>
          
          <view class="no-comments" v-if="!comments || comments.length === 0">
            <text>暂无评论，快来发表第一个评论吧~</text>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import { getVideoUrl, getVideoDetailInfo, toggleResourceLike, getVideoComments, getMvComments, postNewComment, deleteComment as deleteCommentApi, convertMlogToVideo, getMlogUrl, getMvUrl, getMvDetail, getMvDetailInfo, getMvWiki } from '@/utils/api.js'
import { useUserStore } from '@/utils/userStore.js'

export default {
  data() {
    return {
      videoUrl: '',
      videoInfo: {},
      videoId: null,
      mvDetail: {},
      mvWiki: {},
      likeCount: 0,
      commentCount: 0,
      shareCount: 0,
      forwardCount: 0,
      liked: false,
      comments: [],
      newComment: '',
      isCommentInputFocused: false,
      // 回复相关状态
      replyToComment: null, // 正在回复的评论
      replyPlaceholder: '发表你的评论...' // 输入框占位符
    }
  },
  
  onLoad(options) {
    if (options.id) {
      this.videoId = options.id
      console.log('接收到的视频ID:', this.videoId, '类型:', typeof this.videoId)
      
      // 检查用户登录状态
      const userStore = useUserStore()
      console.log('当前用户状态:', userStore.state)
      
      this.initVideo()
    }
  },
  
  methods: {
    // 初始化视频
    async initVideo() {
      console.log('开始初始化视频，视频ID:', this.videoId)
      try {
        // 并行加载视频详情信息和评论
        await Promise.all([
          this.loadVideoDetailInfo(),
          this.loadComments()
        ])
        
        // 获取视频URL（可能失败）
        try {
          await this.loadVideoUrl()
        } catch (urlError) {
          console.warn('视频URL加载失败，可能需要有效的视频ID和网络服务:', urlError)
          // 不抛出错误，允许页面继续加载其他内容
        }
      } catch (error) {
        console.error('初始化视频失败:', error)
        uni.showToast({
          title: '加载视频信息失败',
          icon: 'none'
        })
      }
    },

    // 加载视频URL
    async loadVideoUrl() {
      try {
        console.log('正在获取MV URL，MV ID:', this.videoId, '类型:', typeof this.videoId)
        
        // 检查ID是否为数字，如果是则使用MV URL接口
        const numericId = Number(this.videoId);
        if (!isNaN(numericId)) {
          const res = await getMvUrl(numericId);
          console.log('MV URL响应:', res);
          if (res.code === 200 && res.data && res.data.url) {
            this.videoUrl = res.data.url;
            console.log('MV URL设置成功:', this.videoUrl);
            return;
          }
        }
        
        throw new Error('无法获取MV播放地址');
        
      } catch (error) {
        console.error('获取MV URL失败:', error);
        // 尝试使用备用的视频URL
        // 这里可以提供一个默认视频URL或提示用户
        uni.showToast({
          title: '视频加载失败',
          icon: 'none'
        });
        throw error;
      }
    },

    // 加载MV详情信息
    async loadVideoDetailInfo() {
      try {
        console.log('正在获取MV详情，MV ID:', this.videoId)
        
        // 获取MV详情信息
        try {
          const mvDetailRes = await getMvDetail(this.videoId)
          console.log('MV详情响应:', mvDetailRes)
          if (mvDetailRes.code === 200) {
            this.mvDetail = mvDetailRes.data || {}
            this.videoInfo = mvDetailRes.data || {}
          }
        } catch (mvDetailError) {
          console.log('获取MV详情失败:', mvDetailError.message);
        }
        
        // 获取MV点赞转发评论数
        try {
          const mvInfoRes = await getMvDetailInfo(this.videoId)
          console.log('MV详情信息响应:', mvInfoRes)
          if (mvInfoRes.code === 200) {
            this.likeCount = mvInfoRes.subCount || mvInfoRes.data?.subCount || 0
            this.commentCount = mvInfoRes.commentCount || mvInfoRes.data?.commentCount || 0
            this.forwardCount = mvInfoRes.shareCount || mvInfoRes.data?.shareCount || 0
            this.liked = mvInfoRes.isSubed || mvInfoRes.data?.isSubed || false
          }
        } catch (mvInfoError) {
          console.log('获取MV详情信息失败:', mvInfoError.message);
        }
        
        // 获取MV百科信息
        try {
          const mvWikiRes = await getMvWiki(this.videoId)
          console.log('MV百科信息响应:', mvWikiRes)
          if (mvWikiRes.code === 200) {
            this.mvWiki = mvWikiRes.data || {}
          }
        } catch (mvWikiError) {
          console.log('获取MV百科信息失败:', mvWikiError.message);
        }
        
      } catch (error) {
        console.error('获取MV详情失败:', error)
        // 设置默认值
        this.likeCount = 0
        this.commentCount = 0
        this.forwardCount = 0
        this.liked = false
      }
    },

    // 加载评论
    async loadComments() {
      try {
        console.log('正在获取MV评论，MV ID:', this.videoId)
        const res = await getMvComments(this.videoId)
        console.log('MV评论响应:', res)
        if (res.code === 200) {
          this.comments = res.comments || []
          this.commentCount = res.total || this.comments.length || 0
        } else {
          console.warn('评论获取失败，使用默认值')
          this.comments = []
          this.commentCount = 0
        }
      } catch (error) {
        console.error('获取MV评论失败:', error)
        this.comments = []
        this.commentCount = 0
      }
    },

    // 切换点赞状态
    async toggleLike() {
      try {
        const tValue = this.liked ? 0 : 1;
        const res = await toggleResourceLike(1, tValue, this.videoId) // 类型1代表MV
        if (res.code === 200) {
          this.liked = !this.liked
          if (this.liked) {
                      this.likeCount = this.likeCount + 1;
                    } else {
                      this.likeCount = Math.max(0, this.likeCount - 1);
                    }
          uni.showToast({
            title: this.liked ? '已点赞' : '已取消点赞',
            icon: 'none'
          })
        } else {
          throw new Error(res.message || '操作失败')
        }
      } catch (error) {
        console.error('点赞操作失败:', error)
        uni.showToast({
          title: '操作失败',
          icon: 'none'
        })
      }
    },

    // 刷新视频
    async refreshVideo() {
      uni.showLoading({
        title: '加载中...'
      })
      try {
        await this.loadVideoUrl()
        uni.hideLoading()
        if (this.videoUrl) {
          uni.showToast({
            title: '视频加载成功',
            icon: 'success'
          })
        }
      } catch (error) {
        uni.hideLoading()
        console.error('刷新视频失败:', error)
        uni.showToast({
          title: '视频加载失败',
          icon: 'none'
        })
      }
    },

    // 返回上一页
    goBack() {
      uni.navigateBack()
    },
    
    // 聚焦评论输入框
    focusCommentInput() {
      this.isCommentInputFocused = true
      // 滚动到评论输入框位置
      uni.createSelectorQuery().select('#commentInput').boundingClientRect(rect => {
        if (rect) {
          uni.pageScrollTo({
            scrollTop: rect.top + uni.pageScrollTo().scrollTop - 100,
            duration: 300
          })
        }
      }).exec()
    },

    // 发布评论
    async postComment() {
      if (!this.newComment.trim()) {
        uni.showToast({
          title: '请输入评论内容',
          icon: 'none'
        })
        return
      }

      try {
        let res
        if (this.replyToComment) {
          // 回复评论
          res = await postNewComment(2, 1, this.videoId, this.newComment, this.replyToComment.commentId || this.replyToComment.id)
        } else {
          // 发布新评论
          res = await postNewComment(1, 1, this.videoId, this.newComment)
        }
        
        if (res.code === 200) {
          uni.showToast({
            title: this.replyToComment ? '回复成功' : '评论成功',
            icon: 'success'
          })
          this.newComment = ''
          this.replyToComment = null
          this.replyPlaceholder = '发表你的评论...'
          // 重新加载评论
          await this.loadComments()
        } else {
          throw new Error(res.message || '评论失败')
        }
      } catch (error) {
        console.error('发布评论失败:', error)
        uni.showToast({
          title: '评论失败',
          icon: 'none'
        })
      }
    },

    // 删除评论
    async deleteComment(comment) {
      try {
        const commentId = comment.commentId || comment.id
        console.log('=== 删除评论参数 ===')
        console.log('t:', 0)
        console.log('type:', 1) 
        console.log('id:', this.videoId)
        console.log('commentId:', commentId)
        console.log('评论完整信息:', comment)
        console.log('=== 参数结束 ===')
        
        const res = await deleteCommentApi(0, 1, this.videoId, commentId) // t:0删除, type:1 MV
        console.log('删除评论响应:', res)
        
        if (res.code === 200) {
          uni.showToast({
            title: '删除成功',
            icon: 'success'
          })
          // 从本地评论列表中移除该评论
          const index = this.comments.findIndex(c => (c.commentId || c.id) === commentId)
          if (index !== -1) {
            this.comments.splice(index, 1)
            this.commentCount = Math.max(0, this.commentCount - 1)
          }
        } else {
          throw new Error(res.message || '删除失败')
        }
      } catch (error) {
        console.error('删除评论失败:', error)
        uni.showToast({
          title: '删除失败: ' + (error.message || '未知错误'),
          icon: 'none'
        })
      }
    },

    // 判断是否可以删除评论
    canDeleteComment(comment) {
      // 获取当前用户ID
      const userStore = useUserStore()
      const currentUserId = userStore.userInfo.userId
      
      console.log('=== 删除权限检查 ===')
      console.log('当前用户ID:', currentUserId)
      console.log('评论信息:', comment)
      
      if (!currentUserId) {
        console.log('未登录用户，不能删除评论')
        return false // 未登录用户不能删除任何评论
      }
      
      // 获取评论者的用户ID
      let commentUserId = comment.user?.userId
      if (!commentUserId) commentUserId = comment.user?.uid
      if (!commentUserId) commentUserId = comment.userId
      if (!commentUserId) commentUserId = comment.uid
      
      console.log('评论者ID:', commentUserId)
      console.log('是否可以删除:', commentUserId === currentUserId)
      console.log('=== 检查结束 ===')
      
      // 如果评论者ID与当前用户ID相同，则可以删除
      return commentUserId === currentUserId
    },

    // 回复评论
    replyComment(comment) {
      // 设置回复状态
      this.replyToComment = comment
      this.replyPlaceholder = `回复 @${comment.user.nickname || comment.user.userName || '用户'}:`
      this.newComment = '' // 清空输入框
      this.isCommentInputFocused = true
      
      // 滚动到评论输入框
      this.$nextTick(() => {
        uni.createSelectorQuery().select('#commentInput').boundingClientRect(rect => {
          if (rect) {
            uni.pageScrollTo({
              scrollTop: rect.top + uni.pageScrollTo().scrollTop - 100,
              duration: 300
            })
          }
        }).exec()
      })
    },

    // 点赞评论
    likeComment(comment) {
      // TODO: 实现评论点赞功能
      uni.showToast({
        title: '评论点赞功能待实现',
        icon: 'none'
      })
    },

    // 处理转发
    handleForward() {
      // 转发功能
      console.log('转发功能')
      uni.showActionSheet({
        itemList: ['微博', 'QQ空间', '朋友圈', '复制链接'],
        success: (res) => {
          if (res.tapIndex === 3) { // 复制链接
            uni.setClipboardData({
              data: `https://music.163.com/mv/${this.videoId}`,
              success: () => {
                uni.showToast({
                  title: '链接已复制',
                  icon: 'success'
                })
              }
            })
          }
        }
      })
    },
    
    // 处理分享
    handleShare() {
      // TODO: 实现分享功能，目前只是显示分享数量
      uni.showActionSheet({
        itemList: ['微信好友', '朋友圈', 'QQ', '复制链接'],
        success: (res) => {
          if (res.tapIndex === 3) { // 复制链接
            uni.setClipboardData({
              data: `https://music.163.com/video/${this.videoId}`,
              success: () => {
                uni.showToast({
                  title: '链接已复制',
                  icon: 'success'
                })
              }
            })
          }
        }
      })
    },

    // 格式化数字显示
    formatCount(count) {
      if (!count) return '0'
      if (count >= 10000) {
        return (count / 10000).toFixed(1) + '万'
      }
      return count.toString()
    },

    // 格式化时间
    formatDate(timestamp) {
      if (!timestamp) return ''
      const date = new Date(timestamp)
      const now = new Date()
      const diff = now.getTime() - date.getTime()
      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      
      if (days === 0) {
        return '今天'
      } else if (days === 1) {
        return '昨天'
      } else if (days < 7) {
        return `${days}天前`
      } else {
        return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
      }
    },

    // 视频事件处理
    onVideoPlay() {
      console.log('视频开始播放')
    },

    onVideoPause() {
      console.log('视频暂停')
    },

    onVideoEnded() {
      console.log('视频播放结束')
    },

    onVideoError(e) {
      console.error('视频播放错误:', e)
      uni.showToast({
        title: '视频播放失败，请稍后再试',
        icon: 'none'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.video-player-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;

  // 顶部导航栏
  .top-navbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 44px;
    padding: 0 15px;
    background-color: #fff;
    border-bottom: 1px solid #eee;
    position: relative;
    z-index: 100;

    .nav-left {
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      
      .iconfont {
        font-size: 20px;
        color: #333;
      }
    }

    .nav-center {
      flex: 1;
      text-align: center;
      
      .nav-title {
        font-size: 17px;
        font-weight: 500;
        color: #333;
      }
    }

    .nav-right {
      display: flex;
      align-items: center;
      
      .nav-action-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        margin-left: 20px;
        min-width: 40px;
        
        .iconfont {
          font-size: 20px;
          color: #666;
          margin-bottom: 2px;
        }
        
        .action-count {
          font-size: 10px;
          color: #999;
        }
      }
    }
  }

  // 主内容区域
  .main-content {
    flex: 1;
    overflow-y: auto;
    
    // 视频播放区域
    .video-container {
      width: 100%;
      height: 240px;
      background-color: #000;
      position: relative;

      .video-player {
        width: 100%;
        height: 100%;
      }
      
      .video-placeholder {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: #000;
        
        .placeholder-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #ccc;
          text-align: center;
          
          .placeholder-text {
            font-size: 16px;
            margin-top: 10px;
          }
          
          .placeholder-subtext {
            font-size: 12px;
            margin-top: 5px;
            color: #999;
          }
          
          .refresh-btn {
            margin-top: 15px;
            padding: 8px 20px;
            background-color: #ec4141;
            color: #fff;
            border-radius: 20px;
            font-size: 14px;
            border: none;
          }
        }
      }
    }

    // 视频信息区域
    .video-info {
      padding: 15px;
      background-color: #fff;
      margin-bottom: 10px;

      .video-title {
        font-size: 18px;
        font-weight: bold;
        color: #333;
        margin-bottom: 10px;
        line-height: 1.4;
      }

      .video-meta {
        display: flex;
        justify-content: space-between;
        align-items: center;
        color: #999;
        font-size: 14px;
      }
    }

    // 互动操作区域
    .video-actions {
      display: flex;
      justify-content: space-around;
      align-items: center;
      padding: 15px 0;
      background-color: #fff;
      margin-bottom: 10px;
      border-top: 1px solid #eee;
      border-bottom: 1px solid #eee;

      .action-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        flex: 1;

        .iconfont {
          font-size: 24px;
          color: #666;
          margin-bottom: 5px;
        }

        .action-text {
          font-size: 12px;
          color: #666;
          margin-bottom: 3px;
        }

        .action-count {
          font-size: 10px;
          color: #999;
        }
      }
    }

    // 通用区块样式
    .section-header {
      padding: 15px 15px 10px;
      background-color: #fff;
      
      .section-title {
        font-size: 16px;
        font-weight: bold;
        color: #333;
      }
    }

    // MV百科信息
    .mv-wiki-section {
      background-color: #fff;
      margin-bottom: 10px;
      
      .wiki-content {
        display: block;
        padding: 0 15px 15px;
        font-size: 14px;
        color: #666;
        line-height: 1.6;
        background-color: #fff;
      }
    }
    
    // MV详细信息
    .mv-detail-section {
      background-color: #fff;
      margin-bottom: 10px;
      
      .detail-content {
        padding: 0 15px 15px;
        
        .detail-row {
          display: flex;
          margin-bottom: 8px;
          font-size: 14px;
          
          .label {
            color: #999;
            min-width: 70px;
          }
          
          .value {
            color: #666;
            flex: 1;
            line-height: 1.4;
          }
        }
      }
    }

    // 评论区域
    .comments-section {
      background-color: #fff;
      margin-bottom: 10px;
      
      .comment-input-area {
        display: flex;
        align-items: flex-end;
        padding: 0 15px 15px;
        background-color: #fff;
        
        .comment-input {
          flex: 1;
          min-height: 40px;
          max-height: 100px;
          padding: 10px;
          border: 1px solid #eee;
          border-radius: 20px;
          font-size: 14px;
          margin-right: 10px;
          background-color: #f8f8f8;
        }
        
        .send-comment-btn {
          padding: 10px 15px;
          background-color: #ec4141;
          color: #fff;
          border-radius: 20px;
          font-size: 14px;
          border: none;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      }
      
      .comments-list {
        padding: 0 15px 15px;
        
        .comment-item {
          display: flex;
          margin-bottom: 15px;
          padding: 10px 0;
          
          .comment-avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            margin-right: 10px;
            flex-shrink: 0;
          }
          
          .comment-content {
            flex: 1;
            
            .comment-header {
              display: flex;
              justify-content: space-between;
              margin-bottom: 5px;
              
              .comment-user {
                font-size: 14px;
                font-weight: bold;
                color: #333;
              }
              
              .comment-time {
                font-size: 12px;
                color: #999;
              }
            }
            
            // 被回复的评论样式
            .reply-to {
              background-color: #f8f8f8;
              padding: 8px 10px;
              border-radius: 6px;
              margin-bottom: 8px;
              font-size: 13px;
              
              .reply-prefix {
                color: #ec4141;
                margin-right: 2px;
              }
              
              .reply-user {
                color: #ec4141;
                font-weight: 500;
                margin-right: 4px;
              }
              
              .reply-content {
                color: #666;
                line-height: 1.4;
              }
            }
            
            .comment-text {
              font-size: 14px;
              color: #666;
              margin-bottom: 8px;
              line-height: 1.5;
            }
            
            .comment-actions {
              display: flex;
              font-size: 12px;
              color: #999;
              
              .like-comment, .reply-comment, .delete-comment {
                margin-right: 15px;
                cursor: pointer;
              }
              
              .delete-comment {
                color: #999;
              }
            }
          }
        }
        
        .no-comments {
          text-align: center;
          padding: 30px 0;
          color: #999;
          font-size: 14px;
        }
      }
    }
  }
}
</style>