# userStore 使用说明

## 概述
userStore 是一个基于 Pinia 的用户状态管理模块，支持扫码登录、短信验证码登录、手机号密码登录三种认证方式，并重点持久化存储用户的 `baoyueVersion` 字段。

## 功能特性

### 1. 支持的登录方式
- ✅ 扫码登录
- ✅ 手机号验证码登录
- ✅ 手机号密码登录

### 2. 核心功能
- 自动持久化存储用户信息
- 重点保存 `account.baoyueVersion` 字段（用户权益状态）
- 登录状态自动恢复
- 登录状态有效性验证
- 完整的登录状态管理

### 3. 持久化存储字段
- `isLoggedIn`: 登录状态
- `loginTimestamp`: 登录时间戳
- `loginMethod`: 登录方式
- `userInfo`: 用户基本信息
- `accountInfo`: 账户信息（包含 baoyueVersion）
- `token`: 登录token
- `bindings`: 绑定信息
- `cookie`: Cookie信息

## API 接口

### 状态属性 (state)
```javascript
// 登录状态
isLoggedIn: boolean

// 登录时间戳
loginTimestamp: number

// 登录方式: 'qr' | 'captcha' | 'password'
loginMethod: string

// 用户基本信息
userInfo: {
  userId: number,
  nickname: string,
  avatarUrl: string,
  signature: string,
  gender: number,
  birthday: number,
  province: number,
  city: number,
  vipType: number,
  userType: number,
  authStatus: number,
  accountStatus: number,
  followeds: number,
  follows: number,
  playlistCount: number
}

// 账户信息（重点包含 baoyueVersion）
accountInfo: {
  id: number,
  userName: string,
  type: number,
  status: number,
  whitelistAuthority: number,
  createTime: number,
  tokenVersion: number,
  ban: number,
  baoyueVersion: number,  // 重点字段：包月版本
  donateVersion: number,
  vipType: number,
  viptypeVersion: number,
  anonimousUser: boolean,
  uninitialized: boolean
}

// 登录token
token: string

// 绑定信息
bindings: Array

// Cookie
cookie: string
```

### 计算属性 (getters)
```javascript
// 是否为VIP用户
isVip: boolean

// 是否登录
isLogin: boolean

// 用户显示名称
displayName: string

// 用户头像
avatar: string

// 包月版本信息
baoyueVersion: number
```

### 动作方法 (actions)

#### 核心方法
```javascript
// 设置登录状态（核心方法）
setLoginState(loginData)

// 从本地存储恢复登录状态
restoreLoginState()

// 验证登录状态是否有效
validateLoginStatus()

// 清除登录状态
clearLoginState()

// 退出登录
logout()
```

#### 登录相关方法
```javascript
// 手机号密码登录
loginByPassword(phone, password, countrycode = '86')

// 手机号验证码登录
loginByCaptcha(phone, captcha, countrycode = '86')

// 发送验证码
sendCaptchaCode(phone, countrycode = '86')

// 扫码登录处理
handleQrLogin(loginData)

// 获取用户信息（刷新）
fetchUserInfo()
```

## 使用示例

### 1. 在组件中使用
```vue
<template>
  <view>
    <text>登录状态: {{ userStore.isLogin ? '已登录' : '未登录' }}</text>
    <text>用户昵称: {{ userStore.displayName }}</text>
    <text>包月版本: {{ userStore.baoyueVersion }}</text>
    
    <button @click="handleLogin">登录</button>
    <button @click="handleLogout">退出</button>
  </view>
</template>

<script setup>
import { useUserStore } from '@/utils/userStore.js'

const userStore = useUserStore()

const handleLogin = async () => {
  // 扫码登录示例
  const loginResult = await someQrLoginApi()
  await userStore.setLoginState(loginResult)
  
  // 或者手机号验证码登录
  // await userStore.loginByCaptcha('13800138000', '123456')
}

const handleLogout = async () => {
  await userStore.logout()
}
</script>
```

### 2. 页面初始化时恢复登录状态
```javascript
onShow(async () => {
  // 恢复登录状态
  const isRestored = await userStore.restoreLoginState()
  console.log('登录状态恢复:', isRestored)
  console.log('当前用户:', userStore.displayName)
  console.log('包月版本:', userStore.baoyueVersion)
})
```

### 3. 检查VIP状态
```javascript
// 检查是否为VIP用户
if (userStore.isVip) {
  console.log('用户是VIP')
}

// 检查具体的包月版本
const baoyueVersion = userStore.baoyueVersion
if (baoyueVersion === -2) {
  console.log('用户是SVIP')
} else if (baoyueVersion === 1) {
  console.log('用户是VIP')
}
```

## 重要注意事项

### 1. baoyueVersion 字段说明
- `baoyueVersion: -2` 表示 SVIP（黑胶VIP）
- `baoyueVersion: 1` 表示 VIP
- `baoyueVersion: 0` 表示普通用户

### 2. 持久化机制
- 所有重要状态都会自动持久化到本地存储
- 页面刷新后会自动恢复登录状态
- 支持7天登录有效期验证

### 3. 登录方式标记
在调用 `setLoginState` 时，需要标记登录方式：
```javascript
// 扫码登录
loginData.loginMethod = 'qr'
await userStore.setLoginState(loginData)

// 验证码登录
loginData.loginMethod = 'captcha'
await userStore.setLoginState(loginData)

// 密码登录
loginData.loginMethod = 'password'
await userStore.setLoginState(loginData)
```

## 调试工具
项目中包含了一个测试组件 `TestUserStore.vue`，可以：
- 查看当前登录状态
- 查看用户详细信息
- 查看账户信息（包括 baoyueVersion）
- 手动恢复/清除登录状态
- 检查本地存储情况

使用方法：在页面中引入并使用该组件即可。

## 常见问题

### 1. 登录状态没有持久化？
确保在 `main.js` 中正确配置了 Pinia：
```javascript
import { createPinia } from 'pinia'

export function createApp() {
  const app = createSSRApp(App)
  const pinia = createPinia()
  app.use(pinia)
  // ...
}
```

### 2. baoyueVersion 获取不到？
检查登录接口返回的数据结构是否包含 `account` 字段，userStore 会自动从中提取 `baoyueVersion`。

### 3. 页面刷新后登录状态丢失？
检查本地存储是否被清除，userStore 会自动从以下键值恢复状态：
- `isLoggedIn`
- `loginTimestamp`
- `loginMethod`
- `userInfo`
- `accountInfo`
- `token`
- `cookie`

## 版本信息
- 依赖: Pinia ^2.0.0
- 兼容: Vue 3 + UniApp
- 最后更新: 2024年
