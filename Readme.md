# School-React-Node-PostgreSql

一个基于 React 和 Node.js 的现代化学校管理系统。

## 技术栈

### 前端
- React 18
- TypeScript
- Tailwind CSS
- Radix UI 组件库
- React Query
- Wouter (路由)
- React Hook Form
- Zod (表单验证)

### 后端
- Node.js
- Express
- TypeScript
- Drizzle ORM
- PostgreSQL (Neon Database)
- WebSocket
- Passport.js (认证)

## 功能特性

- 现代化的用户界面
- 响应式设计
- 实时数据更新
- 用户认证和授权
- 数据库集成
- API 集成
- 表单验证
- 主题支持

## 开始使用

### 环境要求

- Node.js 18+
- PostgreSQL 数据库
- npm 或 yarn

### 安装

1. 克隆仓库
```bash
git clone [repository-url]
cd School-React-Node
```

2. 安装依赖
```bash
npm install
```

3. 配置环境变量
创建 `.env` 文件并配置必要的环境变量：
```env
DATABASE_URL=postgresql://用户名:密码@localhost:5432/数据库名
SESSION_SECRET=your_session_secret
```

4. 数据库迁移
```bash
npm run db:push
```

### 开发

启动开发服务器：
```bash
npm run dev
```
服务器将在 http://localhost:5000 启动

### 构建

构建生产版本：
```bash
npm run build
```

### 运行生产版本

```bash
npm start
```

## 项目结构

```
├── client/          # 前端代码
│   ├── components/  # React 组件
│   ├── pages/      # 页面组件
│   ├── hooks/      # 自定义 Hooks
│   ├── utils/      # 工具函数
│   └── styles/     # 样式文件
├── server/          # 后端代码
│   ├── routes/     # API 路由
│   ├── middleware/ # 中间件
│   ├── controllers/# 控制器
│   └── utils/      # 工具函数
├── shared/          # 共享代码
│   ├── types/      # TypeScript 类型定义
│   └── schema.ts   # 数据库模型
├── vite.config.ts   # Vite 配置
├── tsconfig.json    # TypeScript 配置
└── package.json     # 项目依赖
```

## 数据库表结构

系统包含以下主要数据表：
- users（用户表）：存储用户账号信息
- students（学生表）：存储学生信息
- teachers（教师表）：存储教师信息
- classes（课程表）：存储课程信息
- classEnrollments（课程注册表）：学生选课记录
- attendance（考勤表）：学生考勤记录
- grades（成绩表）：学生成绩记录
- events（事件表）：学校事件日历
- activities（活动日志表）：系统操作日志

## 脚本命令

- `npm run dev` - 启动开发服务器
- `npm run build` - 构建生产版本
- `npm start` - 运行生产版本
- `npm run check` - 类型检查
- `npm run db:push` - 数据库迁移

## 开发指南

### 添加新功能
1. 在 `shared/schema.ts` 中定义数据模型
2. 运行 `npm run db:push` 更新数据库
3. 在 `server/routes` 中添加 API 路由
4. 在 `client/components` 中创建前端组件

### 代码规范
- 使用 TypeScript 类型定义
- 遵循 ESLint 规则
- 使用 Prettier 格式化代码
- 编写单元测试

## 常见问题

### 数据库连接问题
- 确保 PostgreSQL 服务正在运行
- 检查数据库连接字符串是否正确
- 验证数据库用户权限

### 开发服务器问题
- 确保端口 5000 未被占用
- 检查环境变量是否正确配置
- 查看控制台错误信息

## 贡献

欢迎提交 Pull Requests 和 Issues。

### 提交规范
- 使用清晰的提交信息
- 遵循现有的代码风格
- 添加必要的测试
- 更新相关文档

## 许可证

MIT

## 联系方式

如有问题，请提交 Issue 或联系项目维护者。
