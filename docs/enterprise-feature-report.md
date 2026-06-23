# 企业版新增功能报告

本文汇总当前开发版相对基础 new-api 已新增或改造的企业、成员、资金、API Key 与管理员能力。文档已同步到当前实现状态。

## 1. 总体定位

当前版本在保留原有模型渠道、统一 API 转发、API Key、日志、计费和用户系统的基础上，新增了企业/团队/家庭场景的资金池和成员 API Key 管理能力。

核心能力：

- 用户可注册、登录并创建自己的企业。
- 企业本体与用户账户独立，通过关系表建立当前主账户关系。
- 企业主可将个人余额划转为企业资金。
- 企业主可邀请已注册账户加入企业。
- 企业主可给成员分配企业额度。
- 成员可创建企业扣费 API Key。
- 企业扣费 API Key 消耗成员企业额度，不消耗成员个人余额。
- 管理员可查看所有企业、企业详情、成员、API Key 和企业日志。

## 2. 登录、入口与布局

已完成：

- 恢复最小注册流程：用户名、邮箱、密码、确认密码。
- 新注册用户初始余额为 0。
- 登录支持用户名或邮箱。
- 注册成功后跳转登录页，不自动进入 root。
- 退出登录会清理后端 Session 和前端本地登录状态。
- 登录后默认进入企业相关入口。
- 企业页按用户状态显示：`none`、`owner`、`member`。
- 企业页面拆分为侧边子路由：概览、成员管理、成员 API、使用日志。
- 成员视图仅显示概览和成员 API。
- 右上角“邀请成员”“解散企业”仅在企业主概览页显示。

主要文件：

- `web/default/src/features/auth/sign-up/components/sign-up-form.tsx`
- `web/default/src/features/auth/sign-in/index.tsx`
- `web/default/src/features/enterprise/index.tsx`
- `web/default/src/routes/_authenticated/enterprise/$section.tsx`
- `web/default/src/components/sign-out-dialog.tsx`

## 3. 企业与成员管理

已完成：

- 创建企业：`POST /api/enterprise/account`
- 企业主关系独立化：`enterprise_account_relations`
- 邀请成员：`POST /api/enterprise/members`
- 邮件邀请链接接受：`POST /api/enterprise/invitations/accept`
- 更新成员状态/显示名：`PATCH /api/enterprise/members/:id`
- 移除成员：`DELETE /api/enterprise/members/:id`
- 成员退出企业：`POST /api/enterprise/membership/leave`
- 解散企业：`POST /api/enterprise/account/dissolve`
- 查看成员企业 API Key：`GET /api/enterprise/members/:id/tokens`
- 查看企业使用日志：`GET /api/enterprise/logs`

关键逻辑：

- 邀请成员要求被邀请邮箱已注册。
- 邀请通过邮件链接完成，不再直接把邮箱拉进企业。
- 成员退出前必须没有剩余企业额度。
- 企业解散前企业资金和成员剩余额度必须为 0。
- 解散不删除企业本体和历史日志，只断开主账户关系并移除成员关系。

主要文件：

- `model/enterprise.go`
- `controller/enterprise.go`
- `router/api-router.go`
- `web/default/src/features/enterprise/index.tsx`

## 4. 资金与额度体系

已完成：

- 后端继续使用内部 quota 单位存储。
- 前端按系统货币设置展示金额，不再写死美元符号。
- 用户个人余额存储于 `users.quota`。
- 企业资金池存储于 `enterprise_accounts.quota`。
- 成员企业额度存储于 `enterprise_quota_allocations.remain_quota`。
- 企业主可从个人余额划转到企业资金池：`POST /api/enterprise/account/funds`。
- 划转操作带二次确认，提示不可在用户页面撤销，如需退回需联系管理员。
- 企业主可从企业资金池给成员分配额度。
- 调低成员额度时，未用部分退回企业资金池。
- 管理员可给企业资金池增加金额或设置余额。
- 管理员可在用户页面管理所有用户个人资金。

当前规则：

- 个人 API Key 扣个人余额。
- 企业 API Key 扣成员企业额度。
- 企业资金不能由普通用户自行退回个人余额。
- 资金链路涉及重要操作时前端均有二次确认。

## 5. API Key 改造

已完成：

- `tokens.enterprise_id` 区分个人扣费和企业扣费。
- API Key 列表显示“个人账户扣费”或“公司扣费”。
- 游乐场支持填写/切换自己的 API Key 和 Base URL。
- 成员 API 页面可以创建企业扣费 API Key，默认选择企业扣费。
- 企业主可查看成员企业 API Key 元数据。
- 企业解散、成员退出、成员被移除时，相关企业 API Key 自动停用。
- 已解散企业的旧企业 API Key 不能重新启用，后端会拒绝。
- 启动/迁移回填时会清理无有效主账户关系企业下仍启用的旧企业 Key。

主要文件：

- `model/token.go`
- `controller/token.go`
- `middleware/auth.go`
- `web/default/src/features/keys/components/api-keys-mutate-drawer.tsx`
- `web/default/src/features/keys/components/api-keys-columns.tsx`
- `web/default/src/features/enterprise/index.tsx`

## 6. 管理员企业管理

已完成：

- 管理员企业列表：`/enterprises`
- 管理员企业详情：`/enterprises/:id`
- 企业列表支持搜索、分页、每页数量。
- 企业详情显示企业基础信息、成员概览、成员 API、使用日志。
- 已断开主账户关系的企业会显示为停用/已断开状态。
- 管理员可给企业资金池加款或设置余额。
- 管理员可管理所有用户资金。

主要接口：

- `GET /api/admin/enterprises`
- `GET /api/admin/enterprises/:id`
- `GET /api/admin/enterprises/:id/members`
- `GET /api/admin/enterprises/:id/logs`
- `POST /api/admin/enterprises/:id/quota`

## 7. 企业提醒设置

已完成基础配置：

- `setting/operation_setting/enterprise_setting.go`
- `BalanceEmailNotifyEnabled`
- `BalanceWarningPercent`

当前状态：

- 已有低余额提醒配置结构。
- 企业余额和成员余额接近阈值时已有前端提醒基础。
- 邮件提醒和防重复发送策略仍需进一步验收和完善。

## 8. 文档与本地开发说明

已更新/保留的文档：

- `docs/enterprise-api-key-management.md`：当前企业 API Key 与资金实现。
- `docs/enterprise-feature-report.md`：新增功能报告。
- `docs/enterprise-todo-report.md`：后续待办。
- `docs/enterprise-entry-and-registration.md`：入口、注册、登录、邀请流程。
- `docs/email-verification-registration-plan.md`：邮箱验证注册计划。

## 9. 已验证命令

开发过程中已多次执行：

- `go test ./model`
- `go test ./controller -run '^$'`
- `go test ./model ./controller -run '^$'`
- `cd web/default && bun run typecheck`
- `cd web/default && bun run i18n:sync`

## 10. 当前边界

- 尚未接入正式支付/充值系统。
- 企业资金退回个人余额仍需管理员处理流程。
- 企业邀请记录管理、撤销、重发尚未页面化。
- 企业角色权限尚未细分。
- 完整资金流水、审计日志和导出功能仍待实装。
- 跨数据库迁移和并发扣费还需要系统化回归测试。
