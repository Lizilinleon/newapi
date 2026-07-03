---
title: "文心一言"
description: "文心一言模型介绍，可通过 ArmNet 字元服务 大模型API中转服务便捷调用"
lastUpdated: true
---

# 文心一言

文心一言（ERNIE Bot）是百度基于文心大模型开发的生成式 AI 产品，是中国最早推出的类 ChatGPT 产品之一。

## 发展历程[​](/wiki/models/wenxin-yiyan#发展历程 "发展历程的直接链接")

| 版本 | 发布时间 | 主要特点 |
| --- | --- | --- |
| ERNIE 1.0 | 2019年3月 | 知识增强预训练 |
| ERNIE 2.0 | 2019年7月 | 持续学习框架 |
| ERNIE 3.0 | 2021年7月 | 统一框架，千亿参数 |
| 文心一言 | 2023年3月 | 首个中国大模型产品 |
| ERNIE 3.5 | 2023年6月 | 能力大幅提升 |
| ERNIE 4.0 | 2023年10月 | 对标 GPT-4 |
| ERNIE 4.0 Turbo | 2024年 | 速度优化版 |
| ERNIE 4.5 | 2025年 | 最新版本 |

## 核心特点[​](/wiki/models/wenxin-yiyan#核心特点 "核心特点的直接链接")

### 1. 知识增强[​](/wiki/models/wenxin-yiyan#1-知识增强 "1. 知识增强的直接链接")

ERNIE 的核心创新是知识增强：

- 融合知识图谱
- 实体级理解能力
- 更准确的事实性回答

### 2. 百度生态集成[​](/wiki/models/wenxin-yiyan#2-百度生态集成 "2. 百度生态集成的直接链接")

深度集成百度产品和服务：

- 百度搜索
- 百度地图
- 百度文库
- 智能云服务

### 3. 多模态能力[​](/wiki/models/wenxin-yiyan#3-多模态能力 "3. 多模态能力的直接链接")

支持多种模态的理解和生成：

- 文本生成
- 图像理解
- 图像生成
- 语音交互

## 当前主力模型[​](/wiki/models/wenxin-yiyan#当前主力模型 "当前主力模型的直接链接")

### ERNIE 4.5[​](/wiki/models/wenxin-yiyan#ernie-45 "ERNIE 4.5的直接链接")

- **模型 ID：** `ernie-4.5`
- **特点：** 最新旗舰，综合能力最强
- **适用场景：** 复杂任务、专业应用

### ERNIE 4.0 Turbo[​](/wiki/models/wenxin-yiyan#ernie-40-turbo "ERNIE 4.0 Turbo的直接链接")

- **模型 ID：** `ernie-4.0-turbo`
- **特点：** 速度快，性能强
- **适用场景：** 企业级应用、实时交互

### ERNIE 4.0[​](/wiki/models/wenxin-yiyan#ernie-40 "ERNIE 4.0的直接链接")

- **模型 ID：** `ernie-4.0`
- **特点：** 稳定可靠
- **适用场景：** 通用对话、内容创作

### ERNIE Speed[​](/wiki/models/wenxin-yiyan#ernie-speed "ERNIE Speed的直接链接")

- **模型 ID：** `ernie-speed`
- **特点：** 极速响应、免费调用
- **适用场景：** 简单任务、测试开发

### ERNIE Lite[​](/wiki/models/wenxin-yiyan#ernie-lite "ERNIE Lite的直接链接")

- **模型 ID：** `ernie-lite`
- **特点：** 轻量级、低成本
- **适用场景：** 高并发场景

## API 调用示例[​](/wiki/models/wenxin-yiyan#api-调用示例 "API 调用示例的直接链接")

```
from openai import OpenAI  
  
client = OpenAI(  
    api_key="your-api-key",  
    base_url="http://122.51.35.238:5170/v1"  
)  
  
response = client.chat.completions.create(  
    model="ernie-4.0-turbo",  
    messages=[  
        {"role": "user", "content": "介绍一下唐朝的诗歌文化"}  
    ],  
    temperature=0.7  
)  
  
print(response.choices[0].message.content)
```

## 文心一言的独特能力[​](/wiki/models/wenxin-yiyan#文心一言的独特能力 "文心一言的独特能力的直接链接")

### 1. 知识问答[​](/wiki/models/wenxin-yiyan#1-知识问答 "1. 知识问答的直接链接")

基于知识图谱的精准问答：

- 实体识别准确
- 关系推理正确
- 事实性回答可靠

### 2. 中文创作[​](/wiki/models/wenxin-yiyan#2-中文创作 "2. 中文创作的直接链接")

优秀的中文写作能力：

- 诗词创作
- 文案写作
- 小说创作

### 3. 多插件支持[​](/wiki/models/wenxin-yiyan#3-多插件支持 "3. 多插件支持的直接链接")

支持丰富的插件生态：

- 百度搜索插件
- 文档解析插件
- 图像生成插件

## 与其他模型对比[​](/wiki/models/wenxin-yiyan#与其他模型对比 "与其他模型对比的直接链接")

| 特性 | ERNIE 4.0 | GPT-4o | Qwen-2.5 |
| --- | --- | --- | --- |
| 中文能力 | 极强 | 强 | 极强 |
| 知识增强 | ✅ | ❌ | ❌ |
| 搜索集成 | ✅ | ❌ | ❌ |
| 生态集成 | 百度全家桶 | 有限 | 阿里云 |

## 最佳实践[​](/wiki/models/wenxin-yiyan#最佳实践 "最佳实践的直接链接")

1. **知识问答：** 需要准确事实的场景
2. **中文创作：** 诗词、文案等创作任务
3. **百度生态：** 已使用百度产品的企业
4. **快速测试：** 使用免费的 ERNIE Speed


---

> 本页内容来自文档知识库整理，已按 ArmNet 字元服务 服务命名统一更新。
