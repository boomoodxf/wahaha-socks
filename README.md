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

## 开源协议

本项目基于 `MIT` 协议开源，详见 `LICENSE` 文件。
