# Wahaha Socks

`Wahaha Socks` 是一个面向移动端的丝袜/裤袜商品记录应用，用于整理、查看和管理个人商品收藏。

项目采用 Web 技术栈开发，并通过 Capacitor 同步到 Android 工程，支持以接近原生应用的方式在手机上使用。

## 软件详情

### 核心功能
- 商品卡片首页展示，便于快速浏览收藏内容
- 按厚度、材质、裆型筛选商品
- 添加和编辑商品信息，包括品牌、货号、链接、备注等字段
- 支持上传多张包装图片，并可调整主图顺序
- 商品详情页支持查看完整信息与图片轮播
- 支持商品数据导入与导出

### 使用场景
- 个人丝袜/裤袜商品整理
- 收藏记录与对比
- 购买信息归档
- 长期维护个人商品数据库

### 平台支持
- Web
- Android（通过 Capacitor 同步）

## 技术栈
- React
- TypeScript
- Vite
- Tailwind CSS
- Framer Motion
- Zustand
- React Hook Form
- Zod
- Capacitor
- Vaul

## 本地开发

### 安装依赖
```bash
npm install
```

### 启动开发环境
```bash
npm run dev
```

### 构建项目
```bash
npm run build
```

### 同步 Android 工程
```bash
npm run android
```

## 数据与后端

当前项目代码中包含 Supabase 相关依赖与初始化方向，但当前主要使用本地数据流完成商品管理体验。

如果你希望接入 Supabase，可按以下方式准备环境变量：

```env
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

如需数据库结构，可参考 `supabase/migrations/20240204000000_init_schema.sql`。

## 项目特点
- 移动端优先的页面布局
- 接近原生应用的页面切换体验
- 支持 Android Studio 同步与打包
- 表单录入和图片管理流程简洁直接

## 自动更新

- 首页右上角菜单中提供 `更新应用` 按钮
- 应用会从 GitHub 最新 Release 检查新版本
- 如果存在更新，会下载命名为 `wahaha-release-x.y.z.apk` 的安装包并触发系统安装

注意事项：
- Android 覆盖安装要求新旧版本使用同一签名证书
- 若未使用同一 keystore 签名，系统可能无法直接覆盖升级

## 自动发布

项目已包含 GitHub Actions 自动发布流程：

- 工作流文件：`.github/workflows/release.yml`
- 触发方式：
  - 推送到 `main`
  - 手动触发 `workflow_dispatch`
- 发布内容：
  - 自动递增版本号
  - 自动构建 Android Release APK
  - 自动上传 GitHub Release
  - 产物文件名格式：`wahaha-release-x.y.z.apk`

### 版本规则
- 当前仓库版本起点已调整为 `1.0.0`
- 自动发布时会先递增版本号，因此首个自动发布版本将从 `1.0.1` 开始

### GitHub Secrets

如需稳定生成可覆盖安装的正式 APK，请在 GitHub 仓库配置以下 Secrets：

- `ANDROID_KEYSTORE_BASE64`
- `ANDROID_KEYSTORE_PASSWORD`
- `ANDROID_KEY_ALIAS`
- `ANDROID_KEY_PASSWORD`

## 开源协议

本项目基于 `MIT` 协议开源，详见 `LICENSE` 文件。
