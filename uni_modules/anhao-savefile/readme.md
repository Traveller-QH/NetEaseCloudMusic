# anhao-savefile

远程文件下载并保存到系统目录的 UTS 插件，支持 **Android / iOS / HarmonyOS** 三端。

---

## 平台支持

| 平台 | 最低版本 | 保存位置 | 说明 |
|------|----------|----------|------|
| Android | API 21（Android 5.0） | 系统下载目录 | Android 10+ 使用 MediaStore，无需权限；Android 9- 直接写文件，需声明存储权限 |
| iOS | iOS 12 | App Documents 目录 | 下载后自动弹出系统分享面板，用户可选"存储到文件" |
| HarmonyOS | HarmonyOS Next | 用户选择位置 | 使用系统 DocumentViewPicker 让用户选择保存路径 |

---

## 安装

将插件目录 `anhao-savefile` 放入项目的 `uni_modules/` 目录下即可。

---

## 权限配置

**Android 9 及以下**（API ≤ 28）需在项目 `manifest.json` 的 `app-android.distribute.permissions` 中添加存储权限：

```json
"permissions": [
  "<uses-permission android:name=\"android.permission.WRITE_EXTERNAL_STORAGE\" android:maxSdkVersion=\"28\"/>",
  "<uses-permission android:name=\"android.permission.READ_EXTERNAL_STORAGE\"/>"
]
```

> Android 10+、iOS、HarmonyOS 无需额外权限声明。

---

## API

### `saveRemoteFile(options)`

下载远程文件并保存到系统目录。

#### 参数 `options`

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `url` | `string` | 是 | 远程文件 URL |
| `saveName` | `string` | 否 | 保存的文件名（含扩展名）。不填则自动从 URL 中提取 |
| `success` | `(path: string) => void` | 否 | 成功回调，参数为文件保存的本地路径 |
| `fail` | `(msg: string) => void` | 否 | 失败回调，参数为错误描述文字 |

#### 说明

- 文件名重复时（Android 9-），自动追加序号：`test.pdf` → `test(1).pdf` → `test(2).pdf`
- `saveName` 为空时从 URL 最后一段提取文件名，并去掉 query string
- MIME 类型根据文件扩展名自动推断，支持 pdf / doc / xls / jpg / png / mp4 / mp3 / zip / txt 等常见格式

---

## 使用示例

### 基础用法

```typescript
import { saveRemoteFile } from '@/uni_modules/anhao-savefile'

saveRemoteFile({
  url: 'https://example.com/files/report.pdf',
  success: (path : string) => {
    console.log('保存成功：', path)
    uni.showToast({ title: '保存成功', icon: 'success' })
  },
  fail: (msg : string) => {
    console.error('保存失败：', msg)
    uni.showToast({ title: msg, icon: 'none' })
  }
})
```

### 指定文件名

```typescript
import { saveRemoteFile } from '@/uni_modules/anhao-savefile'

saveRemoteFile({
  url: 'https://example.com/api/invoice/download?id=12345',
  saveName: '发票_20250228.pdf',   // 不填则从 URL 提取，此处 URL 无法提取有效名称，建议填写
  success: (path : string) => {
    uni.showToast({ title: '已保存至：' + path, icon: 'none' })
  },
  fail: (msg : string) => {
    uni.showToast({ title: msg, icon: 'none' })
  }
})
```

### 在页面中结合 loading 状态使用

```vue
<template>
  <view>
    <button :disabled="saving" @click="onSave">
      {{ saving ? '保存中...' : '下载并保存' }}
    </button>
    <text v-if="result">{{ result }}</text>
  </view>
</template>

<script setup lang="uts">
  import { saveRemoteFile } from '@/uni_modules/anhao-savefile'

  const saving = ref(false)
  const result = ref('')

  function onSave() {
    if (saving.value) return
    saving.value = true
    result.value = ''

    saveRemoteFile({
      url: 'https://example.com/files/document.pdf',
      saveName: 'document.pdf',
      success: (path : string) => {
        saving.value = false
        result.value = '已保存：' + path
      },
      fail: (msg : string) => {
        saving.value = false
        result.value = '失败：' + msg
      }
    })
  }
</script>
```

---

## 各平台行为差异

### Android

- **Android 10+（API ≥ 29）**：通过 MediaStore API 写入系统下载目录，无需任何存储权限，文件保存后在系统"文件管理器 → 下载"中可见
- **Android 9-（API ≤ 28）**：直接写入 `/storage/emulated/0/Download/`，需提前在 manifest 声明 `WRITE_EXTERNAL_STORAGE` 权限；文件同名时自动追加序号

### iOS

1. `uni.downloadFile` 下载到临时目录
2. 复制到 App 的 Documents 目录（持久化）
3. 自动弹出系统分享/操作面板（`UIActivityViewController`）
4. 用户在面板中点击**"存储到文件"**可将文件保存到 iCloud Drive 或本机"文件" App

> iPad 已自动处理 Popover，不会崩溃。

### HarmonyOS

1. 首先弹出系统文件选择器（`DocumentViewPicker`），由用户指定保存路径
2. 使用 HTTP 模块下载文件内容
3. 写入用户选择的路径

> 用户取消选择时，`fail` 回调返回 `'用户取消保存'`。

---

## 支持的文件类型（MIME 推断）

| 扩展名 | MIME 类型 |
|--------|-----------|
| .pdf | application/pdf |
| .doc / .docx | application/msword / openxmlformats |
| .xls / .xlsx | application/vnd.ms-excel / openxmlformats |
| .jpg / .jpeg | image/jpeg |
| .png | image/png |
| .gif | image/gif |
| .mp4 | video/mp4 |
| .mp3 | audio/mpeg |
| .zip | application/zip |
| .txt | text/plain |
| 其他 | application/octet-stream |
