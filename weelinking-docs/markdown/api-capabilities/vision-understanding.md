---
{
  "title": "图像理解（识图）API",
  "source_url": "https://docs.weelinking.com/docs/api-capabilities/vision-understanding",
  "description": "通过 weelinking 大模型API中转服务调用 GPT-4o、Gemini 等模型进行图像识别与分析",
  "fetched_at": "2026-07-02T06:35:02.501319+00:00"
}
---

# 图像理解（识图）API

图像理解 API (Vision) 支持使用 GPT-4o, Gemini 2.5 Pro, Claude 3.5 Sonnet 等先进模型进行图像内容分析、OCR 文字识别和场景描述。

## 支持模型[​](https://docs.weelinking.com/docs/api-capabilities/vision-understanding#支持模型 "支持模型的直接链接")

- **OpenAI**: `gpt-4o`, `gpt-4o-mini`, `gpt-4.1-mini`
- **Google**: `gemini-2.5-pro`, `gemini-2.5-flash`
- **Anthropic**: `claude-3-5-sonnet-20241022`

## 使用方式[​](https://docs.weelinking.com/docs/api-capabilities/vision-understanding#使用方式 "使用方式的直接链接")

通过 Chat Completions API 的 `image_url` 字段传入图片（URL 或 Base64）。

## Python 示例[​](https://docs.weelinking.com/docs/api-capabilities/vision-understanding#python-示例 "Python 示例的直接链接")

```
from openai import OpenAI  
  
client = OpenAI(  
    api_key="YOUR_API_KEY",  
    base_url="https://api.weelinking.com/v1"  
)  
  
response = client.chat.completions.create(  
    model="gpt-4o",  
    messages=[  
        {  
            "role": "user",  
            "content": [  
                {"type": "text", "text": "这张图片里有什么？"},  
                {  
                    "type": "image_url",  
                    "image_url": {  
                        "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Gfp-wisconsin-madison-the-nature-boardwalk.jpg/2560px-Gfp-wisconsin-madison-the-nature-boardwalk.jpg"  
                    }  
                }  
            ]  
        }  
    ],  
    max_tokens=300  
)  
  
print(response.choices[0].message.content)
```
