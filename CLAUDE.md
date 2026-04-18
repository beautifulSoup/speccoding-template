# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概览

这是一个 **SpecCoding 全栈开发模板**，基于 Claude Code + OpenSpec + Superpowers 三件套工作流。

- `backend/` — 后端服务（技术栈自选）
- `frontend/` — 前端（Web / H5 / App 皆可）
- `prototype/` — 原型设计稿
- `spec/` — **项目级** spec 文档（整体需求/设计/结构/进度）
- `openspec/` — **需求级** spec 文档（由 OpenSpec 管理的单个变更）

项目结构详见 `spec/structure.md`。

**使用方式**：克隆本仓库后，先填 `spec/requirements.md` 和 `spec/design.md` 定全局，再在 `spec/tasks.md` 拆任务，之后每个任务走一次「七阶段工作流」（见下文）。

## Spec 文档两级体系

不要混淆这两层：

| 层级 | 位置 | 作用 | 何时读写 |
|------|------|------|----------|
| 项目级 | `spec/` | 整体需求、设计、任务清单、开发日志、项目结构 | 见下方「项目级 spec 文档」章节 |
| 需求级 | `openspec/changes/<name>/` | 单个变更的提案、设计、规格、任务 | 进入 OpenSpec 工作流的特定阶段时读取/修改 |

### 项目级 spec 文档（`spec/`）

| 文件 | 作用 | 何时维护 |
|------|------|----------|
| `requirements.md` | 项目整体需求 | **仅在人工明确要求时**才修改，不要自作主张更新 |
| `design.md` | 项目整体设计、架构决策 | **仅在人工明确要求时**才修改 |
| `tasks.md` | 项目级任务清单（里程碑级，每个 task 对应一个 openspec 提案） | 任务**内容**除非人工要求否则不动；任务**完成状态**由 AI 在对应 openspec 归档后自动勾选 |
| `devlog.md` | 开发日志 | **每次 PR 合并后**追加一条记录（变更摘要、关键决策） |
| `structure.md` | 项目目录结构 | **添加或删除顶层目录时**更新 |

**开始工作前**，先读取 `spec/` 下的文件以理解项目全局；动笔修改前，核对上表中的触发条件，避免越权改动。

## 开发工作流（严格按此流程）

```
git branch → openspec scaffold → brainstorming → writing-plans → executing-plans → openspec archive → git merge
```

| 阶段 | 工具 | 说明 |
|------|------|------|
| 1. 创建分支 | `git checkout -b feature/<name>` | 每个变更在独立分支上开发 |
| 2. 脚手架 | `openspec-cn new change "<name>"` | 只创建变更目录和 `.openspec.yaml`，不填内容 |
| 3. 设计 | `/superpowers:brainstorming` | 探索设计，产出写入 `openspec/changes/<name>/`（proposal.md、design.md、specs/、tasks.md） |
| 4. 制定计划 | `/superpowers:writing-plans` | **产出的 plan.md 必须写入 `openspec/changes/<name>/plan.md`**，与同变更的 proposal / design / specs / tasks 放在同一目录下，**不要**散落到仓库根或其他位置 |
| 5. 执行 | `/superpowers:executing-plans` | 严格按 `openspec/changes/<name>/plan.md` 执行代码变更 |
| 6. 归档 | `/opsx:archive` | 变更移入 `openspec/changes/archive/` |
| 7. 合并代码 | `git merge feature/<name>` | 合并回主分支，删除特性分支 |

## OpenSpec 变更管理

**每个变更的所有产出物必须统一存放在 `openspec/changes/<name>/` 目录下**，禁止散落到仓库其他位置：

- `proposal.md` — 是什么、为什么
- `design.md` — 如何做、架构决策、风险权衡
- `specs/<feature>/spec.md` — 需求规格（场景式）
- `plan.md` — 由 `/superpowers:writing-plans` 生成的详细实现计划（**必须落在本目录**）
- `tasks.md` — 实现任务清单（checkable）

相关命令：
- `openspec-cn new change "<name>"` — 创建变更目录
- `/opsx:apply` — 实施变更
- `/opsx:archive` — 归档变更
