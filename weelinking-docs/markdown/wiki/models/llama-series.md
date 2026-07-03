---
{
  "title": "LLaMA 系列",
  "source_url": "https://docs.weelinking.com/docs/wiki/models/llama-series",
  "description": "Llama 系列模型介绍，可通过 weelinking 大模型API中转服务便捷调用",
  "fetched_at": "2026-07-02T06:35:13.072213+00:00"
}
---

# LLaMA 系列

LLaMA（Large Language Model Meta AI）是 Meta（原 Facebook）开发的开源大语言模型系列，是目前最强大的开源 LLM 家族。

## 发展历程[​](https://docs.weelinking.com/docs/wiki/models/llama-series#发展历程 "发展历程的直接链接")

| 版本 | 发布时间 | 参数规格 | 主要特点 |
| --- | --- | --- | --- |
| LLaMA 1 | 2023年2月 | 7B-65B | 首个版本，研究用途 |
| LLaMA 2 | 2023年7月 | 7B-70B | 商用开源，Chat 版本 |
| Code Llama | 2023年8月 | 7B-34B | 专注代码生成 |
| LLaMA 3 | 2024年4月 | 8B-70B | 大幅性能提升 |
| LLaMA 3.1 | 2024年7月 | 8B-405B | 128K 上下文，超大规模 |
| LLaMA 3.2 | 2024年9月 | 1B-90B | 多模态能力 |
| LLaMA 3.3 | 2024年12月 | 70B | 媲美 405B 的能力 |
| LLaMA 4 | 2025年4月 | Scout/Maverick | 新一代架构 |

## 核心特点[​](https://docs.weelinking.com/docs/wiki/models/llama-series#核心特点 "核心特点的直接链接")

### 1. 完全开源[​](https://docs.weelinking.com/docs/wiki/models/llama-series#1-完全开源 "1. 完全开源的直接链接")

LLaMA 是真正意义上的开源模型：

- 开放模型权重
- 允许商业使用（需遵守许可证）
- 可以自由微调和部署
- 推动了开源 AI 生态发展

### 2. 高效架构[​](https://docs.weelinking.com/docs/wiki/models/llama-series#2-高效架构 "2. 高效架构的直接链接")

LLaMA 在相同参数量下表现更优：

- 优化的 Transformer 架构
- 更高效的训练方法
- 更好的推理效率

### 3. 多规格选择[​](https://docs.weelinking.com/docs/wiki/models/llama-series#3-多规格选择 "3. 多规格选择的直接链接")

提供多种参数规格满足不同需求：

- **小型（1B-8B）：** 边缘设备、移动端
- **中型（70B）：** 服务器部署、通用任务
- **大型（405B）：** 最强能力、研究用途

## 当前主力模型[​](https://docs.weelinking.com/docs/wiki/models/llama-series#当前主力模型 "当前主力模型的直接链接")

### LLaMA 3.3 70B[​](https://docs.weelinking.com/docs/wiki/models/llama-series#llama-33-70b "LLaMA 3.3 70B的直接链接")

- **模型 ID：** `llama-3.3-70b`
- **上下文窗口：** 128K tokens
- **特点：** 开源最强，媲美闭源模型
- **适用场景：** 企业部署、复杂任务

### LLaMA 3.1 405B[​](https://docs.weelinking.com/docs/wiki/models/llama-series#llama-31-405b "LLaMA 3.1 405B的直接链接")

- **模型 ID：** `llama-3.1-405b`
- **上下文窗口：** 128K tokens
- **特点：** 参数量最大，能力最强
- **适用场景：** 科研、高端应用

### LLaMA 3.2 90B Vision[​](https://docs.weelinking.com/docs/wiki/models/llama-series#llama-32-90b-vision "LLaMA 3.2 90B Vision的直接链接")

- **模型 ID：** `llama-3.2-90b-vision`
- **上下文窗口：** 128K tokens
- **特点：** 多模态能力，图像理解
- **适用场景：** 图文分析、多模态任务

### LLaMA 3.1 8B[​](https://docs.weelinking.com/docs/wiki/models/llama-series#llama-31-8b "LLaMA 3.1 8B的直接链接")

- **模型 ID：** `llama-3.1-8b`
- **上下文窗口：** 128K tokens
- **特点：** 轻量高效，易于部署
- **适用场景：** 本地部署、边缘计算

## API 调用示例[​](https://docs.weelinking.com/docs/wiki/models/llama-series#api-调用示例 "API 调用示例的直接链接")

```
from openai import OpenAI  
  
client = OpenAI(  
    api_key="your-api-key",  
    base_url="https://api.weelinking.com/v1"  
)  
  
response = client.chat.completions.create(  
    model="llama-3.3-70b",  
    messages=[  
        {"role": "system", "content": "你是一个专业的技术助手。"},  
        {"role": "user", "content": "解释容器化技术的优势"}  
    ],  
    temperature=0.7  
)  
  
print(response.choices[0].message.content)
```

## LLaMA 的生态系统[​](https://docs.weelinking.com/docs/wiki/models/llama-series#llama-的生态系统 "LLaMA 的生态系统的直接链接")

### 1. 衍生模型[​](https://docs.weelinking.com/docs/wiki/models/llama-series#1-衍生模型 "1. 衍生模型的直接链接")

基于 LLaMA 微调的优秀模型：

- **Vicuna：** 对话优化版本
- **Alpaca：** 指令微调版本
- **WizardLM：** 复杂指令增强
- **Chinese-LLaMA：** 中文增强版

### 2. 部署工具[​](https://docs.weelinking.com/docs/wiki/models/llama-series#2-部署工具 "2. 部署工具的直接链接")

- **Ollama：** 本地一键部署
- **vLLM：** 高性能推理引擎
- **llama.cpp：** CPU 推理优化
- **Text Generation Inference：** HuggingFace 推理服务

### 3. 微调框架[​](https://docs.weelinking.com/docs/wiki/models/llama-series#3-微调框架 "3. 微调框架的直接链接")

- **PEFT：** 参数高效微调
- **LoRA：** 低秩适应
- **QLoRA：** 量化 LoRA

## 与其他模型对比[​](https://docs.weelinking.com/docs/wiki/models/llama-series#与其他模型对比 "与其他模型对比的直接链接")

| 特性 | LLaMA 3.3 70B | GPT-4o | Claude 3.5 |
| --- | --- | --- | --- |
| 开源 | ✅ | ❌ | ❌ |
| 本地部署 | ✅ | ❌ | ❌ |
| 上下文窗口 | 128K | 128K | 200K |
| 综合能力 | 极强 | 极强 | 极强 |
| 成本控制 | 灵活 | API 计费 | API 计费 |

## 最佳实践[​](https://docs.weelinking.com/docs/wiki/models/llama-series#最佳实践 "最佳实践的直接链接")

1. **选择合适规格：** 根据硬件和需求选择参数量
2. **考虑量化：** 使用 4-bit/8-bit 量化降低显存需求
3. **微调定制：** 针对特定任务微调获得更好效果
4. **多模态场景：** 使用 3.2 Vision 版本处理图像
