<template>
	<!-- 底部导航栏 -->
	<up-tabbar
		:value="currentPage"
		@change="onTabChange"
		:fixed="true"
		:placeholder="false"
		:safeAreaInsetBottom="false"
		:border="true"
		:activeColor="activeColor"
		:inactiveColor="inactiveColor"
		:zIndex="999"
	>
		<up-tabbar-item
			name="discovery"
			icon="home"
			text="发现"
		></up-tabbar-item>
		
		<up-tabbar-item
			name="roam"
			icon="map"
			text="漫游"
		></up-tabbar-item>
		
		<up-tabbar-item
			name="my"
			icon="account"
			text="我的"
		></up-tabbar-item>
		
		<up-tabbar-item
			name="community"
			icon="chat"
			text="云村"
		></up-tabbar-item>
	</up-tabbar>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { onPageScroll } from '@dcloudio/uni-app'

// 定义 props
const props = defineProps({
	currentPage: {
		type: String,
		default: 'discovery'
	}
})

// 定义 emits
const emit = defineEmits(['tabChange'])

// 主题颜色配置
const activeColor = '#EC4141'
const inactiveColor = '#999999'

// 页面路径映射
const pageMap = {
	'discovery': '/pages/discovery/discovery',
	'roam': '/pages/roam/roam',
	'my': '/pages/my/my',
	'community': '/pages/community/community'
}

// tab切换处理
const onTabChange = (name) => {
	// 如果点击的是当前页面，不执行跳转
	if (name === props.currentPage) {
		return
	}
	
	// 发出事件通知父组件
	emit('tabChange', name)
	
	// 执行页面跳转
	const targetPage = pageMap[name]
	if (targetPage) {
		// 如果是tab页面切换，使用reLaunch确保页面状态正确
		uni.reLaunch({
			url: targetPage
		})
	}
}
</script>

<style lang="scss" scoped>
// 底部导航栏样式可以通过 u-tabbar 的 props 进行配置
// 这里可以添加额外的自定义样式
</style>