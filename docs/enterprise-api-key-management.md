# 企业 API Key 管理当前实现

本文记录当前开发版已经落地的企业、成员、管理员 API Key 与资金管理逻辑。文档以当前代码实现为准，不再保留早期已废弃的“开发视角切换”“测试资金按钮”等描述。

## 1. 设计目标

- 任意已登录用户都可以创建自己的企业。
- 企业本体与用户账户相互独立，用户通过 `enterprise_account_relations` 成为企业的当前主账户。
- 企业主可以把个人余额划转到企业资金池，再从企业资金池给成员分配企业额度。
- 成员可以创建自己的 API Key，其中企业扣费 Key 只消耗该成员在企业中的分配余额。
- 成员的个人 API Key 仍消耗个人账户余额，与企业额度分开。
- 企业解散、成员退出、成员移除时不硬删除历史企业、成员、日志，但会切断关系并停用相关企业 API Key。
- 管理员可以查看所有企业、企业详情、成员、成员 API、使用日志，并管理用户资金/企业资金。

## 2. 角色视图

### 无企业用户

- 进入 `/enterprise` 时显示创建企业入口。
- 创建企业后成为该企业当前主账户。
- 新账户初始余额为 0，需要管理员加款或后续正式充值后才能划转企业资金。

### 企业主账户

- 在 `/enterprise/overview` 查看企业概览、企业资金、成员数量、企业 API 数量、企业使用量。
- 可以从个人余额划转资金到企业资金池。
- 可以邀请已注册账户加入企业。
- 可以在成员管理页分配或调整成员企业额度。
- 可以查看成员企业 API Key 元数据和企业使用日志。
- 可以解散企业；若企业资金或成员剩余额度未清零，则禁止解散并提示联系管理员处理。

### 企业成员

- 在企业页面只看到“概览”和“成员 API”。
- 可查看自己的企业额度、企业使用量、企业扣费 API Key。
- 可在成员 API 页面创建企业扣费 API Key，创建抽屉默认选择企业扣费。
- 如需创建自己的企业，需要先退出当前企业。
- 若成员企业额度仍有余额，则禁止退出企业。

### 管理员

- `/enterprises`：查看所有企业列表，支持搜索、分页、每页数量。
- `/enterprises/:id`：查看指定企业详情、成员、成员 API、使用日志。
- 可在用户管理中调整用户个人资金。
- 可在企业列表中给企业资金池加款或设置余额。
- 可查看已解散/已断开主账户关系的企业。

## 3. 资金模型

### 个人余额

- 存储在 `users.quota`。
- 普通个人 API Key 消耗个人余额。
- 企业主可将个人余额划转到自己的企业资金池。
- 划转后不能由用户在页面自行撤回；如需退回个人余额，需要管理员处理。

### 企业资金

- 存储在 `enterprise_accounts.quota`。
- 只能用于分配给企业成员。
- 管理员可直接为企业加款或设置企业资金。
- 企业主可通过“划转企业资金”按钮把个人余额加入企业资金。

### 成员企业额度

- 存储在 `enterprise_quota_allocations.remain_quota`。
- 企业扣费 API Key 调用模型时扣除该成员的 `remain_quota`。
- 分配成员额度时，从企业资金池扣除差额。
- 调低成员额度时，将未使用部分退回企业资金池。
- 成员被移除时，未用完额度退回企业资金池。

## 4. API Key 规则

- API Key 仍属于创建它的用户。
- `tokens.enterprise_id = 0` 表示个人账户扣费。
- `tokens.enterprise_id > 0` 表示企业扣费。
- 企业扣费 Key 只能由该企业的有效成员创建和使用。
- 如果企业解散、成员退出、成员被移除，相关企业 Key 会被置为停用。
- 已解散企业的旧 Key 不允许重新启用，后端会拒绝启用请求并提示企业已解散或不可用。
- 旧数据中没有有效主账户关系的企业 Key，会在企业关系回填/清理时自动停用。

## 5. 企业生命周期

### 创建企业

接口：`POST /api/enterprise/account`

- 创建 `enterprise_accounts`。
- 创建或恢复 `enterprise_account_relations` 中当前用户的 owner 关系。
- 企业仅记录基础名称，更多资料字段仍待扩展。

### 邀请成员

接口：`POST /api/enterprise/members`

- 输入成员邮箱和可选显示名称。
- 要求该邮箱对应账户已经注册。
- 发送包含邀请链接的邮件。
- 成员登录自己的账户后通过链接接受邀请。

接受邀请接口：`POST /api/enterprise/invitations/accept`

### 成员退出

接口：`POST /api/enterprise/membership/leave`

- 如果成员企业剩余额度大于 0，禁止退出。
- 退出后成员关系标记为 removed。
- 成员企业额度记录清零。
- 成员企业 API Key 停用。

### 企业主移除成员

接口：`DELETE /api/enterprise/members/:id`

- 未用完的成员企业额度退回企业资金池。
- 成员关系标记为 removed。
- 成员企业 API Key 停用。

### 解散企业

接口：`POST /api/enterprise/account/dissolve`

- 如果企业资金仍有余额，禁止解散。
- 如果成员企业额度仍有余额，禁止解散。
- 解散只断开当前主账户关系，不删除企业本体和历史日志。
- 所有成员关系会移除。
- 相关企业 API Key 会停用。
- 未接受邀请会标记为过期。

## 6. 数据表

### `enterprise_accounts`

| 字段 | 说明 |
| --- | --- |
| `id` | 企业 ID |
| `owner_user_id` | 旧兼容字段，不再作为唯一业务关系依据 |
| `created_by_user_id` | 创建企业的用户 ID |
| `name` | 企业名称 |
| `quota` | 企业资金池余额 |
| `status` | 企业状态 |

### `enterprise_account_relations`

| 字段 | 说明 |
| --- | --- |
| `enterprise_id` | 企业 ID |
| `user_id` | 关联用户 ID |
| `role` | 当前主要使用 `owner` |
| `status` | `active` 表示当前主账户关系，`removed` 表示已断开 |

### `enterprise_members`

保存企业成员关系。移除成员时软删除，即将 `status` 改为 removed。

### `enterprise_quota_allocations`

保存成员企业额度、剩余额度和预警阈值。

### `enterprise_invitations`

保存邮件邀请、邀请 token、过期时间和接受状态。

### `enterprise_quota_allocation_logs`

保存成员额度分配历史。后续仍需完善成完整资金流水页面。

## 7. 当前接口

### 用户/企业主接口

- `GET /api/enterprise/summary`：获取当前用户企业视图。
- `POST /api/enterprise/account`：创建或更新当前用户企业。
- `POST /api/enterprise/account/funds`：将个人余额划转到企业资金。
- `POST /api/enterprise/account/dissolve`：解散/断开当前企业主关系。
- `POST /api/enterprise/members`：向已注册邮箱发送企业邀请。
- `POST /api/enterprise/invitations/accept`：接受企业邀请。
- `PATCH /api/enterprise/members/:id`：更新成员状态或显示名。
- `DELETE /api/enterprise/members/:id`：移除成员。
- `POST /api/enterprise/members/:id/quota`：分配或调整成员额度。
- `GET /api/enterprise/members/:id/tokens`：查看成员企业扣费 API Key。
- `GET /api/enterprise/logs`：查看企业使用日志。
- `POST /api/enterprise/membership/leave`：成员退出企业。

### 管理员接口

- `GET /api/admin/enterprises`：管理员企业列表。
- `GET /api/admin/enterprises/:id`：企业详情。
- `GET /api/admin/enterprises/:id/members`：企业成员详情。
- `GET /api/admin/enterprises/:id/logs`：企业使用日志。
- `POST /api/admin/enterprises/:id/quota`：管理员设置或增加企业资金。

兼容路径：`/api/enterprise/admin/accounts...` 仍保留。

## 8. 前端页面

- `/enterprise/overview`：企业概览。
- `/enterprise/members`：成员管理。
- `/enterprise/member-api`：成员 API。
- `/enterprise/usage-logs`：企业使用日志。
- `/enterprises`：管理员企业列表。
- `/enterprises/:id`：管理员企业详情。

## 9. 当前边界

- 还没有正式充值/支付系统。
- 企业资金退回个人余额只能走管理员处理，用户页面不可撤销。
- 企业资料字段仍较少。
- 企业角色体系仍只有企业主和成员，尚未拆分财务、管理员、只读等角色。
- 资金流水和审计日志还需要进一步页面化。
