---
{
  "title": "使用 API 接口需要代理网络吗？",
  "source_url": "https://docs.weelinking.com/docs/faq/network-proxy",
  "description": "使用 weelinking 大模型API中转服务无需代理，国内直连即可访问",
  "fetched_at": "2026-07-02T06:34:44.845288+00:00"
}
---

# 使用 API 接口需要代理网络吗？

**不需要。**

weelinking 提供全球直连服务，无论您在国内还是海外，都可以直接访问我们的 API 接口。

## 网络连接说明[​](https://docs.weelinking.com/docs/faq/network-proxy#网络连接说明 "网络连接说明的直接链接")

### 1. 国内访问[​](https://docs.weelinking.com/docs/faq/network-proxy#1-国内访问 "1. 国内访问的直接链接")

我们针对国内用户优化了线路，采用了企业级专线接入，确保：

- **低延迟：** 相比直接访问海外 API，响应速度更快。
- **高稳定性：** 避免了跨境网络波动导致的连接中断。
- **无需翻墙：** 完全合规的境内接入点，无需配置 VPN 或代理。

### 2. 海外访问[​](https://docs.weelinking.com/docs/faq/network-proxy#2-海外访问 "2. 海外访问的直接链接")

对于海外用户，我们的系统会自动路由到最近的国际节点，同样保证极速访问体验。

## 特殊情况[​](https://docs.weelinking.com/docs/faq/network-proxy#特殊情况 "特殊情况的直接链接")

如果您在某些特殊网络环境下（如极严格的公司内网防火墙）遇到 HTTPS 证书错误或连接超时，可以尝试联系客服获取备用的 HTTP 接入点（不推荐，仅作应急）。

一般情况下，请直接使用标准 Base URL：
`https://api.weelinking.com/v1`
