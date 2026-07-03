---
{
  "title": "文本生成（对话补全）",
  "source_url": "https://docs.weelinking.com/docs/api-capabilities/text-generation",
  "description": "weelinking 大模型API中转平台提供 200+ 热门 AI 模型的统一对话补全接口",
  "fetched_at": "2026-07-02T06:35:03.230490+00:00"
}
---

# 文本生成（对话补全）

文本生成 (Chat Completions) 是 weelinking 平台的核心功能，支持调用 200+ 热门 AI 模型，包括 OpenAI GPT-4, Claude, Gemini, DeepSeek, Qwen 等。

## 核心参数[​](https://docs.weelinking.com/docs/api-capabilities/text-generation#核心参数 "核心参数的直接链接")

- `model` (必填): 指定 AI 模型 ID。
- `messages` (必填): 对话历史，包含 `role` 和 `content`。
- `temperature` (可选): 控制随机性 (0.0 - 2.0)。
- `max_tokens` (可选): 限制输出长度。
- `stream` (可选): 是否流式输出。

## 代码示例[​](https://docs.weelinking.com/docs/api-capabilities/text-generation#代码示例 "代码示例的直接链接")

### Python (多轮对话)[​](https://docs.weelinking.com/docs/api-capabilities/text-generation#python-多轮对话 "Python (多轮对话)的直接链接")

```
from openai import OpenAI  
  
client = OpenAI(  
    api_key="YOUR_API_KEY",  
    base_url="https://api.weelinking.com/v1"  
)  
  
response = client.chat.completions.create(  
    model="gpt-4o",  
    messages=[  
        {"role": "system", "content": "You are a helpful assistant."},  
        {"role": "user", "content": "Who won the world series in 2020?"},  
        {"role": "assistant", "content": "The Los Angeles Dodgers won the World Series in 2020."},  
        {"role": "user", "content": "Where was it played?"}  
    ]  
)  
  
print(response.choices[0].message.content)
```

## 最佳实践[​](https://docs.weelinking.com/docs/api-capabilities/text-generation#最佳实践 "最佳实践的直接链接")

- **系统提示词 (System Prompt)**: 使用 system role 定义 AI 的行为和角色。
- **上下文管理**: 对于长对话，适时清理旧的历史记录以节省 Token。
- **流式输出**: 对于长文本生成，建议开启 stream 模式以提升用户体验。
