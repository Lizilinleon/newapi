---
{
  "title": "GLM 智谱系列",
  "source_url": "https://docs.weelinking.com/docs/wiki/models/glm-zhipu",
  "description": "GLM 智谱模型介绍，可通过 weelinking 大模型API中转服务便捷调用",
  "fetched_at": "2026-07-02T06:35:15.376411+00:00"
}
---

# GLM 智谱系列

GLM（General Language Model）是由智谱 AI 开发的大语言模型系列，基于清华大学的研究成果，是中国领先的 AI 模型之一。

## 发展历程[​](https://docs.weelinking.com/docs/wiki/models/glm-zhipu#发展历程 "发展历程的直接链接")

| 版本 | 发布时间 | 主要特点 |
| --- | --- | --- |
| GLM-130B | 2022年8月 | 首个开源千亿模型 |
| ChatGLM | 2023年3月 | 对话优化版本 |
| ChatGLM2 | 2023年6月 | 性能大幅提升 |
| ChatGLM3 | 2023年10月 | 工具调用能力 |
| GLM-4 | 2024年1月 | 多模态能力 |
| GLM-4-Plus | 2024年8月 | 能力增强版 |
| GLM-4V | 2024年 | 视觉理解版本 |

## 核心特点[​](https://docs.weelinking.com/docs/wiki/models/glm-zhipu#核心特点 "核心特点的直接链接")

### 1. 独特的 GLM 架构[​](https://docs.weelinking.com/docs/wiki/models/glm-zhipu#1-独特的-glm-架构 "1. 独特的 GLM 架构的直接链接")

GLM 采用自回归空白填充的预训练方式：

- 结合自回归和自编码的优点
- 更好的上下文理解能力
- 灵活的生成控制

### 2. 中文理解能力[​](https://docs.weelinking.com/docs/wiki/models/glm-zhipu#2-中文理解能力 "2. 中文理解能力的直接链接")

GLM 在中文 NLP 任务中表现优异：

- 中文语义理解精准
- 中文写作能力出色
- 支持中文工具调用

### 3. 工具调用（Function Calling）[​](https://docs.weelinking.com/docs/wiki/models/glm-zhipu#3-工具调用function-calling "3. 工具调用（Function Calling）的直接链接")

GLM 系列对工具调用有出色支持：

- 代码解释器
- 网页浏览
- 图像生成

## 当前主力模型[​](https://docs.weelinking.com/docs/wiki/models/glm-zhipu#当前主力模型 "当前主力模型的直接链接")

### GLM-4-Plus[​](https://docs.weelinking.com/docs/wiki/models/glm-zhipu#glm-4-plus "GLM-4-Plus的直接链接")

- **模型 ID：** `glm-4-plus`
- **上下文窗口：** 128K tokens
- **特点：** 最强能力，企业级应用
- **适用场景：** 复杂任务、专业应用

### GLM-4[​](https://docs.weelinking.com/docs/wiki/models/glm-zhipu#glm-4 "GLM-4的直接链接")

- **模型 ID：** `glm-4`
- **上下文窗口：** 128K tokens
- **特点：** 均衡性能与成本
- **适用场景：** 通用对话、内容创作

### GLM-4V[​](https://docs.weelinking.com/docs/wiki/models/glm-zhipu#glm-4v "GLM-4V的直接链接")

- **模型 ID：** `glm-4v`
- **特点：** 视觉理解能力
- **适用场景：** 图像分析、多模态任务

### GLM-4-Flash[​](https://docs.weelinking.com/docs/wiki/models/glm-zhipu#glm-4-flash "GLM-4-Flash的直接链接")

- **模型 ID：** `glm-4-flash`
- **特点：** 快速响应、低成本
- **适用场景：** 高并发、简单任务

## API 调用示例[​](https://docs.weelinking.com/docs/wiki/models/glm-zhipu#api-调用示例 "API 调用示例的直接链接")

```
from openai import OpenAI  
  
client = OpenAI(  
    api_key="your-api-key",  
    base_url="https://api.weelinking.com/v1"  
)  
  
response = client.chat.completions.create(  
    model="glm-4",  
    messages=[  
        {"role": "system", "content": "你是一个专业的AI助手。"},  
        {"role": "user", "content": "解释什么是机器学习中的过拟合"}  
    ],  
    temperature=0.7  
)  
  
print(response.choices[0].message.content)
```

### 工具调用示例[​](https://docs.weelinking.com/docs/wiki/models/glm-zhipu#工具调用示例 "工具调用示例的直接链接")

```
response = client.chat.completions.create(  
    model="glm-4",  
    messages=[  
        {"role": "user", "content": "北京今天的天气怎么样？"}  
    ],  
    tools=[  
        {  
            "type": "function",  
            "function": {  
                "name": "get_weather",  
                "description": "获取指定城市的天气信息",  
                "parameters": {  
                    "type": "object",  
                    "properties": {  
                        "city": {"type": "string", "description": "城市名称"}  
                    },  
                    "required": ["city"]  
                }  
            }  
        }  
    ]  
)
```

## GLM 的独特能力[​](https://docs.weelinking.com/docs/wiki/models/glm-zhipu#glm-的独特能力 "GLM 的独特能力的直接链接")

### 1. CogView 图像生成[​](https://docs.weelinking.com/docs/wiki/models/glm-zhipu#1-cogview-图像生成 "1. CogView 图像生成的直接链接")

GLM 系列集成了 CogView 图像生成：

- 高质量图像生成
- 中文提示词支持
- 多种风格选择

### 2. 代码能力[​](https://docs.weelinking.com/docs/wiki/models/glm-zhipu#2-代码能力 "2. 代码能力的直接链接")

CodeGeeX 代码模型：

- 支持 100+ 编程语言
- IDE 插件支持
- 代码补全和生成

### 3. 智能体能力[​](https://docs.weelinking.com/docs/wiki/models/glm-zhipu#3-智能体能力 "3. 智能体能力的直接链接")

GLM 对 Agent 场景有良好支持：

- 多轮工具调用
- 任务规划
- 自主执行

## 与其他模型对比[​](https://docs.weelinking.com/docs/wiki/models/glm-zhipu#与其他模型对比 "与其他模型对比的直接链接")

| 特性 | GLM-4 | GPT-4o | Qwen-2.5 |
| --- | --- | --- | --- |
| 中文能力 | 极强 | 强 | 极强 |
| 工具调用 | 优秀 | 优秀 | 优秀 |
| 响应速度 | 快 | 快 | 快 |
| 成本 | 中等 | 中等 | 低 |

## 最佳实践[​](https://docs.weelinking.com/docs/wiki/models/glm-zhipu#最佳实践 "最佳实践的直接链接")

1. **工具调用：** GLM 对函数调用有出色支持
2. **中文任务：** 中文理解和生成能力强
3. **快速响应：** 简单任务使用 Flash 版本
4. **多模态：** 图像任务使用 GLM-4V
