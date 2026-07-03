---
title: "GPT 系列"
description: "GPT 系列模型介绍，可通过 ArmNet 字元服务 大模型API中转服务便捷调用"
lastUpdated: true
---

# GPT 系列

GPT（Generative Pre-trained Transformer）是由 OpenAI 开发的大语言模型系列，是当前最具影响力的 AI 模型家族之一。

## 发展历程[​](/wiki/models/gpt-series#发展历程 "发展历程的直接链接")

| 版本 | 发布时间 | 参数量 | 主要特点 |
| --- | --- | --- | --- |
| GPT-1 | 2018年6月 | 1.17亿 | 首次验证预训练+微调范式 |
| GPT-2 | 2019年2月 | 15亿 | 展示强大的零样本能力 |
| GPT-3 | 2020年6月 | 1750亿 | 少样本学习的里程碑 |
| GPT-3.5 | 2022年3月 | - | ChatGPT 的基础模型 |
| GPT-4 | 2023年3月 | - | 多模态能力，推理能力飞跃 |
| GPT-4o | 2024年5月 | - | 原生多模态，更快更便宜 |
| GPT-4.1 | 2025年4月 | - | 代码能力显著增强 |
| o1 | 2024年9月 | - | 深度推理模型，思维链 |
| o3 | 2024年12月 | - | 最强推理能力 |

## 核心特点[​](/wiki/models/gpt-series#核心特点 "核心特点的直接链接")

### 1. 预训练 + 微调范式[​](/wiki/models/gpt-series#1-预训练--微调范式 "1. 预训练 + 微调范式的直接链接")

GPT 开创了"大规模预训练 + 下游任务微调"的范式：

- **预训练阶段：** 在海量互联网文本上学习语言规律
- **微调阶段：** 针对特定任务进行有监督训练
- **RLHF：** 使用人类反馈强化学习，使模型更符合人类偏好

### 2. Transformer 解码器架构[​](/wiki/models/gpt-series#2-transformer-解码器架构 "2. Transformer 解码器架构的直接链接")

GPT 采用纯 Decoder 结构的 Transformer：

- 使用单向注意力机制（只能看到之前的 Token）
- 自回归生成：逐个预测下一个 Token
- 适合文本生成任务

### 3. 涌现能力[​](/wiki/models/gpt-series#3-涌现能力 "3. 涌现能力的直接链接")

当模型规模达到一定程度后，出现了意想不到的能力：

- **上下文学习（In-Context Learning）：** 无需微调，仅通过示例就能完成新任务
- **思维链推理（Chain-of-Thought）：** 分步骤解决复杂问题
- **代码理解与生成**

## 当前主力模型[​](/wiki/models/gpt-series#当前主力模型 "当前主力模型的直接链接")

### GPT-4o[​](/wiki/models/gpt-series#gpt-4o "GPT-4o的直接链接")

- **类型：** 原生多模态模型
- **上下文窗口：** 128K tokens
- **特点：** 速度快、成本低、支持文本/图像/音频输入
- **适用场景：** 日常对话、内容创作、数据分析

### GPT-4o-mini[​](/wiki/models/gpt-series#gpt-4o-mini "GPT-4o-mini的直接链接")

- **类型：** 轻量级多模态模型
- **上下文窗口：** 128K tokens
- **特点：** 极低成本、响应快速
- **适用场景：** 简单任务、高并发场景

### GPT-4.1[​](/wiki/models/gpt-series#gpt-41 "GPT-4.1的直接链接")

- **类型：** 增强版代码模型
- **上下文窗口：** 1M tokens
- **特点：** 超强代码能力，超长上下文
- **适用场景：** 代码生成、代码审查、大型项目分析

### o1 / o3 推理模型[​](/wiki/models/gpt-series#o1--o3-推理模型 "o1 / o3 推理模型的直接链接")

- **类型：** 深度推理模型
- **特点：** 内置思维链，擅长数学和复杂推理
- **适用场景：** 数学解题、逻辑推理、科学研究

## API 调用示例[​](/wiki/models/gpt-series#api-调用示例 "API 调用示例的直接链接")

```
from openai import OpenAI  
  
client = OpenAI(  
    api_key="your-api-key",  
    base_url="http://122.51.35.238:5170/v1"  
)  
  
response = client.chat.completions.create(  
    model="gpt-4o",  
    messages=[  
        {"role": "system", "content": "你是一个有帮助的助手。"},  
        {"role": "user", "content": "解释什么是量子计算"}  
    ],  
    temperature=0.7  
)  
  
print(response.choices[0].message.content)
```

## 与其他模型对比[​](/wiki/models/gpt-series#与其他模型对比 "与其他模型对比的直接链接")

| 特性 | GPT-4o | Claude 3.5 | Gemini 1.5 |
| --- | --- | --- | --- |
| 上下文窗口 | 128K | 200K | 1M-2M |
| 多模态 | ✅ | ✅ | ✅ |
| 代码能力 | 极强 | 极强 | 强 |
| 中文能力 | 强 | 强 | 强 |
| 响应速度 | 快 | 快 | 中等 |

## 最佳实践[​](/wiki/models/gpt-series#最佳实践 "最佳实践的直接链接")

1. **选择合适的模型：** 简单任务用 gpt-4o-mini，复杂任务用 gpt-4o 或 o1
2. **设置合理的 Temperature：** 事实性任务用 0，创意任务用 0.7-1.0
3. **利用系统提示词：** 明确角色和约束，获得更好的输出
4. **流式输出：** 长回复使用 stream=true 提升用户体验


---

> 本页内容来自文档知识库整理，已按 ArmNet 字元服务 服务命名统一更新。
