---
title: "Gemini 系列"
description: "Gemini 系列模型介绍，可通过 ArmNet 字元服务 大模型API中转服务便捷调用"
lastUpdated: true
---

# Gemini 系列

Gemini 是 Google DeepMind 开发的多模态大语言模型系列，以超长上下文和原生多模态能力著称。

## 发展历程[​](/wiki/models/gemini-series#发展历程 "发展历程的直接链接")

| 版本 | 发布时间 | 主要特点 |
| --- | --- | --- |
| Gemini 1.0 | 2023年12月 | 首个版本，三种规格 |
| Gemini 1.0 Ultra | 2024年2月 | 最强规格，超越 GPT-4 |
| Gemini 1.5 Pro | 2024年2月 | 1M 上下文窗口 |
| Gemini 1.5 Flash | 2024年5月 | 轻量快速版本 |
| Gemini 2.0 Flash | 2024年12月 | 新一代快速模型 |
| Gemini 2.5 Pro | 2025年3月 | 最新旗舰模型 |
| Gemini 2.5 Flash | 2025年5月 | 性价比之王 |

## 核心特点[​](/wiki/models/gemini-series#核心特点 "核心特点的直接链接")

### 1. 原生多模态[​](/wiki/models/gemini-series#1-原生多模态 "1. 原生多模态的直接链接")

Gemini 从设计之初就是多模态的：

- **文本理解与生成**
- **图像理解与分析**
- **音频处理**
- **视频理解**
- **代码生成**

### 2. 超长上下文窗口[​](/wiki/models/gemini-series#2-超长上下文窗口 "2. 超长上下文窗口的直接链接")

Gemini 在上下文长度上遥遥领先：

- **Gemini 1.5 Pro：** 最高支持 2M tokens
- **Gemini 2.5 Pro：** 1M tokens
- 可以处理整本书、长视频、大型代码库

### 3. 高效的 MoE 架构[​](/wiki/models/gemini-series#3-高效的-moe-架构 "3. 高效的 MoE 架构的直接链接")

Gemini 1.5+ 采用混合专家（MoE）架构：

- 更高效的计算资源利用
- 更快的推理速度
- 更低的运行成本

## 当前主力模型[​](/wiki/models/gemini-series#当前主力模型 "当前主力模型的直接链接")

### Gemini 2.5 Pro[​](/wiki/models/gemini-series#gemini-25-pro "Gemini 2.5 Pro的直接链接")

- **模型 ID：** `gemini-2.5-pro`
- **上下文窗口：** 1M tokens
- **特点：** 最强综合能力，深度推理
- **适用场景：** 复杂分析、科学研究、长文档处理

### Gemini 2.5 Flash[​](/wiki/models/gemini-series#gemini-25-flash "Gemini 2.5 Flash的直接链接")

- **模型 ID：** `gemini-2.5-flash`
- **上下文窗口：** 1M tokens
- **特点：** 极快响应、成本极低
- **适用场景：** 实时交互、高并发、日常任务

### Gemini 2.0 Flash[​](/wiki/models/gemini-series#gemini-20-flash "Gemini 2.0 Flash的直接链接")

- **模型 ID：** `gemini-2.0-flash`
- **上下文窗口：** 1M tokens
- **特点：** 新一代架构、平衡性能与成本
- **适用场景：** 通用场景、API 集成

### Gemini 1.5 Pro[​](/wiki/models/gemini-series#gemini-15-pro "Gemini 1.5 Pro的直接链接")

- **模型 ID：** `gemini-1.5-pro`
- **上下文窗口：** 2M tokens
- **特点：** 超长上下文处理能力
- **适用场景：** 超长文档、视频分析

## API 调用示例[​](/wiki/models/gemini-series#api-调用示例 "API 调用示例的直接链接")

```
from openai import OpenAI  
  
client = OpenAI(  
    api_key="your-api-key",  
    base_url="http://122.51.35.238:5170/v1"  
)  
  
response = client.chat.completions.create(  
    model="gemini-2.5-flash",  
    messages=[  
        {"role": "user", "content": "介绍一下量子计算的基本原理"}  
    ],  
    temperature=0.7  
)  
  
print(response.choices[0].message.content)
```

### 多模态调用（图像理解）[​](/wiki/models/gemini-series#多模态调用图像理解 "多模态调用（图像理解）的直接链接")

```
response = client.chat.completions.create(  
    model="gemini-2.5-flash",  
    messages=[  
        {  
            "role": "user",  
            "content": [  
                {"type": "text", "text": "描述这张图片的内容"},  
                {  
                    "type": "image_url",  
                    "image_url": {"url": "https://example.com/image.jpg"}  
                }  
            ]  
        }  
    ]  
)
```

## Gemini 的独特能力[​](/wiki/models/gemini-series#gemini-的独特能力 "Gemini 的独特能力的直接链接")

### 1. 超长视频理解[​](/wiki/models/gemini-series#1-超长视频理解 "1. 超长视频理解的直接链接")

- 可以分析长达数小时的视频
- 理解视频中的动作、对话、场景
- 生成视频摘要和答疑

### 2. 代码执行[​](/wiki/models/gemini-series#2-代码执行 "2. 代码执行的直接链接")

Gemini 支持在对话中执行代码：

- 运行 Python 代码验证结果
- 生成数据可视化
- 解决数学问题

### 3. Google 搜索集成[​](/wiki/models/gemini-series#3-google-搜索集成 "3. Google 搜索集成的直接链接")

可以实时搜索获取最新信息：

- 回答时事问题
- 获取实时数据
- 验证事实准确性

## 与其他模型对比[​](/wiki/models/gemini-series#与其他模型对比 "与其他模型对比的直接链接")

| 特性 | Gemini 2.5 Flash | GPT-4o | Claude 3.5 Sonnet |
| --- | --- | --- | --- |
| 上下文窗口 | 1M | 128K | 200K |
| 多模态 | 原生 | ✅ | ✅ |
| 响应速度 | 极快 | 快 | 快 |
| 成本 | 极低 | 中等 | 中等 |
| 视频理解 | ✅ | ❌ | ❌ |

## 最佳实践[​](/wiki/models/gemini-series#最佳实践 "最佳实践的直接链接")

1. **利用超长上下文：** 一次性处理整个项目或文档
2. **多模态任务：** 图文混合、视频分析首选 Gemini
3. **选择合适版本：** 简单任务用 Flash，复杂任务用 Pro
4. **成本优化：** Gemini Flash 是高并发场景的最佳选择


---

> 本页内容来自文档知识库整理，已按 ArmNet 字元服务 服务命名统一更新。
