---
{
  "title": "Nano Banana Pro 图片生成",
  "source_url": "https://docs.weelinking.com/docs/api-capabilities/nano-banana-image",
  "description": "通过 weelinking 大模型API中转服务调用 Nano Banana Pro 生成 4K 高清图像",
  "fetched_at": "2026-07-02T06:34:38.766999+00:00"
}
---

# Nano Banana Pro 图片生成

Nano Banana Pro Image Generation API (代号 Nano Banana) 基于 Google 的 Gemini 2.5 Flash Image 模型。支持自定义分辨率 (1K, 2K, 4K)、10 种宽高比，生成速度约 10 秒。

最新版本 **Nano Banana Pro** (`gemini-3-pro-image-preview`) 于 2025 年 11 月 20 日发布，基于 Gemini 3 Pro，提供更强的推理能力、4K 高清图像生成、卓越的文本渲染和高级局部编辑功能。

## 核心特性[​](https://docs.weelinking.com/docs/api-capabilities/nano-banana-image#核心特性 "核心特性的直接链接")

- **模型版本**：
  - `gemini-3-pro-image-preview` (Nano Banana Pro): 4K 高清，强推理。
  - `gemini-2.5-flash-image`: 快速生成。
- **分辨率支持**：1K, 2K, 4K。
- **宽高比**：支持 10 种宽高比。
- **调用方式**：
  - **Google 原生格式**：支持完整功能和自定义分辨率。
  - **OpenAI 兼容模式**：默认 1:1 宽高比，适合现有代码迁移。

## 价格优势[​](https://docs.weelinking.com/docs/api-capabilities/nano-banana-image#价格优势 "价格优势的直接链接")

相比 Google 官方定价，使用 weelinking 可节省大量成本。

## 代码示例[​](https://docs.weelinking.com/docs/api-capabilities/nano-banana-image#代码示例 "代码示例的直接链接")

### OpenAI 兼容模式 (Python)[​](https://docs.weelinking.com/docs/api-capabilities/nano-banana-image#openai-兼容模式-python "OpenAI 兼容模式 (Python)的直接链接")

```
from openai import OpenAI  
  
client = OpenAI(  
    api_key="YOUR_API_KEY",  
    base_url="https://api.weelinking.com/v1"  
)  
  
response = client.images.generate(  
    model="gemini-3-pro-image-preview",  
    prompt="A cute nano banana character, 4k resolution",  
    n=1,  
    size="1024x1024"  
)  
  
print(response.data[0].url)
```
