---
{
  "title": "如何查看我的调用记录？",
  "source_url": "https://docs.weelinking.com/docs/faq/call-logs",
  "description": "weelinking 大模型API中转平台的调用日志查询与故障排查指南",
  "fetched_at": "2026-07-02T06:34:49.183604+00:00"
}
---

# 如何查看我的调用记录？

查看调用日志是排查问题、统计成本的重要手段。

## 查询路径[​](https://docs.weelinking.com/docs/faq/call-logs#查询路径 "查询路径的直接链接")

1. 登录 [weelinking 控制台](https://api.weelinking.com/account/profile)。
2. 点击左侧菜单的 **"日志"** (Logs)。

## 日志包含哪些信息？[​](https://docs.weelinking.com/docs/faq/call-logs#日志包含哪些信息 "日志包含哪些信息？的直接链接")

- **时间 (Time):** 调用发生的具体时间。
- **模型 (Model):** 实际调用的模型名称。
- **耗时 (Latency):** 请求处理花费的时间。
- **状态 (Status):**
  - `200`: 成功。
  - `4xx/5xx`: 失败，会显示具体的错误信息。
- **消耗 (Usage):** 输入 Token、输出 Token 以及总 Token 数。
- **费用 (Cost):** 该次调用产生的实际费用。

## 隐私说明[​](https://docs.weelinking.com/docs/faq/call-logs#隐私说明 "隐私说明的直接链接")

为了保护用户隐私，我们的日志系统 **默认不会记录** 您的请求内容（Prompt）和模型返回内容（Completion）。我们只记录元数据（Metadata）用于计费和运维监控。

## 常见用途[​](https://docs.weelinking.com/docs/faq/call-logs#常见用途 "常见用途的直接链接")

- **查错：** 当 API 报错时，去日志里看具体的 Error Message，往往能直接找到原因。
- **对账：** 核对某一时间段的消耗是否符合预期。
