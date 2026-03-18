# Git Convention

本项目的 Git 提交与推送规范。所有 commit 和 push 必须遵循此文档。

## Commit Message 格式

采用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```
<type>(<scope>): <subject>

[body]

[footer]
```

### Type（必选）

| Type | 用途 | 示例 |
|------|------|------|
| `feat` | 新功能 | `feat(readiness): add phase progress tracking` |
| `fix` | Bug 修复 | `fix(i18n): data access fallback for unsupported languages` |
| `refactor` | 重构（不改变外部行为） | `refactor(quality): consolidate redundant computations` |
| `docs` | 仅文档变更 | `docs: update CLAUDE.md for delivery phase` |
| `chore` | 构建/工具/清理 | `chore: delete obsolete changelog files` |
| `style` | 格式/空白（不影响逻辑） | `style: fix indentation in App.tsx` |
| `test` | 测试相关 | `test: add E2E tests for archetype lazy-loading` |
| `perf` | 性能优化 | `perf: code-split main bundle with dynamic imports` |

### Scope（可选）

限定改动范围，常用 scope：

| Scope | 覆盖范围 |
|-------|----------|
| `i18n` | 国际化、locale 文件 |
| `quality` | 质量检查、readiness |
| `delivery` | Phase 5 交付 |
| `auth` | 认证、用户系统 |
| `ai` | AI 服务、模型调用 |
| `ui` | 通用 UI/UX |
| `chat` | 对话栏、消息 |
| `sync` | 云同步 |
| `backend` | 后端 Fastify/Prisma |

无明确 scope 时可省略括号：`docs: update README`

### Subject（必选）

- 用英文，首字母小写，不加句号
- 祈使语气（add / fix / remove，不是 added / fixes）
- 聚焦 **why** 而非 what —— diff 已经说明了 what
- 控制在 70 字符以内

### Body（推荐）

多行改动或涉及多文件时加 body：

- 用 `—` 分隔主要改动点
- 列出关键决策或 trade-off
- 说明破坏性变更（如有）

### Footer（自动）

Claude Code 生成的 commit 自动附带：

```
Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
```

## 示例

### 单一改动

```
fix(i18n): render all available languages in settings selector
```

### 多文件重构

```
refactor(quality): restructure Review panel — Quality/Readiness split, full i18n

- Split overloaded QualityPanel into focused Quality + Readiness tabs
- Migrate all readiness text to locale keys across 5 languages
- Consolidate redundant qualityReport/threeLayerReport computation from 6→2 calls

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
```

### 清理/维护

```
chore: delete obsolete changelog and security fix docs

Remove 6 files superseded by CHANGELOG.md:
- CHANGE_NOTES.md, RELEASE_NOTES_v0.4.1.md
- SECURITY_FIX_FINAL.md, SECURITY_FIX_SPEC.md, SECURITY_FIX_SUMMARY.md
- lib/readinessChecker.ts (replaced by utils/readinessChecker.ts)
```

## Pre-Push 检查清单

每次 `git push` 前必须确认：

1. **`npm run check` 通过** — 包含 cardinality tests + tsc + build + i18n completeness
2. **文档同步更新**（如改动涉及以下内容）：
   - 功能变更 → `CHANGELOG.md` [Unreleased] section
   - 架构/模式变更 → `CLAUDE.md`
   - 用户可见功能 → `README.md`
3. **无敏感文件** — 不提交 `.env`、credentials、API keys
4. **commit 粒度合理** — 一个 commit 对应一个逻辑改动，避免混装不相关变更

## 分支规范

当前采用 trunk-based（直推 `main`）。如后续引入分支：

| 分支前缀 | 用途 | 示例 |
|----------|------|------|
| `feat/` | 新功能 | `feat/readiness-panel` |
| `fix/` | 修复 | `fix/i18n-fallback` |
| `chore/` | 清理/维护 | `chore/remove-obsolete-docs` |
| `refactor/` | 重构 | `refactor/quality-panel-split` |

## 禁止事项

- **禁止** `--force push` 到 `main`
- **禁止** `--no-verify` 跳过 hooks
- **禁止** commit 含 `console.log` 的调试代码（除非是 intentional logging）
- **禁止** 空 commit（`--allow-empty`）
- **禁止** 单个 commit 混装功能 + 清理 + 文档（应拆分）
