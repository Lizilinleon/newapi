---
{
  "title": "Sora Image 图片编辑 API",
  "source_url": "https://docs.weelinking.com/docs/api-capabilities/sora-image-edit",
  "description": "通过 weelinking 大模型API中转服务调用 Sora Image 智能图像编辑功能",
  "fetched_at": "2026-07-02T06:35:08.577912+00:00"
}
---

# Sora Image 图片编辑 API

Sora Image 图片编辑 API 利用 Sora 官网的图生图技术，提供强大的图像编辑和转换功能。

## 核心特性[​](https://docs.weelinking.com/docs/api-capabilities/sora-image-edit#核心特性 "核心特性的直接链接")

- **智能编辑**：通过自然语言指令修改图片。
- **多图融合**：支持将多张图片融合为一张。

## 使用场景[​](https://docs.weelinking.com/docs/api-capabilities/sora-image-edit#使用场景 "使用场景的直接链接")

- **风格迁移**：将图片转换为动漫、素描等风格。
- **背景替换**：智能移除或替换背景。
- **物体编辑**：添加、删除或修改画面中的物体。

## Python 示例 (单图编辑)[​](https://docs.weelinking.com/docs/api-capabilities/sora-image-edit#python-示例-单图编辑 "Python 示例 (单图编辑)的直接链接")

需使用多模态对话接口调用：

```
from openai import OpenAI  
  
client = OpenAI(  
    api_key="YOUR_API_KEY",  
    base_url="https://api.weelinking.com/v1"  
)  
  
response = client.chat.completions.create(  
    model="sora_image",  
    messages=[  
        {  
            "role": "user",  
            "content": [  
                {"type": "text", "text": "Turn this into an oil painting"},  
                {"type": "image_url", "image_url": {"url": "https://example.com/image.jpg"}}  
            ]  
        }  
    ]  
)  
print(response.choices[0].message.content)
```
