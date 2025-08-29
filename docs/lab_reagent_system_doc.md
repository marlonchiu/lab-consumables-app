# 实验室试剂管理小程序开发文档

## 1. 项目概述

### 1.1 项目背景
为提高科研效率，设计一款专门用于实验室试剂采购、申请、库存管理的微信小程序，实现试剂全生命周期数字化管理。

### 1.2 核心目标
- 简化试剂采购申请流程
- 实时库存监控与预警
- 审批流程数字化
- 使用记录可追溯

## 2. 系统架构设计

### 2.1 技术栈
- **前端**: 微信小程序原生开发
- **后端**: Supabase (PostgreSQL + REST API)
- **认证**: 微信登录 + Supabase Auth
- **存储**: Supabase Database + Storage

### 2.2 系统架构图
```
[微信小程序] ←→ [Supabase API] ←→ [PostgreSQL数据库]
     ↓
[微信登录服务]
```

## 3. 功能模块设计

### 3.1 用户认证模块
- **微信一键登录**
  - 获取微信用户信息
  - 生成系统内用户档案
  - 角色权限分配

### 3.2 试剂采购申请模块
- **申请创建**
  - 试剂基本信息录入
  - 采购数量与规格
  - 使用目的说明
  - 预算信息
- **申请管理**
  - 草稿保存
  - 申请提交
  - 状态跟踪

### 3.3 审批流程模块
- **多级审批**
  - 导师初审
  - 实验室主任审批
  - 采购部门确认
- **审批操作**
  - 批准/拒绝/退回修改
  - 审批意见记录
  - 消息通知

### 3.4 库存管理模块
- **库存查询**
  - 实时库存显示
  - 试剂分类浏览
  - 搜索功能
- **库存操作**
  - 入库登记
  - 出库记录
  - 库存盘点
- **预警系统**
  - 低库存提醒
  - 过期提醒
  - 安全库存设置

### 3.5 使用记录模块
- **使用登记**
  - 用量记录
  - 使用目的
  - 使用日期
- **记录查询**
  - 个人使用历史
  - 试剂使用统计
  - 导出功能

### 3.6 个人中心模块
- **基本信息**
  - 个人资料管理
  - 实验室归属
  - 权限级别
- **快捷功能**
  - 我的申请
  - 我的审批
  - 消息中心

## 4. 数据库设计 (Supabase)

### 4.1 核心数据表

#### users (用户表)
```sql
id: uuid (主键)
openid: varchar (微信openid)
nickname: varchar (用户昵称)
avatar_url: varchar (头像URL)
real_name: varchar (真实姓名)
student_id: varchar (学号/工号)
lab_id: uuid (实验室ID)
role: enum (student/teacher/admin)
created_at: timestamp
updated_at: timestamp
```

#### laboratories (实验室表)
```sql
id: uuid (主键)
name: varchar (实验室名称)
code: varchar (实验室编码)
leader_id: uuid (负责人ID)
department: varchar (所属院系)
budget_limit: decimal (预算限额)
created_at: timestamp
```

#### reagents (试剂基础信息表)
```sql
id: uuid (主键)
name: varchar (试剂名称)
cas_number: varchar (CAS号)
molecular_formula: varchar (分子式)
category: varchar (分类)
brand: varchar (品牌)
specification: varchar (规格)
unit: varchar (单位)
safety_level: enum (安全等级)
storage_condition: text (储存条件)
```

#### purchase_requests (采购申请表)
```sql
id: uuid (主键)
applicant_id: uuid (申请人ID)
lab_id: uuid (实验室ID)
reagent_id: uuid (试剂ID)
quantity: decimal (申请数量)
unit_price: decimal (单价)
total_amount: decimal (总金额)
purpose: text (使用目的)
urgency: enum (紧急程度)
status: enum (pending/approved/rejected/purchased)
created_at: timestamp
```

#### approvals (审批记录表)
```sql
id: uuid (主键)
request_id: uuid (申请ID)
approver_id: uuid (审批人ID)
action: enum (approve/reject/return)
comment: text (审批意见)
approved_at: timestamp
level: int (审批级别)
```

#### inventory (库存表)
```sql
id: uuid (主键)
lab_id: uuid (实验室ID)
reagent_id: uuid (试剂ID)
batch_number: varchar (批次号)
current_stock: decimal (当前库存)
min_stock: decimal (最低库存)
purchase_date: date (采购日期)
expiry_date: date (过期日期)
location: varchar (存储位置)
status: enum (normal/expired/low)
```

#### usage_records (使用记录表)
```sql
id: uuid (主键)
inventory_id: uuid (库存ID)
user_id: uuid (使用者ID)
quantity_used: decimal (使用量)
purpose: text (使用目的)
used_at: timestamp
remaining_stock: decimal (剩余库存)
```

### 4.2 RLS (行级安全) 策略
- 用户只能查看所属实验室的数据
- 普通用户不能访问其他用户的个人信息
- 管理员具有完整权限

## 5. API 接口设计

### 5.1 认证相关
- `POST /auth/wechat` - 微信登录
- `GET /auth/profile` - 获取用户信息
- `PUT /auth/profile` - 更新用户信息

### 5.2 采购申请
- `POST /requests` - 创建采购申请
- `GET /requests` - 获取申请列表
- `PUT /requests/:id` - 更新申请
- `DELETE /requests/:id` - 删除申请

### 5.3 审批流程
- `GET /approvals/pending` - 待审批列表
- `POST /approvals/:requestId` - 提交审批
- `GET /approvals/history` - 审批历史

### 5.4 库存管理
- `GET /inventory` - 库存列表
- `POST /inventory` - 新增库存
- `PUT /inventory/:id` - 更新库存
- `GET /inventory/alerts` - 库存预警

### 5.5 使用记录
- `POST /usage` - 记录使用
- `GET /usage/history` - 使用历史
- `GET /usage/statistics` - 使用统计

## 6. 小程序页面结构

### 6.1 主要页面
```
├── pages/
│   ├── index/             # 首页
│   ├── login/             # 登录页
│   ├── purchase/          # 采购申请
│   │   ├── list/          # 申请列表
│   │   ├── create/        # 创建申请
│   │   └── detail/        # 申请详情
│   ├── approval/          # 审批管理
│   │   ├── pending/       # 待审批
│   │   └── history/       # 审批历史
│   ├── inventory/         # 库存管理
│   │   ├── list/          # 库存列表
│   │   ├── search/        # 库存搜索
│   │   ├── usage/         # 使用记录
│   │   └── alerts/        # 预警中心
│   └── profile/           # 个人中心
│       ├── info/          # 个人信息
│       ├── requests/      # 我的申请
│       └── settings/      # 设置
```

## 7. 用户权限设计

### 7.1 权限角色
- **学生 (Student)**
  - 查看库存
  - 提交采购申请
  - 记录试剂使用
  - 查看个人记录

- **导师 (Teacher)**
  - 学生权限 +
  - 审批学生申请
  - 管理实验室库存
  - 查看实验室统计

- **管理员 (Admin)**
  - 全部权限
  - 系统配置
  - 用户管理
  - 数据导出

### 7.2 权限矩阵
| 功能 | 学生 | 导师 | 管理员 |
|------|------|------|--------|
| 查看库存 | ✓ | ✓ | ✓ |
| 申请采购 | ✓ | ✓ | ✓ |
| 审批申请 | ✗ | ✓ | ✓ |
| 库存管理 | ✗ | ✓ | ✓ |
| 用户管理 | ✗ | ✗ | ✓ |
| 系统设置 | ✗ | ✗ | ✓ |

## 8. 开发计划

### 8.1 开发阶段
**Phase 1: 基础功能 (4周)**
- 用户认证系统
- 基础页面框架
- 采购申请功能
- 简单审批流程

**Phase 2: 核心功能 (6周)**
- 库存管理系统
- 使用记录功能
- 消息通知系统
- 数据统计报表

**Phase 3: 优化完善 (4周)**
- 性能优化
- 用户体验优化
- 安全加固
- 测试与部署

### 8.2 关键里程碑
- Week 2: 完成数据库设计与API开发
- Week 4: 完成基础功能开发
- Week 8: 完成核心功能集成测试
- Week 12: 系统上线试运行

## 9. 技术实现要点

### 9.1 微信小程序集成
- 使用 `wx.login()` 获取code
- 后端验证并获取session_key
- 结合Supabase Auth完成用户绑定

### 9.2 Supabase配置
- 启用Row Level Security
- 配置实时订阅(库存更新通知)
- 设置自动备份策略

### 9.3 性能优化
- 图片懒加载
- 数据分页加载
- 本地缓存策略
- 网络请求优化

### 9.4 安全考虑
- 敏感数据加密
- API访问限制
- 用户权限验证
- 数据备份策略

## 10. 部署与维护

### 10.1 部署流程
1. Supabase项目配置
2. 小程序开发者账号申请
3. 代码审核与发布
4. 生产环境监控

### 10.2 运维监控
- 性能监控(响应时间、并发)
- 错误监控与报警
- 用户行为分析
- 定期数据备份

### 10.3 扩展性考虑
- 多实验室支持
- 第三方系统集成
- 移动端H5版本
- 数据导入导出功能

## 11. 预算与资源

### 11.1 开发成本
- 开发时间: 12-14周
- 开发人员: 2-3人(前端1人，后端1人，UI/UX 1人)
- 第三方服务: Supabase Pro计划

### 11.2 运营成本
- 服务器费用: Supabase订阅
- 小程序认证费用
- 维护更新成本