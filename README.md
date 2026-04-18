# SpecCoding Template

[![License: MIT](https://img.shields.io/github/license/beautifulSoup/speccoding-template?style=flat-square&color=blue)](./LICENSE)
[![GitHub Stars](https://img.shields.io/github/stars/beautifulSoup/speccoding-template?style=flat-square&logo=github&color=yellow)](https://github.com/beautifulSoup/speccoding-template/stargazers)
[![GitHub Forks](https://img.shields.io/github/forks/beautifulSoup/speccoding-template?style=flat-square&logo=github&color=orange)](https://github.com/beautifulSoup/speccoding-template/network/members)
[![Last Commit](https://img.shields.io/github/last-commit/beautifulSoup/speccoding-template?style=flat-square&color=green)](https://github.com/beautifulSoup/speccoding-template/commits/main)
[![Template](https://img.shields.io/badge/use%20this-template-brightgreen?style=flat-square&logo=github)](https://github.com/beautifulSoup/speccoding-template/generate)

**基于 Claude Code + OpenSpec + Superpowers 三件套的全栈 AI 开发模板。**

> 让 AI 稳定交付全栈项目——告别"AI 改崩代码 / 失忆 / 跑偏"。

<p align="center">
  <img src="./docs/wechat-qr.jpg" width="180" alt="微信公众号二维码" />
  <br>
  <sub>📣 扫码关注公众号 <b>TangoAI实验室</b>，每周更新 AI 开发实战干货</sub>
</p>

---

## 这是什么

一套**可直接 Clone 即用**的项目骨架，实现文章《让 AI 稳定交付全栈项目》里讲的完整工作流：

- ✅ **两级 Spec 体系**：`spec/` 管项目全局，`openspec/` 管单次变更
- ✅ **七阶段工作流**：`git branch → scaffold → brainstorm → plan → execute → archive → merge`
- ✅ **三工具协同**：Claude Code 执行、OpenSpec 规格、Superpowers 流程
- ✅ **全栈骨架**：预留 backend / frontend / prototype 目录
- ✅ **示例变更**：`openspec/changes/archive/` 里附一个完整示例，可直接照抄

---

## 快速开始

### 1. 使用本模板

**方式 A：GitHub「Use this template」** — 推荐，创建一个干净的新仓库

**方式 B：Clone 后去掉历史**

```bash
git clone https://github.com/beautifulSoup/speccoding-template.git my-project
cd my-project
rm -rf .git
git init && git add -A && git commit -m "chore: bootstrap from SpecCoding template"
```

### 2. 安装前置工具

```bash
# OpenSpec 中文版（核心规格管理工具）
npm install -g @openspec-cn/cli

# Claude Code
npm install -g @anthropic-ai/claude-code

# Superpowers skills（让 /superpowers:brainstorming 等命令可用）
# 安装方式详见 Superpowers 项目文档
```

### 3. 定全局 Spec（Phase 0）

按顺序填写：

1. **`spec/requirements.md`** — 项目要做什么、解决什么问题
2. **`spec/design.md`** — 技术栈、模块划分、数据模型、关键接口
3. **`spec/tasks.md`** — 把项目拆成 10~30 个里程碑任务

> 💡 这一步是 **人工主导 + AI 辅助**。让 AI 帮你梳理初稿，但最终架构决策必须你自己定。

### 4. 单任务开发循环（Phase 1~N）

每个 `tasks.md` 里的任务，走一次完整七阶段工作流：

```bash
# 1. 创建特性分支
git checkout -b feature/add-user-auth

# 2. 脚手架
openspec-cn new change "add-user-auth"

# 3. 设计 —— Claude Code 中运行
/superpowers:brainstorming
# → 产出 proposal.md / design.md / specs/ 写入 openspec/changes/add-user-auth/

# 4. 计划
/superpowers:writing-plans
# → 产出的 plan.md 必须落到 openspec/changes/add-user-auth/plan.md
#   ⚠️ 不要让它散落到仓库根或其他位置

# 5. 执行
/superpowers:executing-plans
# → 严格按 openspec/changes/add-user-auth/plan.md 执行

# 6. 归档
/opsx:archive
# → 整个 add-user-auth/ 目录移入 openspec/changes/archive/

# 7. 合并
git checkout main
git merge feature/add-user-auth
git branch -d feature/add-user-auth
```

完成后 `spec/tasks.md` 里对应任务的完成状态由 AI 自动勾选，`spec/devlog.md` 自动追加一条记录。

> **⚠️ 产出物归属铁律**：单次变更的所有产出物（proposal / design / specs / **plan** / tasks）必须统一放在 `openspec/changes/<name>/` 下，**不可散落**。这是"一键归档、可审计、可回滚"的前提。

---

## 目录结构

```
.
├── CLAUDE.md              # Claude Code 工作指引（重要，勿删）
├── README.md              # 本文件
├── .gitignore             # 全栈通用 ignore
│
├── spec/                  # 【项目级】spec 文档（人工主导）
│   ├── requirements.md    #   整体需求
│   ├── design.md          #   整体架构与设计
│   ├── tasks.md           #   里程碑级任务清单
│   ├── devlog.md          #   开发日志（AI 自动维护）
│   └── structure.md       #   目录结构说明
│
├── openspec/              # 【需求级】单次变更 spec
│   ├── config.yaml        #   OpenSpec 配置
│   ├── changes/
│   │   └── archive/       #   已完成的变更归档（附示例）
│   └── specs/             #   单独提炼的长期规格
│
├── .claude/               # Claude Code 配置、命令与技能
│   ├── commands/opsx/     #   /opsx:apply /opsx:archive 等斜杠命令
│   └── skills/            #   OpenSpec 相关技能
│
├── .codebuddy/            # CodeBuddy 配置（若使用 CodeBuddy 国际版）
│
├── backend/               # 后端代码（待填）
├── frontend/              # 前端代码（待填）
└── prototype/             # 原型设计（待填）
```

---

## 核心原则

### 1. Spec 必须分两级

| 层级 | 位置 | 回答的问题 | 变更频率 |
|------|------|-----------|---------|
| 项目级 | `spec/` | "我们做什么产品、为什么做" | 低频，人工主导 |
| 需求级 | `openspec/changes/<name>/` | "这次变更做什么、怎么做" | 高频，AI 产出 |

**混在一起是灾难的开始**——单次变更细节会污染全局设计，全局决策会被埋在 PR 里。

### 2. 谁写谁改

| 文档 | 作者 | AI 能否擅自动 |
|------|------|--------------|
| `spec/requirements.md` | 人工 | ❌ 仅人工明确要求时 |
| `spec/design.md` | 人工 | ❌ 仅人工明确要求时 |
| `spec/tasks.md` 内容 | 人工 | ❌ 仅人工明确要求时 |
| `spec/tasks.md` 状态 | AI | ✅ 归档后自动勾选 |
| `spec/devlog.md` | AI | ✅ 每次合并后追加 |
| `openspec/changes/*` | AI 产出 + 人工审阅 | ✅ 工作流中自动生成 |

### 3. 物理上分开"思考 / 规划 / 执行"

- **brainstorming** 只产出设计文档（proposal / design / specs），**不碰代码**
- **writing-plans** 只产出 `plan.md`，**不碰代码**
- **executing-plans** 才动代码，而且必须严格按 `plan.md` 执行

这是对抗 AI 失忆的物理防线——即使某一步 AI 上下文全丢，下一步也能从磁盘上的 spec 文档重新加载继续。

### 4. 单次变更产出物归一

所有单次变更产出物必须统一放在 `openspec/changes/<name>/` 下：

```
openspec/changes/add-user-auth/
├── proposal.md        ← brainstorming 产出
├── design.md          ← brainstorming 产出
├── specs/auth/spec.md ← brainstorming 产出
├── plan.md            ← writing-plans 产出（⚠️ 必须落这里）
└── tasks.md           ← 贯穿全流程的任务清单
```

不要让 `plan.md` 散落到仓库根、`docs/`、`.claude/` 或任何其他位置——**归档 / 审计 / 回滚**都依赖这个归一原则。

---

## 示例变更：照着抄就行

`openspec/changes/archive/example-add-user-auth/` 里存了一个**完整的示例变更**，包含：

- `proposal.md` — 变更提案
- `design.md` — 技术方案
- `specs/auth/spec.md` — 场景式规格
- `plan.md` — writing-plans 生成的详细实现计划
- `tasks.md` — 实现任务清单

新手第一次用，直接照着这个结构填就行。

---

## 配套文章

本模板是以下文章的配套资源：

> 《让 AI 稳定交付全栈项目：我的 Claude Code + OpenSpec + Superpowers 三件套实战》

完整方法论、踩坑细节、更多案例请见文章原文。

### 持续更新跟进

<table>
  <tr>
    <td align="center" width="220">
      <img src="./docs/wechat-qr.jpg" width="180" alt="公众号二维码" />
    </td>
    <td>
      <h4>📣 公众号：TangoAI实验室</h4>
      <p>
        • 每周更新一篇 AI 开发实战硬核干货<br>
        • 本模板的后续演进与踩坑记录会第一时间同步<br>
        • 后台回复 <code>spec</code> 可拿到本仓库最新入口 + 资源清单
      </p>
    </td>
  </tr>
</table>

---

## License

MIT
