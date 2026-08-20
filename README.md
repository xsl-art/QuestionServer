# 问卷星低代码平台 - 服务端

基于 NestJS + TypeScript + MongoDB 构建的问卷系统后端服务。

## 技术栈

- **框架**: NestJS 11
- **语言**: TypeScript 5
- **数据库**: MongoDB + Mongoose 9
- **认证**: JWT + @nestjs/jwt
- **配置**: @nestjs/config
- **工具库**: nanoid, rxjs

## 项目结构

```
src/
├── app.module.ts         # 根模块
├── main.ts               # 入口文件
├── auth/                 # 认证模块
│   ├── auth.controller.ts    # 认证控制器
│   ├── auth.service.ts       # 认证服务
│   ├── auth.module.ts        # 认证模块定义
│   └── jwt.strategy.ts       # JWT策略
├── user/                 # 用户模块
│   ├── user.controller.ts    # 用户控制器
│   ├── user.service.ts       # 用户服务
│   ├── user.module.ts        # 用户模块定义
│   └── schemas/
│       └── user.schema.ts    # 用户数据模型
├── question/             # 问卷模块
│   ├── question.controller.ts    # 问卷控制器
│   ├── question.service.ts       # 问卷服务
│   ├── question.module.ts        # 问卷模块定义
│   └── schemas/
│       └── question.schema.ts    # 问卷数据模型
├── answer/               # 答卷模块
│   ├── answer.controller.ts    # 答卷控制器
│   ├── answer.service.ts       # 答卷服务
│   ├── answer.module.ts        # 答卷模块定义
│   └── schemas/
│       └── answer.schema.ts    # 答卷数据模型
├── stat/                 # 统计模块
│   ├── stat.controller.ts    # 统计控制器
│   ├── stat.service.ts       # 统计服务
│   └── stat.module.ts        # 统计模块定义
└── upload/               # 上传模块
    ├── upload.controller.ts    # 上传控制器
    ├── upload.service.ts       # 上传服务
    └── upload.module.ts        # 上传模块定义
```

## 核心功能

### 用户认证

- 用户注册
- 用户登录
- JWT Token 认证

### 问卷管理

- 创建问卷
- 编辑问卷
- 删除问卷
- 问卷列表（分页、搜索）
- 标星/取消标星
- 回收站（软删除、恢复）
- 复制问卷

### 答卷管理

- 提交答卷
- 查询答卷列表
- 获取单份答卷详情

### 数据统计

- 问卷答卷数量统计
- 单选题选项统计
- 多选题选项统计
- 文本题答案列表

### 文件上传

- 图片上传
- 文件存储

## 开发脚本

```bash
# 安装依赖
pnpm install

# 启动开发服务器（热重载）
pnpm run start:dev

# 启动生产服务器
pnpm run start:prod

# 构建项目
pnpm run build

# 代码检查
pnpm run lint

# 代码格式化
pnpm run format

# 运行单元测试
pnpm run test

# 运行测试覆盖率
pnpm run test:cov

```
