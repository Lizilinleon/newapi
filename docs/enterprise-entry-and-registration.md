# 企业版入口、注册与账户当前实现

本文记录当前企业版入口、注册、登录、企业创建、成员邀请和账户相关行为。

文档层级：`docs/README.md` -> `enterprise-feature-report.md` -> 本文。本文只记录当前已实现的入口、注册、登录和企业生命周期行为；公开首页、页脚、法律页面和登录页视觉样式以 `PROJECT_CUSTOMIZATIONS.md` 为准。

## 1. 入口

当前登录后的主要入口是企业功能。

- 已登录用户可访问 `/enterprise`。
- 企业子页面包括：
  - `/enterprise/overview`
  - `/enterprise/members`
  - `/enterprise/member-api`
  - `/enterprise/usage-logs`
- 未登录访问受保护页面会跳转登录。
- 管理员企业列表入口为 `/enterprises`。
- 管理员企业详情入口为 `/enterprises/:id`。

## 2. 企业视图状态

`GET /api/enterprise/summary` 返回当前用户的企业状态。

- `none`：当前用户没有创建企业，也不是其他企业成员。
- `owner`：当前用户是某企业当前主账户。
- `member`：当前用户是其他企业成员。

当前实现中，一个用户若是企业成员，需要先退出当前企业，才可创建自己的企业。

## 3. 注册与登录

当前恢复了最小注册流程。

注册字段：

- 用户名。
- 邮箱。
- 密码。
- 确认密码。

规则：

- 新注册账户初始余额为 0。
- 邮箱会转小写保存。
- 用户名和邮箱需要避免重复。
- 暂不要求邮箱验证码。
- 注册成功后跳转登录页，不直接进入系统。
- 登录支持用户名或邮箱。
- 登出会清理后端 Session 和前端本地状态，并回到登录页。

## 4. Root/管理员账户

当前仍保留本地开发用最高权限账户，用于管理员功能和本地验收。

注意：

- 普通注册/登录流程不会自动进入 Root 用户。
- 管理员企业列表、用户资金管理、企业资金管理需要管理员权限。
- 生产部署前应重新设置管理员账户密码并关闭不必要的开发能力。

## 5. 创建企业

入口：企业页 `none` 状态下点击创建企业。

接口：

```http
POST /api/enterprise/account
```

请求示例：

```json
{
  "name": "Example Team"
}
```

创建后：

- 创建 `enterprise_accounts`。
- 创建 `enterprise_account_relations` owner 关系。
- 当前用户成为该企业主账户。
- 企业资金初始为 0。

## 6. 个人余额划转企业资金

企业主可在概览页点击“划转企业资金”。

接口：

```http
POST /api/enterprise/account/funds
```

请求示例：

```json
{
  "quota": 500000
}
```

说明：

- 前端按系统货币输入金额，提交前换算为内部 quota。
- 后端在事务中从 `users.quota` 扣除，并增加 `enterprise_accounts.quota`。
- 如果个人余额不足，接口会失败。
- 此操作在用户页面不可撤销；如需退回个人余额，需要联系管理员处理。
- 前端保存前有二次确认，展示划转前后个人余额和企业资金。

## 7. 邀请成员

企业主在概览页点击“邀请成员”。

接口：

```http
POST /api/enterprise/members
```

请求示例：

```json
{
  "email": "member@example.com",
  "display_name": "Member A"
}
```

当前规则：

- 被邀请邮箱必须已经注册账户。
- 被邀请用户不能是企业主本人。
- 被邀请用户必须是启用状态。
- 被邀请用户不能已经是其他未移除企业成员。
- 系统发送包含邀请链接的邮件。
- 成员需要登录自己的账户并打开邀请链接接受。

接受邀请接口：

```http
POST /api/enterprise/invitations/accept
```

请求示例：

```json
{
  "token": "invitation-token"
}
```

## 8. 企业成员额度

企业主在成员管理页给成员分配额度。

接口：

```http
POST /api/enterprise/members/:id/quota
```

请求示例：

```json
{
  "allocated_quota": 500000,
  "warning_threshold": 0.2
}
```

规则：

- 分配额度从企业资金池扣除。
- 调低额度时，差额退回企业资金池。
- 成员企业 API Key 消费扣成员企业剩余额度。
- 成员额度不足时模型调用失败。

## 9. 企业 API Key

成员可在成员 API 页面创建企业扣费 API Key。

规则：

- 从成员 API 页面创建时默认企业扣费。
- 个人 API Key 与企业 API Key 在 API Key 页面中会显示不同扣费来源。
- 企业扣费 Key 的 `enterprise_id` 大于 0。
- 企业解散、成员退出、成员移除后相关企业 Key 停用。
- 已失效企业 Key 不能重新启用。

## 10. 退出与解散

### 成员退出

接口：

```http
POST /api/enterprise/membership/leave
```

规则：

- 如果成员企业额度仍有余额，则禁止退出。
- 退出后企业 Key 停用。
- 历史日志保留。

### 企业主解散企业

接口：

```http
POST /api/enterprise/account/dissolve
```

规则：

- 如果企业资金仍有余额，则禁止解散。
- 如果成员企业额度仍有余额，则禁止解散。
- 解散后企业仍保留在后台，管理员仍可查看。
- 解散会断开主账户关系、移除成员关系、停用企业 Key。

## 11. 当前边界

- 当前没有正式充值系统。
- 当前没有注册邮箱验证码。
- 邀请记录管理、撤销、重发尚未页面化。
- 复杂企业角色权限尚未拆分。
- 企业资金退回个人余额需要管理员处理流程，用户端不支持自行撤销。
