# Backend — User Authentication Service

基于 Express 5 + TypeScript + SQLite 的用户认证后端服务。

## 技术栈

- **框架**: Express 5
- **语言**: TypeScript (ESM)
- **数据库**: SQLite (better-sqlite3)
- **密码哈希**: bcryptjs (cost=12)
- **Token**: JWT (jsonwebtoken)
- **校验**: Zod
- **测试**: Vitest + Supertest

## 快速开始

```bash
# 安装依赖
npm install

# 设置环境变量
cp .env.example .env
# 编辑 .env，设置 JWT_SECRET

# 运行数据库迁移
npm run migrate:up

# 启动开发服务器
npm run dev

# 运行测试
npm test
```

## API 接口

| 方法 | 路径 | 描述 | 鉴权 |
|------|------|------|------|
| POST | `/api/auth/register` | 用户注册 | 无 |
| POST | `/api/auth/login` | 用户登录 | 无 |
| POST | `/api/auth/refresh` | 刷新 Token | Cookie |
| GET | `/api/me` | 获取当前用户信息 | Bearer Token |
| GET | `/api/health` | 健康检查 | 无 |

## 环境变量

| 变量 | 必须 | 说明 |
|------|------|------|
| `JWT_SECRET` | ✅ | JWT 签名密钥（启动时校验非空） |
| `PORT` | ❌ | 监听端口，默认 3000 |
| `NODE_ENV` | ❌ | 环境标识，production 时 Cookie 启用 Secure |

## 项目结构

```
backend/
├── src/
│   ├── db/                    # 数据库相关
│   │   ├── database.ts        # SQLite 连接管理
│   │   ├── migrate.ts         # 迁移执行器
│   │   └── migrations/        # SQL 迁移脚本
│   ├── errors/                # 自定义错误类
│   │   └── auth.errors.ts
│   ├── middleware/             # Express 中间件
│   │   ├── error-handler.ts   # 统一错误处理
│   │   ├── rate-limit.ts      # 登录限流
│   │   └── require-auth.ts    # JWT 鉴权
│   ├── models/                # 数据模型
│   │   └── user.model.ts
│   ├── repositories/          # 数据访问层
│   │   ├── blacklist.repository.ts
│   │   └── user.repository.ts
│   ├── routes/                # HTTP 路由
│   │   └── auth.routes.ts
│   ├── services/              # 业务服务层
│   │   └── auth.service.ts
│   ├── tests/                 # 测试文件
│   │   ├── setup.ts
│   │   └── auth.integration.test.ts
│   ├── utils/                 # 工具函数
│   │   ├── jwt.ts
│   │   └── password.ts
│   ├── validators/            # 输入校验
│   │   └── auth.validators.ts
│   ├── app.ts                 # Express 应用工厂
│   └── index.ts               # 主入口
├── package.json
├── tsconfig.json
└── vitest.config.ts
```
