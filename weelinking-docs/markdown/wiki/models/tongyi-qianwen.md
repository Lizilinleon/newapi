---
{
  "title": "通义千问",
  "source_url": "https://docs.weelinking.com/docs/wiki/models/tongyi-qianwen",
  "description": "通义千问模型介绍，可通过 weelinking 大模型API中转服务便捷调用",
  "fetched_at": "2026-07-02T06:35:14.604324+00:00"
}
---

# 通义千问

通义千问（Qwen）是阿里云开发的大语言模型系列，是中国最具影响力的开源 AI 模型之一。

## 发展历程[​](https://docs.weelinking.com/docs/wiki/models/tongyi-qianwen#发展历程 "发展历程的直接链接")

| 版本 | 发布时间 | 主要特点 |
| --- | --- | --- |
| Qwen-7B | 2023年8月 | 首个开源版本 |
| Qwen-72B | 2023年11月 | 大参数版本 |
| Qwen-1.5 | 2024年2月 | 多语言增强 |
| Qwen-2 | 2024年6月 | 架构升级，性能提升 |
| Qwen-2.5 | 2024年9月 | 全面能力提升 |
| QwQ | 2024年11月 | 推理模型 |
| Qwen-3 | 2025年4月 | 最新一代 |

## 核心特点[​](https://docs.weelinking.com/docs/wiki/models/tongyi-qianwen#核心特点 "核心特点的直接链接")

### 1. 完整的模型矩阵[​](https://docs.weelinking.com/docs/wiki/models/tongyi-qianwen#1-完整的模型矩阵 "1. 完整的模型矩阵的直接链接")

通义千问提供完整的模型规格：

- **文本模型：** 0.5B 到 72B 多种规格
- **多模态模型：** Qwen-VL 系列
- **代码模型：** Qwen-Coder 系列
- **数学模型：** Qwen-Math 系列
- **音频模型：** Qwen-Audio 系列

### 2. 多语言能力[​](https://docs.weelinking.com/docs/wiki/models/tongyi-qianwen#2-多语言能力 "2. 多语言能力的直接链接")

Qwen 支持 29+ 种语言：

- 中文能力业界领先
- 英文能力与国际顶尖模型持平
- 支持多种小语种

### 3. 开源生态[​](https://docs.weelinking.com/docs/wiki/models/tongyi-qianwen#3-开源生态 "3. 开源生态的直接链接")

- 完整开放模型权重
- Apache 2.0 许可证
- 支持商业使用

## 当前主力模型[​](https://docs.weelinking.com/docs/wiki/models/tongyi-qianwen#当前主力模型 "当前主力模型的直接链接")

### Qwen-3 72B[​](https://docs.weelinking.com/docs/wiki/models/tongyi-qianwen#qwen-3-72b "Qwen-3 72B的直接链接")

- **模型 ID：** `qwen-3-72b`
- **上下文窗口：** 128K tokens
- **特点：** 最新旗舰，综合能力最强
- **适用场景：** 复杂任务、专业应用

### Qwen-2.5 72B[​](https://docs.weelinking.com/docs/wiki/models/tongyi-qianwen#qwen-25-72b "Qwen-2.5 72B的直接链接")

- **模型 ID：** `qwen-2.5-72b`
- **上下文窗口：** 128K tokens
- **特点：** 稳定可靠，性能出色
- **适用场景：** 企业级应用

### Qwen-2.5 Coder 32B[​](https://docs.weelinking.com/docs/wiki/models/tongyi-qianwen#qwen-25-coder-32b "Qwen-2.5 Coder 32B的直接链接")

- **模型 ID：** `qwen-2.5-coder-32b`
- **上下文窗口：** 128K tokens
- **特点：** 代码能力顶尖
- **适用场景：** 编程开发、代码审查

### Qwen-VL-Max[​](https://docs.weelinking.com/docs/wiki/models/tongyi-qianwen#qwen-vl-max "Qwen-VL-Max的直接链接")

- **模型 ID：** `qwen-vl-max`
- **特点：** 多模态理解能力强
- **适用场景：** 图像理解、文档分析

### QwQ 32B[​](https://docs.weelinking.com/docs/wiki/models/tongyi-qianwen#qwq-32b "QwQ 32B的直接链接")

- **模型 ID：** `qwq-32b`
- **上下文窗口：** 128K tokens
- **特点：** 深度推理能力
- **适用场景：** 数学推理、复杂问题

## API 调用示例[​](https://docs.weelinking.com/docs/wiki/models/tongyi-qianwen#api-调用示例 "API 调用示例的直接链接")

```
from openai import OpenAI  
  
client = OpenAI(  
    api_key="your-api-key",  
    base_url="https://api.weelinking.com/v1"  
)  
  
response = client.chat.completions.create(  
    model="qwen-2.5-72b",  
    messages=[  
        {"role": "system", "content": "你是通义千问，一个有帮助的AI助手。"},  
        {"role": "user", "content": "介绍一下中国的四大发明"}  
    ],  
    temperature=0.7  
)  
  
print(response.choices[0].message.content)
```

## 通义千问的独特能力[​](https://docs.weelinking.com/docs/wiki/models/tongyi-qianwen#通义千问的独特能力 "通义千问的独特能力的直接链接")

### 1. 中文能力[​](https://docs.weelinking.com/docs/wiki/models/tongyi-qianwen#1-中文能力 "1. 中文能力的直接链接")

- 古文理解和翻译
- 中文写作和创作
- 中文专业术语

### 2. 长上下文处理[​](https://docs.weelinking.com/docs/wiki/models/tongyi-qianwen#2-长上下文处理 "2. 长上下文处理的直接链接")

- 支持 128K tokens
- 长文档理解和总结
- 多轮长对话记忆

### 3. 工具调用[​](https://docs.weelinking.com/docs/wiki/models/tongyi-qianwen#3-工具调用 "3. 工具调用的直接链接")

支持丰富的工具调用：

- 代码执行
- 网页浏览
- 文件处理

## 与其他模型对比[​](https://docs.weelinking.com/docs/wiki/models/tongyi-qianwen#与其他模型对比 "与其他模型对比的直接链接")

| 特性 | Qwen-2.5 72B | GPT-4o | LLaMA 3.3 70B |
| --- | --- | --- | --- |
| 中文能力 | 极强 | 强 | 一般 |
| 开源 | ✅ | ❌ | ✅ |
| 代码能力 | 强 | 极强 | 强 |
| 多模态 | ✅ | ✅ | ✅ |

## 最佳实践[​](https://docs.weelinking.com/docs/wiki/models/tongyi-qianwen#最佳实践 "最佳实践的直接链接")

1. **中文场景：** 中文任务首选通义千问
2. **代码任务：** 使用 Qwen-Coder 系列
3. **推理任务：** 使用 QwQ 模型
4. **多模态：** 使用 Qwen-VL 系列处理图像
