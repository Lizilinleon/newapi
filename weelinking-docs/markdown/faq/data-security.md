---
{
  "title": "如何保障数据安全？",
  "source_url": "https://docs.weelinking.com/docs/faq/data-security",
  "description": "weelinking 大模型API中转平台的数据隐私保护与安全承诺",
  "fetched_at": "2026-07-02T06:34:44.129962+00:00"
}
---

# 如何保障数据安全？

数据安全与隐私保护是 weelinking 的生命线。我们采取多重措施确保您的数据安全。

## 数据处理原则[​](https://docs.weelinking.com/docs/faq/data-security#数据处理原则 "数据处理原则的直接链接")

1. **不存储内容：** 我们是一个 API 网关聚合平台。您的请求数据（Prompt）会经由我们加密隧道直接转发至上游官方服务商（如 OpenAI, Anthropic）。我们**不会**在数据库中持久化存储您的对话内容。
2. **不训练模型：** 我们承诺绝不使用用户的业务数据来训练、微调任何 AI 模型。

## 技术安全措施[​](https://docs.weelinking.com/docs/faq/data-security#技术安全措施 "技术安全措施的直接链接")

- **传输加密：** 全站强制启用 HTTPS (TLS 1.2/1.3)，确保数据在传输过程中不被窃听或篡改。
- **敏感信息脱敏：** 在系统日志中，Key 等敏感字段会自动脱敏处理。
- **访问控制：** 内部严格的权限管理，仅极少数核心运维人员在排查严重故障时有权接触底层日志，且所有操作均有审计记录。

## 上游合规性[​](https://docs.weelinking.com/docs/faq/data-security#上游合规性 "上游合规性的直接链接")

我们对接的均为官方商业 API 接口（Enterprise/Team Plan），根据 OpenAI 和 Anthropic 的企业隐私政策，通过 API 提交的数据不会被用于训练其公共模型。

请放心使用。
