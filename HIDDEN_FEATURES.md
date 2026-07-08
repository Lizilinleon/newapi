# 暂时隐藏但代码仍保留的功能清单

更新日期：2026-07-08

本文按类型整理当前代码中仍存在、但暂时不作为可见入口展示，或需要通过配置/权限/状态开关才显示的页面与功能。这里的“隐藏”包括：已从导航/侧栏移除、仅保留兼容跳转、受角色限制、受系统状态开关控制、因 mock/推断数据暂不展示、生产环境默认关闭调试工具。

## 快速索引

| 分类 | 说明 |
| --- | --- |
| 直接隐藏的设置页 | 已从系统设置或个人设置导航中移除，但组件/路由代码仍保留。 |
| 导航与权限隐藏 | 由顶部导航、侧栏配置、角色、企业身份、旧路由跳转控制可见性。 |
| 状态开关隐藏 | 由 `/api/status` 或系统配置控制前台面板、签到、绘图/任务等入口。 |
| 认证与外部登录 | 密码登录、注册、OAuth/OIDC、Passkey、协议同意按配置动态显示。 |
| 计费与订阅 | 支付合规锁、支付网关、订阅计划等按配置/合规状态启用。 |
| 模型、部署与价格页 | io.net 部署、性能指标、pricing mock 数据、模型详情隐藏 tab。 |
| 兼容与开发工具 | 旧 console 路由兼容跳转、setup 向导、前端 devtools。 |
| 原版/上游保留但非主用 | 原 new-api classic 前端、classic 专用 API、近期 merge 后未接入的桥接组件。 |

## 1. 直接隐藏的设置页

### 1.1 Header navigation

- 状态：已从系统设置侧栏隐藏。
- 原入口：`/system-settings/site/header-navigation`
- 隐藏位置：`web/default/src/features/system-settings/site/section-registry.tsx`
- 保留代码：
  - `web/default/src/features/system-settings/maintenance/header-navigation-section.tsx`
  - `web/default/src/features/system-settings/maintenance/config.ts`
  - `web/default/src/lib/nav-modules.ts`
  - `web/default/src/features/system-settings/types.ts`
  - `web/default/src/features/system-settings/site/index.tsx`
- 相关配置项：`HeaderNavModules`
- 隐藏原因：上游 default 的通用顶部导航配置器与当前定制顶部导航不完全匹配，展示后容易误导管理员。
- 恢复前检查：`useTopNavLinks()` 是否接入动态配置；首页、控制台、文档、关于、价格、排行等入口是否与当前站点一致；直达路由行为是否符合预期。

### 1.2 Sidebar modules

- 状态：已从系统设置侧栏隐藏。
- 原入口：`/system-settings/site/sidebar-modules`
- 隐藏位置：`web/default/src/features/system-settings/site/section-registry.tsx`
- 保留代码：
  - `web/default/src/features/system-settings/maintenance/sidebar-modules-section.tsx`
  - `web/default/src/features/system-settings/maintenance/config.ts`
  - `web/default/src/hooks/use-sidebar-config.ts`
  - `web/default/src/features/system-settings/types.ts`
  - `web/default/src/features/system-settings/site/index.tsx`
- 相关配置项：`SidebarModulesAdmin`
- 隐藏原因：上游通用侧栏模块管理器与当前侧栏结构不完全一一对应，可能保存无效配置。
- 恢复前检查：`DEFAULT_SIDEBAR_MODULES`、`URL_TO_CONFIG_MAP`、用户侧栏偏好、管理员全局配置、角色权限是否一致。

### 1.3 Sidebar Personal Settings

- 状态：已从个人设置页隐藏。
- 原入口：`/settings/sidebar`
- 隐藏位置：`web/default/src/features/settings/index.tsx`
- 保留代码：
  - `web/default/src/features/profile/components/sidebar-modules-card.tsx`
  - `web/default/src/hooks/use-sidebar-config.ts`
  - `web/default/src/routes/_authenticated/settings/$section.tsx`
- 相关配置项：用户字段 `sidebar_modules`、权限字段 `permissions.sidebar_settings`
- 隐藏原因：与后台 `Sidebar modules` 同属上游侧栏配置体系，当前可配置项与实际侧栏不完全匹配。
- 注意：`web/default/src/features/profile/index.tsx` 中的 `SidebarModulesCard` 仍可能在 `permissions.sidebar_settings !== false` 时显示；如果要完全隐藏个人侧栏配置，需要同步处理 Profile 卡片。

### 1.4 System maintenance / Update checker

- 状态：已从系统设置侧栏隐藏。
- 原入口：`/system-settings/operations/update-checker`
- 隐藏位置：`web/default/src/features/system-settings/operations/section-registry.tsx`
- 保留代码：`web/default/src/features/system-settings/maintenance/update-checker-section.tsx`
- 外部请求：`https://api.github.com/repos/Calcium-Ion/new-api/releases/latest`
- 隐藏原因：检查目标仓库不匹配当前 fork 与 `dev/next` 开发分支，且只在前端直连 GitHub Releases，容易误导管理员。
- 恢复前检查：release 仓库、GitLab/个人 GitHub fork、私有部署版本号、后端代理与速率限制策略。

## 2. 导航、路由与权限隐藏

### 2.1 顶部导航默认空状态

- 状态：默认顶部导航数组为空，组件仍保留但不渲染固定链接。
- 相关位置：
  - `web/default/src/components/layout/config/top-nav.config.ts`
  - `web/default/src/hooks/use-top-nav-links.ts`
  - `web/default/src/components/layout/components/top-nav.tsx`
  - `web/default/src/components/layout/components/app-header.tsx`
- 关联功能：`HeaderNavModules`
- 恢复前检查：是否需要将默认链接、动态配置和后端模块权限统一。

### 2.2 HeaderNavModules: Pricing / Rankings

- 状态：`/pricing`、`/pricing/$modelId`、`/rankings` 可直达，但会按模块开关二次校验。
- 相关路由：
  - `web/default/src/routes/pricing/index.tsx`
  - `web/default/src/routes/pricing/$modelId/index.tsx`
  - `web/default/src/routes/rankings/index.tsx`
- 后端保护：
  - `router/api-router.go` 的 `/api/pricing` 使用 `middleware.HeaderNavModuleAuth("pricing")`
  - `router/api-router.go` 的 `/api/rankings` 使用 `middleware.HeaderNavModuleAuth("rankings")`
- 行为：模块关闭时重定向到 `/`；模块要求登录且用户未登录时重定向到 `/sign-in`。
- 恢复前检查：顶部导航、路由守卫、API 中间件、未登录访问、移动端入口、命令菜单是否一致。

### 2.3 SidebarModulesAdmin / user sidebar_modules

- 状态：侧栏条目按管理员全局配置、用户个人配置和角色过滤；隐藏后也不应出现在命令菜单。
- 相关位置：
  - `web/default/src/hooks/use-sidebar-config.ts`
  - `web/default/src/hooks/use-sidebar-view.ts`
  - `web/default/src/hooks/use-sidebar-data.ts`
  - `web/default/src/components/layout/lib/sidebar-view-registry.ts`
  - `web/default/src/components/command-menu.tsx`
- 相关配置项：`SidebarModulesAdmin`、用户字段 `sidebar_modules`、`permissions.sidebar_settings`
- 行为：全局关闭、用户隐藏、角色不满足的模块都会从侧栏视图和命令菜单中过滤。

### 2.4 管理员与超级管理员页面

- 状态：普通用户侧栏不可见；部分路由直达时跳转 `/403`。
- 管理员入口：`/channels`、`/models`、`/users`、`/enterprises`、`/redemption-codes`、`/subscriptions`、`/admin-logs`、`/system-settings`
- 超级管理员入口：`/system-info`
- 相关位置：
  - `web/default/src/hooks/use-sidebar-data.ts`
  - `web/default/src/routes/_authenticated/channels/index.tsx`
  - `web/default/src/routes/_authenticated/users/index.tsx`
  - `web/default/src/routes/_authenticated/subscriptions/index.tsx`
  - `web/default/src/routes/_authenticated/system-info/index.tsx`
- 角色规则：`ROLE.ADMIN`、`ROLE.SUPER_ADMIN`
- 恢复前检查：侧栏过滤、route `beforeLoad`、后端 `AdminAuth` / `RootAuth` 是否一致。

### 2.5 企业身份相关入口

- 状态：不同企业身份看到的企业入口不同。
- 相关位置：`web/default/src/hooks/use-sidebar-data.ts`
- 行为：
  - `enterpriseSummary.mode === 'member'` 时隐藏 `Member management`。
  - 超级管理员不显示普通用户的 `Service` 分组。
  - `/playground`、`/chat/$chatId` 等直达路由在未满足上下文时会重定向到 `/enterprise`。
- 恢复前检查：企业成员、企业拥有者、普通个人用户、超级管理员四类账号表现。

### 2.6 命令菜单隐藏入口过滤

- 状态：命令菜单跟随侧栏过滤结果，不再单独暴露已隐藏入口。
- 修改位置：`web/default/src/components/command-menu.tsx`
- 关联代码：`web/default/src/hooks/use-sidebar-view.ts`、`web/default/src/hooks/use-sidebar-config.ts`、`web/default/src/components/layout/lib/sidebar-view-registry.ts`
- 目的：防止已从侧栏隐藏的功能通过命令菜单重新被发现。

## 3. 状态接口与配置开关隐藏

### 3.1 Dashboard content panels

- 状态：控制台/首页内容面板按 `/api/status` 开关隐藏。
- 相关开关：`api_info_enabled`、`announcements_enabled`、`faq_enabled`、`uptime_kuma_enabled`
- 相关位置：
  - `controller/misc.go`
  - `setting/console_setting/config.go`
  - `web/default/src/features/dashboard/hooks/use-status-data.ts`
  - `web/default/src/features/system-settings/content/section-registry.tsx`
- 后台配置页：`/system-settings/content/api-info`、`/system-settings/content/announcements`、`/system-settings/content/faq`、`/system-settings/content/uptime-kuma`
- 行为：开关关闭时前台列表为空；配置 UI 仍保留给管理员维护。

### 3.2 Data export

- 状态：数据导出能力由配置控制，关闭时不应显示前台导出入口。
- 相关开关：`enable_data_export`、`DataExportEnabled`、`DataExportInterval`、`DataExportDefaultTime`
- 相关位置：
  - `controller/misc.go`
  - `web/default/src/features/system-settings/content/dashboard-section.tsx`
  - `web/default/src/features/system-settings/content/section-registry.tsx`
- 恢复前检查：导出接口、默认时间范围、权限、日志量、下载行为。

### 3.3 Check-in calendar

- 状态：签到日历和签到按钮按 `checkin_enabled` 隐藏。
- 相关位置：
  - `controller/misc.go`
  - `controller/checkin.go`
  - `web/default/src/features/profile/index.tsx`
  - `web/default/src/features/profile/components/checkin-calendar-card.tsx`
  - `web/default/src/features/system-settings/general/checkin-settings-section.tsx`
- 相关配置项：`checkin_setting.enabled`、`checkin_setting.min_quota`、`checkin_setting.max_quota`
- 恢复前检查：Turnstile、奖励额度、重复签到、时区、配额日志。

### 3.4 Drawing / task related entries

- 状态：绘图与异步任务相关能力由 `enable_drawing`、`enable_task` 等状态控制，日志侧栏仍保留 `Task Logs` / drawing 路径兼容。
- 相关位置：
  - `controller/misc.go`
  - `web/default/src/hooks/use-sidebar-data.ts`
  - `web/default/src/features/system-settings/content/drawing-settings-section.tsx`
  - `web/default/src/features/usage-logs`
  - `web/default/src/features/admin-logs`
- 相关配置项：`DrawingEnabled`、`MjNotifyEnabled`、`MjAccountFilterEnabled`、`MjForwardUrlEnabled`、`MjModeClearEnabled`、`MjActionCheckSuccessEnabled`
- 原则：如果绘图/任务实际未启用，应隐藏入口，而不是展示空日志或不可用功能。

## 4. 认证、注册与外部登录隐藏

### 4.1 Password login / registration

- 状态：密码登录表单、注册入口、注册提交由状态开关控制或后端拦截。
- 相关开关：`password_login_enabled`、`register_enabled`、`password_register_enabled`、`email_verification`
- 相关位置：
  - `controller/misc.go`
  - `web/default/src/features/auth/sign-in/components/user-auth-form.tsx`
  - `web/default/src/features/auth/sign-up/components/sign-up-form.tsx`
  - `web/default/src/features/auth/auth-layout.tsx`
- 恢复前检查：注册链接、直达 `/sign-up`、邮箱验证码、Turnstile、后端注册开关是否一致。

### 4.2 OAuth / OIDC / WeChat / custom OAuth providers

- 状态：第三方登录按钮按 `/api/status` 返回的 provider 开关和 provider 列表动态显示。
- 相关开关：`github_oauth`、`discord_oauth`、`linuxdo_oauth`、`telegram_oauth`、`wechat_login`、`oidc_enabled`、`custom_oauth_providers`
- 相关位置：
  - `controller/misc.go`
  - `controller/oauth.go`
  - `model/custom_oauth_provider.go`
  - `web/default/src/features/auth/components/oauth-providers.tsx`
  - `web/default/src/features/auth/lib/oauth.ts`
  - `web/default/src/features/auth/hooks/use-oauth-login.ts`
  - `web/default/src/features/system-settings/auth/oauth-section.tsx`
  - `web/default/src/features/system-settings/auth/custom-oauth/custom-oauth-section.tsx`
- 恢复前检查：回调地址、state、绑定/解绑、管理员用户绑定弹窗、翻译。

### 4.3 Passkey login and management

- 状态：Passkey 登录按钮按 `passkey_login` 与浏览器能力隐藏；安全验证弹窗按用户是否绑定 Passkey 隐藏对应 tab。
- 相关位置：
  - `controller/misc.go`
  - `controller/passkey.go`
  - `setting/system_setting/passkey.go`
  - `web/default/src/features/auth/sign-in/components/user-auth-form.tsx`
  - `web/default/src/features/auth/passkey`
  - `web/default/src/features/auth/secure-verification`
  - `web/default/src/features/profile/components/passkey-card.tsx`
  - `web/default/src/features/system-settings/auth/passkey-section.tsx`
- 恢复前检查：RP ID、Origins、HTTPS/本地不安全 Origin、2FA fallback、管理员重置 Passkey。

### 4.4 Legal agreement links and consent

- 状态：用户协议、隐私政策、登录前勾选框按后端内容是否配置动态显示。
- 相关位置：
  - `controller/misc.go`
  - `setting/system_setting/legal.go`
  - `web/default/src/features/auth/components/legal-consent.tsx`
  - `web/default/src/features/auth/components/terms-footer.tsx`
  - `web/default/src/routes/user-agreement.tsx`
  - `web/default/src/routes/privacy-policy.tsx`
- 行为：未配置协议内容时不显示对应链接或确认框；配置后要求用户同意再登录/第三方登录。

## 5. 计费、充值与订阅隐藏/锁定

### 5.1 Payment compliance lock

- 状态：充值、兑换码、订阅计划、邀请奖励等支付相关能力受合规确认锁定。
- 相关配置项：`payment_setting.compliance_confirmed`、`payment_setting.compliance_terms_version`
- 相关位置：
  - `web/default/src/features/system-settings/billing/section-registry.tsx`
  - `web/default/src/features/system-settings/integrations/payment-settings-section.tsx`
  - `web/default/src/features/subscriptions/components/subscriptions-provider.tsx`
- 行为：根管理员未确认合规条款时，相关配置和管理动作应保持锁定或禁用。

### 5.2 Payment gateways and top-up methods

- 状态：Stripe、Creem、Waffo、Waffo Pancake、Epay 等充值入口按后端返回的可用支付方式隐藏。
- 相关位置：
  - `web/default/src/features/wallet/index.tsx`
  - `web/default/src/features/wallet/components/payment-methods-card.tsx`
  - `web/default/src/features/wallet/components/subscription-plans-card.tsx`
  - `web/default/src/features/system-settings/integrations/payment-settings-section.tsx`
  - `web/default/src/features/system-settings/integrations/waffo-settings-section.tsx`
  - `web/default/src/features/system-settings/integrations/waffo-pancake-settings-section.tsx`
- 隐藏条件：未配置密钥、未开启网关、支付方式数组为空、合规未确认。
- 恢复前检查：回调、汇率/单价、最小充值金额、支付日志、退款/失败处理、订阅复用逻辑。

### 5.3 Subscription plans

- 状态：订阅管理页仅管理员可访问；用户侧订阅购买入口依赖可用订阅计划和支付方式。
- 相关位置：
  - `web/default/src/routes/_authenticated/subscriptions/index.tsx`
  - `web/default/src/features/subscriptions`
  - `web/default/src/features/wallet/components/subscription-plans-card.tsx`
  - `web/default/src/features/subscriptions/api.ts`
- 隐藏/禁用条件：没有计划、没有可用支付方式、合规未确认。
- 恢复前检查：计划上下架、用户订阅状态、额度重置、过期降级、支付回调、使用日志展示。

## 6. 模型、部署、价格页与 mock 数据

### 6.1 API Supported parameters

- 状态：已从模型价格详情的 API 标签页隐藏。
- 原位置：价格页模型详情弹窗/详情页的 `API` 标签页。
- 隐藏位置：`web/default/src/features/pricing/components/model-details-api.tsx`
- 保留代码：`SupportedParametersSection`、`ParamRangeCell`、`buildSupportedParameters()` in `web/default/src/features/pricing/lib/mock-stats.ts`
- 隐藏原因：参数列表由前端根据模型名和类型推断，不是后端真实能力数据。
- 当前保留展示：API 示例代码、鉴权说明。
- 恢复前检查：后端是否能按 endpoint type、渠道类型、模型别名、转换链返回真实参数能力。

### 6.2 API Rate limits

- 状态：已从模型价格详情的 API 标签页隐藏。
- 隐藏位置：`web/default/src/features/pricing/components/model-details-api.tsx`
- 保留代码：`RateLimitsSection`、`buildRateLimits()`、`formatRateLimit()` in `web/default/src/features/pricing/lib/mock-stats.ts`
- 隐藏原因：RPM、TPM、RPD 由前端 mock/推断生成，不是实际用户、分组、令牌或渠道限流。
- 恢复前检查：是否有真实模型级、分组级、用户级、令牌级限流数据接口。

### 6.3 Pricing mock stats helpers

- 状态：代码仍保留，部分 UI 已隐藏。
- 位置：`web/default/src/features/pricing/lib/mock-stats.ts`
- 需要关注的函数：`buildGroupPerformance()`、`buildLatencyTimeSeries()`、`buildUptimeSeries()`、`buildAppRankings()`、`buildSupportedParameters()`、`buildRateLimits()`
- 风险：如果继续使用 mock 数据，用户可能误以为是平台真实监控或真实能力数据。
- 处理原则：优先替换为后端真实数据，或在 UI 明确标注为示例/估算。

### 6.4 Pricing detail Apps tab

- 状态：`model-details-apps.tsx` 与 `buildAppRankings()` 仍保留，但当前详情 tab 列表未展示 apps tab。
- 相关位置：
  - `web/default/src/features/pricing/components/model-details.tsx`
  - `web/default/src/features/pricing/components/model-details-apps.tsx`
  - `web/default/src/features/pricing/lib/mock-stats.ts`
- 隐藏原因：应用排行来自前端模板/种子，不是真实调用统计。
- 恢复前检查：是否有后端真实应用/场景统计，否则应明确标注为示例。

### 6.5 Performance metrics and pricing detail charts

- 状态：性能指标按后端真实数据展示；无数据时显示不可用，不再使用部分 mock 作为真实监控。
- 相关位置：
  - `web/default/src/features/pricing/components/model-details-performance.tsx`
  - `web/default/src/features/pricing/components/model-details-charts.tsx`
  - `web/default/src/features/pricing/lib/mock-stats.ts`
  - `web/default/src/features/system-settings/integrations/monitoring-settings-section.tsx`
- 相关配置项：`perf_metrics_setting.enabled`、`perf_metrics_setting.flush_interval`、`perf_metrics_setting.bucket_time`、`perf_metrics_setting.retention_days`
- 恢复前检查：采集开关、保留周期、聚合粒度、模型维度、用户可见性。

### 6.6 io.net model deployment

- 状态：模型部署代码和页面入口保留，但后端会在 `model_deployment.ionet.enabled` 未开启或 API Key 缺失时拒绝。
- 相关位置：
  - `controller/deployment.go`
  - `router/api-router.go`
  - `web/default/src/features/models/hooks/use-model-deployment-settings.ts`
  - `web/default/src/features/models/components/deployment-access-guard.tsx`
  - `web/default/src/features/system-settings/integrations/ionet-deployment-settings-section.tsx`
  - `web/default/src/features/system-settings/models/section-registry.tsx`
- 行为：未配置时应显示受限/不可用提示，而不是让用户进入半可用部署流程。
- 恢复前检查：io.net API Key、价格预估、地区/硬件列表、部署日志、续期/删除、错误文案。

## 7. 兼容路由、初始化与开发工具

### 7.1 Legacy console routes

- 状态：旧版 console 路由保留为兼容跳转，不作为当前页面入口展示。
- 相关路由：
  - `web/default/src/routes/console/log.tsx`：`/console/log` -> `/usage-logs`
  - `web/default/src/routes/console/topup.tsx`：`/console/topup` -> `/wallet`
  - `router/web-router.go`：`/console/deployment` -> `/models/deployments`
- 说明：这些不是独立页面，只用于兼容旧链接或 classic 前端遗留入口。

### 7.2 Setup wizard

- 状态：初始化向导只在系统未完成 setup 时显示；完成后 `/setup` 重定向到 `/`。
- 相关位置：
  - `web/default/src/routes/__root.tsx`
  - `web/default/src/routes/setup/index.tsx`
  - `web/default/src/features/setup/api.ts`
- 行为：root route 检查 setup 状态，必要时强制进入 `/setup`；完成后缓存状态并隐藏向导。
- 恢复前检查：缓存清理、首次部署、已部署实例、后端 setup API 返回值。

### 7.3 TanStack / React Query Devtools

- 状态：前端开发工具代码仍保留，但生产默认隐藏，避免页面左右下角出现调试按钮。
- 相关位置：`web/default/src/routes/__root.tsx`
- 相关开关：`VITE_ENABLE_DEVTOOLS === 'true'`
- 行为：未设置该环境变量时不渲染 `ReactQueryDevtools` 和 `TanStackRouterDevtools`。
- 恢复前检查：只在本地开发或测试环境启用，生产构建不要暴露。

## 8. 原版 new-api / 上游保留但当前非主用功能

### 8.1 Classic frontend theme

- 状态：原 new-api 的 classic 前端仍被打包和保留，但当前开发主线是 `web/default`；classic 仅通过主题配置切换使用。
- 相关位置：
  - `router/web-router.go`
  - `web/classic/`
  - `web/default/src/features/system-settings/general/system-info-section.tsx`
  - `controller/option.go`
- 相关配置项：`theme.frontend`，可选值 `default` / `classic`
- 行为：`theme.frontend=classic` 时根路径可返回 classic 首页资源；其他 default 前端页面和新路由仍是当前主要维护对象。
- 记录原因：这是原 new-api 保留能力，不是完全删除；但如果当前站点固定使用 default，应避免把 classic 当成主要可见功能继续扩展。
- 恢复/启用前检查：classic 构建产物、classic 路由兼容、登录态、i18n、支付/日志/模型设置是否仍与后端最新接口兼容。

### 8.2 Classic-only synchronous log cleanup API

- 状态：后端仍保留 classic 前端使用的同步删除历史日志接口；default 前端改用系统任务接口。
- 保留接口：`DELETE /api/log/`
- 当前 default 使用：`POST /api/system-task/log-cleanup`
- 相关位置：
  - `router/api-router.go`
  - `controller/log.go`
  - `web/default/src/features/system-settings/api.ts`
  - `web/default/src/features/system-settings/maintenance/log-settings-section.tsx`
- 记录原因：这是原 new-api/classic 兼容接口，代码注释已标记后续可在 classic 移除后删除；当前 default 不应重新接回同步删除行为。
- 恢复/启用前检查：大日志量删除是否阻塞请求、任务进度/失败重试、权限是否仍为 RootAuth、前端是否需要展示异步任务结果。

### 8.3 Full legacy `/console/*` route mappings

- 状态：原 new-api/classic 的 `/console/*` 路由仍由后端统一跳转到 default 新路径，不再作为独立页面入口。
- 相关位置：`router/web-router.go`
- 映射关系：
  - `/console` -> `/enterprise`
  - `/console/channel` -> `/channels`
  - `/console/token` -> `/keys`
  - `/console/topup` -> `/wallet`
  - `/console/log` -> `/usage-logs`
  - `/console/personal` -> `/profile`
  - `/console/user` -> `/users`
  - `/console/redemption` -> `/redemption-codes`
  - `/console/subscription` -> `/subscriptions`
  - `/console/models` -> `/models`
  - `/console/deployment` -> `/models/deployments`
  - `/console/playground` -> `/playground`
  - `/console/setting` -> `/system-settings`
- 记录原因：这些是原 new-api 旧 URL 兼容层；当前不应再新增 `/console/*` 页面，而应维护新路由。
- 恢复/启用前检查：旧链接是否仍被外部文档引用、查询参数是否正确透传、权限跳转是否与新路由一致。

### 8.4 Classic pricing bridge component

- 状态：`ClassicPricing` 组件仍保留，但当前 route tree 未接入独立路由，实际价格页使用 default pricing。
- 相关位置：
  - `web/default/src/features/classic-pricing/index.tsx`
  - `web/default/src/features/classic-pricing/classic-pricing.css`
  - `web/classic/src/components/table/model-pricing/layout/PricingPage`
- 记录原因：这是近期/上游合并后保留下来的 classic 价格页桥接代码；当前没有作为主价格页入口使用。
- 恢复/启用前检查：classic context、status 注入、主题样式隔离、i18n、路由守卫、`HeaderNavModules.pricing` 是否一致。

### 8.5 Legacy home hero compatibility

- 状态：`LegacyHome` 仍保留，但只在 `HomePageContent` 是旧版 hero override JSON 时使用；默认首页使用 default 新首页组件。
- 相关位置：
  - `web/default/src/features/home/index.tsx`
  - `web/default/src/features/legacy-home/index.tsx`
  - `web/default/src/features/home/hooks/use-home-page-content.ts`
- 记录原因：这是为兼容原 new-api 旧首页配置格式保留的 fallback，不是当前主首页编辑形态。
- 恢复/启用前检查：旧 JSON 字段、主题同步、语言同步、CTA 链接、移动端样式是否仍符合当前站点。

### 8.6 Legacy console content option compatibility

- 状态：内容设置仍兼容旧配置键，但 default 后台主要使用新的 `console_setting.*` 配置。
- 旧键：`Announcements`、`ApiInfo`、`FAQ`、`UptimeKumaUrl`、`UptimeKumaSlug`
- 当前键：
  - `console_setting.announcements`
  - `console_setting.api_info`
  - `console_setting.faq`
  - `console_setting.uptime_kuma_groups`
- 相关位置：`web/default/src/features/system-settings/content/index.tsx`
- 记录原因：这是原 new-api 配置迁移兼容逻辑；不应在新 UI 中继续暴露旧字段作为主配置。
- 恢复/启用前检查：旧配置迁移、空值覆盖、后台保存后是否写入新键、前台 `/api/status` 是否只读新格式。
## 恢复任一隐藏功能前的通用检查

1. 路由是否存在且直接访问行为正确。
2. 侧栏、顶部导航、命令菜单是否同时遵守隐藏/权限规则。
3. 后端接口是否真实实现，而不是前端 mock 或外部固定仓库请求。
4. 配置项保存后是否会立即影响当前前端或后端行为。
5. 翻译 key 是否覆盖 `en`、`zh`、`fr`、`ja`、`ru`、`vi`。
6. 普通用户、管理员、超级管理员、企业成员的权限表现是否一致。
7. 旧数据库中的历史配置是否需要迁移、清理或兼容。


