# 第三方合同和招标管理平台

一个全面的企业级合同和招标管理解决方案，旨在简化合同管理、招标流程和供应商关系管理。

## 功能特性

- **合同管理**: 完整的合同生命周期管理，包括创建、审批、执行和归档
- **招标管理**: 从发布招标到确定中标的完整招标流程管理
- **供应商管理**: 供应商信息管理、绩效评估和分级
- **审批流程**: 可配置的多级审批系统
- **文档管理**: 安全的合同文档存储和检索
- **分析报告**: 详细的数据分析和可视化报表
- **权限控制**: 基于角色的细粒度权限管理

## 技术架构

### 后端技术栈
- **Node.js** + **Express.js**: Web应用框架
- **PostgreSQL**: 主数据库，支持JSON字段存储复杂数据
- **Sequelize**: ORM工具，支持数据库迁移
- **JWT**: 用户身份验证和授权
- **Redis**: 缓存和会话管理

### 前端技术栈
- **React.js**: 用户界面框架
- **Ant Design**: UI组件库
- **React Router**: 页面路由管理
- **Axios**: HTTP客户端

### 其他技术
- **Docker**: 容器化部署
- **Multer**: 文件上传处理
- **Nodemailer**: 邮件通知服务

## 数据库设计

系统包含以下核心实体：

- **用户表 (Users)**: 系统用户信息和权限管理
- **合同表 (Contracts)**: 合同基本信息和状态跟踪
- **招标表 (Tenders)**: 招标项目和流程管理
- **供应商表 (Vendors)**: 供应商信息和评价
- **投标表 (Bids)**: 供应商投标信息
- **审批流程表 (ApprovalWorkflows)**: 多级审批跟踪
- **审批阶段表 (ApprovalStages)**: 审批具体环节

## 安装和运行

### 前提条件
- Node.js (v16或更高版本)
- PostgreSQL
- Docker (可选，用于容器化部署)

### 快速开始

1. **克隆项目**
```bash
git clone <your-repository-url>
cd third-party-contract-tender-platform
```

2. **安装后端依赖**
```bash
npm install
```

3. **进入前端目录并安装依赖**
```bash
cd client
npm install
```
回到根目录：
```bash
cd ..
```

4. **配置环境变量**
复制 `.env.example` 创建 `.env` 文件并填入相应配置：
```bash
cp .env.example .env
```

5. **设置数据库**
确保已安装并启动PostgreSQL，然后运行迁移：
```bash
node migrate.js
```

6. **启动后端服务器**
```bash
npm start
```

7. **在另一个终端启动前端开发服务器**
```bash
cd client
npm start
```

服务器将在 `http://localhost:3000` 运行前端，在 `http://localhost:3001` 运行后端API。

## API接口

### 认证
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/profile` - 获取用户资料

### 合同管理
- `GET /api/contracts` - 获取合同列表
- `POST /api/contracts` - 创建新合同
- `GET /api/contracts/:id` - 获取特定合同
- `PUT /api/contracts/:id` - 更新合同
- `DELETE /api/contracts/:id` - 删除合同

### 招标管理
- `GET /api/tenders` - 获取招标列表
- `POST /api/tenders` - 创建新招标
- `POST /api/tenders/:id/publish` - 发布招标
- `POST /api/tenders/:id/close` - 关闭招标

### 供应商管理
- `GET /api/vendors` - 获取供应商列表
- `POST /api/vendors` - 创建新供应商
- `PUT /api/vendors/:id` - 更新供应商信息

### 投标管理
- `GET /api/bids` - 获取投标列表
- `POST /api/bids` - 提交投标
- `POST /api/bids/:id/review` - 评审投标

## 项目结构

```
workspace/
├── src/                    # 后端源代码
│   ├── controllers/        # 控制器
│   ├── models/            # 数据模型
│   ├── routes/            # 路由定义
│   ├── middleware/        # 中间件
│   ├── services/          # 业务逻辑服务
│   └── config/            # 配置文件
├── client/                # 前端源代码
│   ├── src/
│   │   ├── components/    # React组件
│   │   ├── pages/         # 页面组件
│   │   ├── utils/         # 工具函数
│   │   └── styles/        # 样式文件
├── __tests__/             # 测试文件
├── docker-compose.yml     # Docker配置
├── Dockerfile             # 容器配置
├── migrate.js             # 数据库迁移脚本
├── server.js              # 服务器入口
├── README.md              # 项目说明
└── package.json           # 项目依赖
```

## 部署

### 使用Docker部署

1. 构建Docker镜像：
```bash
docker build -t contract-tender-platform .
```

2. 启动容器：
```bash
docker-compose up -d
```

## 安全特性

- 密码使用bcrypt进行哈希存储
- JWT令牌进行身份验证
- 输入验证防止SQL注入和XSS攻击
- 基于角色的访问控制(RBAC)
- 详细的审计日志记录

## 测试

运行后端测试：
```bash
npm test
```

## 贡献

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解更多详情。

## 联系方式

项目联系人: Contract Management Platform
邮箱: contact@contract-platform.com

---

感谢您使用第三方合同和招标管理平台！如有任何问题或建议，请随时联系我们。