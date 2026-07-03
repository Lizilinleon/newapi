---
{
  "title": "API 可以开多少并发？",
  "source_url": "https://docs.weelinking.com/docs/faq/api-concurrency",
  "description": "weelinking 大模型API中转服务的并发配额与速率限制说明",
  "fetched_at": "2026-07-02T06:34:46.293014+00:00"
}
---

# API 可以开多少并发？

weelinking 的并发限制（Rate Limit）是针对**模型**维度的，而不是针对账号维度的。这意味着不同模型有独立的并发池。

## 并发策略[​](https://docs.weelinking.com/docs/faq/api-concurrency#并发策略 "并发策略的直接链接")

### 1. 文本模型 (Text Generation)[​](https://docs.weelinking.com/docs/faq/api-concurrency#1-文本模型-text-generation "1. 文本模型 (Text Generation)的直接链接")

绝大多数文本模型（如 GPT-3.5, GPT-4o mini, Claude 3 Haiku 等）支持极高的并发。

- **默认并发：** 50 RPM (Requests Per Minute) / 50 QPS (Queries Per Second) - *注：具体视模型而定，通常文本模型不做严格限制，除非滥用。*
- **适用场景：** 高频对话、批量翻译、数据处理。

### 2. 图像模型 (Image Generation)[​](https://docs.weelinking.com/docs/faq/api-concurrency#2-图像模型-image-generation "2. 图像模型 (Image Generation)的直接链接")

由于图像生成涉及大量数据传输（Base64），并发限制相对严格。

- **默认并发：** 约 30 次/秒（全站共享池，单用户会有动态限制）。
- **建议：** 建议使用异步任务队列处理绘图请求，避免瞬间高并发导致超时。

### 3. 视频与大文件模型[​](https://docs.weelinking.com/docs/faq/api-concurrency#3-视频与大文件模型 "3. 视频与大文件模型的直接链接")

此类模型处理时间长，通常采用异步回调模式，并发限制主要取决于任务排队长度。

## 常见问题[​](https://docs.weelinking.com/docs/faq/api-concurrency#常见问题 "常见问题的直接链接")

### 遇到 429 Too Many Requests 怎么办？[​](https://docs.weelinking.com/docs/faq/api-concurrency#遇到-429-too-many-requests-怎么办 "遇到 429 Too Many Requests 怎么办？的直接链接")

这意味着您瞬间发起的请求过多，超过了系统保护阈值。

- **建议：** 在代码中增加重试机制（Retry with Exponential Backoff）。
- **建议：** 错峰请求，或减缓请求速率。

### 如何提升并发额度？[​](https://docs.weelinking.com/docs/faq/api-concurrency#如何提升并发额度 "如何提升并发额度？的直接链接")

如果您有企业级业务需求，需要更高的并发配额（如每秒数百次请求），请联系客服申请。我们会根据您的实际使用情况和充值额度为您开通**企业专线**或**独立部署通道**。
