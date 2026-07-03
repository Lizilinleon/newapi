---
{
  "title": "GPT-Image-1 生成图片",
  "source_url": "https://docs.weelinking.com/docs/api-capabilities/gpt-image-1",
  "description": "通过 weelinking 大模型API中转服务调用 GPT-Image-1，OpenAI 官方图像生成接口",
  "fetched_at": "2026-07-02T06:35:09.304574+00:00"
}
---

# GPT-Image-1 生成图片

GPT-Image-1 是 OpenAI 最新的图像生成 API，weelinking 提供全量支持。相比 DALL·E 3，它提供了更高的性价比和更灵活的计费方式（按 Token 或按张）。

## 核心特性[​](https://docs.weelinking.com/docs/api-capabilities/gpt-image-1#核心特性 "核心特性的直接链接")

- **模型**：
  - `gpt-image-1`: 标准版
  - `gpt-image-1-mini`: 轻量版
- **计费**：支持按 Token 计费或按张计费。
- **兼容性**：完全兼容 OpenAI Images API 格式。

## Python 示例[​](https://docs.weelinking.com/docs/api-capabilities/gpt-image-1#python-示例 "Python 示例的直接链接")

```
from openai import OpenAI  
  
client = OpenAI(  
    api_key="YOUR_API_KEY",  
    base_url="https://api.weelinking.com/v1"  
)  
  
response = client.images.generate(  
    model="gpt-image-1",  
    prompt="A futuristic city, cyberpunk style",  
    n=1,  
    size="1024x1024",  
    quality="standard"  
)  
  
print(response.data[0].url)
```

## 与 Sora Image 对比[​](https://docs.weelinking.com/docs/api-capabilities/gpt-image-1#与-sora-image-对比 "与 Sora Image 对比的直接链接")

| 特性 | GPT-Image-1 | Sora Image |
| --- | --- | --- |
| 技术路线 | Diffusion Transformer | 逆向工程 |
| 稳定性 | 极高 (官方 API) | 高 |
| 价格 | 较高 (按 Token/张) | 较低 (按张计费) |
