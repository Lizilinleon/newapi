---
{
  "title": "如何创建 KEY？",
  "source_url": "https://docs.weelinking.com/docs/faq/token-management",
  "description": "在 weelinking 大模型API中转平台创建和管理 API Key 令牌",
  "fetched_at": "2026-07-02T06:34:47.020888+00:00"
}
---

# 如何创建 KEY？

在 weelinking 平台，"Key" 也被称为 "令牌" (Token)。您可以创建多个令牌来区分不同应用或环境的用量。

## 创建步骤[​](https://docs.weelinking.com/docs/faq/token-management#创建步骤 "创建步骤的直接链接")

1. 登录 [weelinking 控制台](https://api.weelinking.com/account/profile)。
2. 点击左侧菜单的 **"令牌管理"**。
3. 点击 **"添加新的令牌"** 按钮。
4. **名称（可选）：** 给令牌起个名字，例如 "测试用"、"生产环境"、"Cursor"。
5. **过期时间（可选）：** 设置令牌的有效期，"永不过期" 则永久有效。
6. **额度限制（可选）：** 设置该令牌最多能消耗多少金额。这对于控制成本非常有用（例如给实习生开一个 50 元额度的 Key）。
7. 点击 **"提交"**。

## 令牌管理[​](https://docs.weelinking.com/docs/faq/token-management#令牌管理 "令牌管理的直接链接")

- **复制 Key：** 创建成功后，点击 "复制" 按钮获取 `sk-` 开头的密钥。**请妥善保管，不要泄露。**
- **禁用/启用：** 您可以随时暂停某个 Key 的使用。
- **删除：** 删除后该 Key 立即失效，且不可恢复。

## 最佳实践[​](https://docs.weelinking.com/docs/faq/token-management#最佳实践 "最佳实践的直接链接")

- **一应用一 Key：** 建议为每个应用或每个开发环境创建一个独立的 Key，这样可以单独统计用量，且某个 Key 泄露后只需重置该 Key，不影响其他业务。
- **设置额度：** 为不信任的环境（如前端公开演示）设置严格的额度限制。
