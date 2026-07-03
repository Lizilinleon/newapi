---
title: "文本审核 (Moderation)"
description: "通过 ArmNet 字元服务 大模型API中转服务调用文本审核接口，检测敏感、暴力、色情等违规内容"
lastUpdated: true
---

# 文本审核 (Moderation)

文本审核 API 用于检测文本内容是否包含暴力、色情、仇恨言论、自残等违规信息。ArmNet 字元服务 提供兼容 OpenAI Moderation 接口的服务。

## 核心功能[​](/api-capabilities/text-moderation#核心功能 "核心功能的直接链接")

- **多维度检测**：涵盖暴力、色情、仇恨、骚扰、自残等多个类别。
- **多语言支持**：支持多种语言的内容审核。
- **细粒度评分**：不仅返回是否违规，还返回每个类别的置信度分数。

## 快速开始 (Python)[​](/api-capabilities/text-moderation#快速开始-python "快速开始 (Python)的直接链接")

```
from openai import OpenAI  
  
client = OpenAI(  
    api_key="YOUR_API_KEY",  
    base_url="http://122.51.35.238:5170/v1"  
)  
  
response = client.moderations.create(  
    input="I want to kill them."  
)  
  
output = response.results[0]  
  
print(f"Flagged: {output.flagged}")  
if output.flagged:  
    print("Categories:", output.categories)  
    print("Scores:", output.category_scores)
```

## 返回字段说明[​](/api-capabilities/text-moderation#返回字段说明 "返回字段说明的直接链接")

- `flagged` (boolean): 是否判断为违规。
- `categories` (object): 各个类别的违规判断结果 (true/false)。
- `category_scores` (object): 各个类别的违规置信度分数 (0.0 - 1.0)。

## 应用场景[​](/api-capabilities/text-moderation#应用场景 "应用场景的直接链接")

- **UGC 过滤**：用户生成内容 (评论、帖子) 的自动过滤。
- **AI 输出监控**：确保 AI 生成的内容符合安全规范。
- **聊天室监管**：实时监控聊天内容。


---

> 本页内容来自文档知识库整理，已按 ArmNet 字元服务 服务命名统一更新。
