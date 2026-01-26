# UI/UX 优化计划

> 基于设计师深度诊断的循序渐进优化方案

## 优化目标

将 Ontology Architect 从"能用"提升到"想用"的专业级体验。

---

## Phase 1: 基础修复（立即执行）

### 1.1 色彩对比度修复

**问题**: `text-gray-600` (#525252) 在暗色背景上对比度仅 3.2:1，不符合 WCAG AA 标准。

**修复**:
- [ ] 将 `--color-text-secondary` 从 #a3a3a3 调整为 #9ca3af (对比度 4.6:1)
- [ ] 将 `--color-text-muted` 从 #525252 调整为 #6b7280 (对比度 5.3:1)
- [ ] 全局替换 `text-gray-600` 为 `text-gray-500`
- [ ] 全局替换 `text-gray-500` 为 `text-gray-400`（在需要更高可见度的地方）

**文件**: `index.css`

---

### 1.2 字体层级统一

**问题**: 字体大小混乱（text-xl, text-lg, text-base, text-sm, text-xs, text-[10px], text-[9px]）

**修复**:
- [ ] 定义标准字体层级类
  - `.text-display`: 24px - 页面标题
  - `.text-heading`: 18px - 组件标题
  - `.text-body`: 14px - 正文
  - `.text-caption`: 12px - 说明文字
  - `.text-micro`: 11px - 标签（替代 10px）
- [ ] 消除所有 `text-[10px]` 和 `text-[9px]`，统一使用 `text-micro`

**文件**: `index.css`, 所有组件文件

---

### 1.3 交互反馈增强

**问题**: 输入框 focus、按钮点击、消息 hover 缺乏明显反馈

**修复**:
- [ ] 增强 `.glass-surface:focus-within` 效果（添加 glow）
- [ ] 增强 `.btn-gradient:active` 效果（scale + opacity）
- [ ] 为消息气泡添加 hover 微交互
- [ ] 为卡片添加 hover 提升效果

**文件**: `index.css`, `ChatInterface.tsx`

---

## Phase 2: 组件标准化（Week 1-2）

### 2.1 创建 Card 组件

**目标**: 统一所有卡片样式，消除重复代码

```tsx
// components/ui/Card.tsx
interface CardProps {
  variant?: 'flat' | 'elevated' | 'bordered';
  padding?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
}
```

- [ ] 创建 `components/ui/Card.tsx`
- [ ] 重构 `OntologyVisualizer.tsx` 使用 Card
- [ ] 重构 `Academy.tsx` 使用 Card
- [ ] 重构 `ArchetypeViewer.tsx` 使用 Card

---

### 2.2 创建 Input 组件

**目标**: 统一表单输入样式

- [ ] 创建 `components/ui/Input.tsx`
- [ ] 创建 `components/ui/Select.tsx`
- [ ] 创建 `components/ui/Textarea.tsx`
- [ ] 重构 `ActionDesigner.tsx` 使用统一组件
- [ ] 重构 `ChatInterface.tsx` 使用统一组件

---

### 2.3 创建 Button 组件

**目标**: 统一按钮样式和状态

```tsx
// components/ui/Button.tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}
```

- [ ] 创建 `components/ui/Button.tsx`
- [ ] 定义按钮变体样式
- [ ] 添加加载状态
- [ ] 全局替换所有按钮

---

## Phase 3: 布局优化（Week 2-3）

### 3.1 可折叠 Sidebar

**目标**: 优化空间利用，支持 Rail 模式

- [ ] 添加 sidebar 折叠状态
- [ ] 折叠时只显示图标 (48px)
- [ ] 展开时显示完整内容 (256px)
- [ ] 添加平滑过渡动画
- [ ] 记住用户偏好 (localStorage)

**文件**: `App.tsx`

---

### 3.2 响应式优化

**目标**: 在各种屏幕尺寸下都有良好体验

- [ ] 添加响应式断点处理
- [ ] 小屏幕自动折叠 sidebar
- [ ] 中屏幕优化面板宽度
- [ ] 大屏幕最大化内容区

---

### 3.3 ActionDesigner 分屏优化

**目标**: 可调整的分屏布局

- [ ] 添加可拖拽分割线
- [ ] 记住用户偏好宽度
- [ ] 设置最小宽度限制

---

## Phase 4: 加载与动画（Week 3）

### 4.1 Skeleton Loading

**目标**: 替换简单 spinner 为 skeleton 加载

- [ ] 创建 `components/ui/Skeleton.tsx`
- [ ] 为消息加载添加 skeleton
- [ ] 为卡片列表添加 skeleton
- [ ] 为表格/列表添加 skeleton

---

### 4.2 页面过渡动画

**目标**: 平滑的页面切换体验

- [ ] 添加 Tab 内容切换动画
- [ ] 添加面板滑入/滑出动画
- [ ] 添加模态框出现动画

---

## Phase 5: 高级功能（Week 4+）

### 5.1 Command Palette（可选）

**目标**: 快捷键导航

- [ ] 创建 `components/CommandPalette.tsx`
- [ ] 实现 `⌘+K` 快捷键
- [ ] 支持搜索 Objects、Actions
- [ ] 支持快速导航

---

### 5.2 主题切换（可选）

**目标**: 支持浅色主题

- [ ] 定义浅色主题变量
- [ ] 添加主题切换按钮
- [ ] 记住用户偏好

---

## 实施检查清单

### Phase 1 完成标准
- [ ] 所有文字对比度 ≥ 4.5:1
- [ ] 无任何 10px 以下字体
- [ ] 所有交互元素有明确反馈

### Phase 2 完成标准
- [ ] 建立 components/ui 目录
- [ ] 所有卡片使用 Card 组件
- [ ] 所有按钮使用 Button 组件
- [ ] 所有输入使用 Input/Select/Textarea 组件

### Phase 3 完成标准
- [ ] Sidebar 支持折叠
- [ ] 在 1366px 屏幕上体验良好
- [ ] 在 1920px 屏幕上体验良好

### Phase 4 完成标准
- [ ] 所有加载状态使用 Skeleton
- [ ] 页面切换有平滑过渡

---

## 变更记录

| 日期 | Phase | 变更内容 | 状态 |
|------|-------|---------|------|
| 2026-01-26 | - | 创建优化计划文档 | ✅ |
| 2026-01-26 | 1.1 | 色彩对比度修复 - WCAG AA compliant | ✅ |
| 2026-01-26 | 1.2 | 字体层级统一 - 添加 text-micro 等类 | ✅ |
| 2026-01-26 | 1.3 | 交互反馈增强 - skeleton, hover, focus | ✅ |
| 2026-01-26 | 2.1 | 创建 Card 组件 (Card, CardHeader, etc.) | ✅ |
| 2026-01-26 | 2.2 | 创建 Input 组件 (Input, Textarea, Select, Checkbox) | ✅ |
| 2026-01-26 | 2.3 | 创建 Button 组件 (Button, IconButton) | ✅ |
