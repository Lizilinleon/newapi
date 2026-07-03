---
{
  "title": "Sora Image 生图 API",
  "source_url": "https://docs.weelinking.com/docs/api-capabilities/sora-image-generation",
  "description": "通过 weelinking 大模型API中转服务调用 Sora Image 文本生图，简单高效",
  "fetched_at": "2026-07-02T06:35:07.842128+00:00"
}
---

# Sora Image 生图 API

Sora Image Generation API 使用逆向工程模型 (来自 sora.chatgpt.com) 提供文本生图功能。通过对话补全接口调用，实现高性价比生图。

## 核心特性[​](https://docs.weelinking.com/docs/api-capabilities/sora-image-generation#核心特性 "核心特性的直接链接")

- **模型支持**：`sora_image`, `gpt-4o-image`.
- **宽高比**：支持 2:3, 3:2, 1:1。
- **调用方式**：标准的 Chat Completion API。

## 使用方法[​](https://docs.weelinking.com/docs/api-capabilities/sora-image-generation#使用方法 "使用方法的直接链接")

通过在 Prompt 中添加标签来指定宽高比，例如 `【2:3】`。

### Python 示例[​](https://docs.weelinking.com/docs/api-capabilities/sora-image-generation#python-示例 "Python 示例的直接链接")

```
from openai import OpenAI  
  
client = OpenAI(  
    api_key="YOUR_API_KEY",  
    base_url="https://api.weelinking.com/v1"  
)  
  
response = client.chat.completions.create(  
    model="sora_image",  
    messages=[  
        {"role": "user", "content": "A cyberpunk street scene 【16:9】"}  
    ]  
)  
  
# 图片 URL 通常在 content 中返回，或者是 markdown 格式  
print(response.choices[0].message.content)
```

## 注意事项[​](https://docs.weelinking.com/docs/api-capabilities/sora-image-generation#注意事项 "注意事项的直接链接")

- **频率限制**：10 次/分钟。
- **Prompt 长度**：限制 500 字符。
