# Development Log

> **维护规则**：每次 PR 合并后，由 AI 自动追加一条记录。
>
> 每条记录应包含：日期、变更名、摘要、关键决策/坑点。

---

## Entry Template

```markdown
### YYYY-MM-DD · <change-name>

**摘要**：一句话说清楚这次变更做了什么。

**关键决策**：
- 决策点 1 — 选了什么、放弃了什么、为什么
- 决策点 2 — ...

**踩坑 / 经验**：
- 坑点描述 + 如何解决（可选）

**相关产出**：
- 归档位置：`openspec/changes/archive/<change-name>/`
- PR：#xxx（如适用）
```

---

## Log Entries

<!-- 最新条目在最上面 -->

### 2026-04-22 · add-user-auth

**摘要**：实现用户认证系统，包含注册、登录、Token 刷新和鉴权中间件，覆盖 spec 中全部 15 个场景。

**关键决策**：
- JWT 双 Token 模式（Access 15min + Refresh 7d），Access 通过 Header 传递、Refresh 通过 HttpOnly Cookie 传递
- 密码使用 bcryptjs cost=12 哈希，2026 年仍提供足够安全性
- 使用 SQLite (better-sqlite3) 代替 PostgreSQL，降低本地开发复杂度，后续可无缝切换
- Express 5 + TypeScript ESM 模块，express-rate-limit 做登录限流（5 次/分钟/IP）
- rate-limiter 使用工厂函数而非模块级单例，避免测试间状态泄漏

**踩坑 / 经验**：
- uuid v14 在某些环境下 `crypto` 全局变量未定义，改用 `node:crypto.randomUUID()` 解决
- express-rate-limit v8 要求自定义 keyGenerator 使用 ipKeyGenerator 辅助函数处理 IPv6，改为使用默认 keyGenerator
- Express 5 中 throw 在同步中间件中可能不被错误处理器捕获，统一使用 `next(err)` 模式

**相关产出**：
- spec 归档：`openspec/changes/archive/example-add-user-auth/`
- 后端代码：`backend/src/`
- 集成测试：16 个测试全部通过

---

### 2026-04-16 · bootstrap-speccoding-template

**摘要**：从 SpecCoding Template 初始化项目骨架。

**关键决策**：
- 采用「两级 Spec 体系」：`spec/` 管全局、`openspec/` 管单次变更
- 开发工作流固化为七阶段：git branch → scaffold → brainstorm → plan → execute → archive → merge

**相关产出**：
- 项目级 spec 文档骨架（requirements / design / tasks / devlog / structure）
- OpenSpec 配置 + 示例归档变更 `example-add-user-auth`
