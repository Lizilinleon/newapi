---
title: "Claude 模型调用指南"
description: "通过 ArmNet 字元服务 大模型API中转服务调用 Claude 系列模型，支持 OpenAI 兼容格式与 Anthropic 原生格式"
lastUpdated: true
---

# Claude 模型调用指南

ArmNet 字元服务 提供对 Claude 全系列模型的即时访问，包括最新的 **Opus 4.5**。支持 OpenAI 兼容格式和 Anthropic 原生格式。

## 支持模型[​](/api-capabilities/claude#支持模型 "支持模型的直接链接")

- **Claude Opus 4.5**：卓越的编程能力，成本低于前代。
- **Claude Sonnet 4.5**：平衡性能与速度。
- **Claude Haiku 4.5**：高性价比，快速响应。

## 核心特性[​](/api-capabilities/claude#核心特性 "核心特性的直接链接")

- **双格式支持**：OpenAI 兼容格式 & Anthropic 原生格式。
- **官方合作伙伴**：基于 AWS Bedrock 和 Anthropic 直连，稳定可靠。
- **Claude Code 支持**：完全兼容 Claude Code 桌面应用。

## 使用指南[​](/api-capabilities/claude#使用指南 "使用指南的直接链接")

### OpenAI 兼容格式 (Python)[​](/api-capabilities/claude#openai-兼容格式-python "OpenAI 兼容格式 (Python)的直接链接")

```
from openai import OpenAI  
  
client = OpenAI(  
    api_key="YOUR_API_KEY",  
    base_url="http://122.51.35.238:5170/v1"  
)  
  
response = client.chat.completions.create(  
    model="claude-opus-4-5-20250929", # 示例ID  
    messages=[{"role": "user", "content": "Hello Claude!"}]  
)  
print(response.choices[0].message.content)
```

### Anthropic 原生格式 (Python SDK)[​](/api-capabilities/claude#anthropic-原生格式-python-sdk "Anthropic 原生格式 (Python SDK)的直接链接")

可以使用 Anthropic 官方 SDK，只需修改 base\_url 和 api\_key。

## 最佳实践[​](/api-capabilities/claude#最佳实践 "最佳实践的直接链接")

- **Opus 4.5 推理深度**：通过 `effort` 参数控制 (low, medium, high) 平衡质量与成本。
- **Prompt Caching**：利用缓存降低长上下文成本。


---

> 本页内容来自文档知识库整理，已按 ArmNet 字元服务 服务命名统一更新。
