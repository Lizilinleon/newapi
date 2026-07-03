---
title: "视频理解 API"
description: "通过 ArmNet 字元服务 大模型API中转服务调用 Gemini 2.5 Pro 实现智能视频内容分析"
lastUpdated: true
---

# 视频理解 API

视频理解 API (Video Understanding) 基于 Gemini 2.5 Pro 等先进模型，提供视频内容识别、场景描述和动作分析功能。

## 核心特性[​](/api-capabilities/video-understanding#核心特性 "核心特性的直接链接")

- **模型支持**：
  - `gemini-2.5-pro`: 复杂分析。
  - `gemini-2.5-flash`: 快速、高性价比。
- **输入方式**：支持 Base64 编码的视频文件 (推荐 20MB 以内)。
- **中文优化**：针对中文语境进行了优化。

## 使用场景[​](/api-capabilities/video-understanding#使用场景 "使用场景的直接链接")

- 视频内容总结
- 教育视频分析
- 监控视频分析
- 营销视频评估

## 代码示例 (Python)[​](/api-capabilities/video-understanding#代码示例-python "代码示例 (Python)的直接链接")

```
import base64  
from openai import OpenAI  
  
# 读取视频并转为 Base64  
video_path = "path/to/video.mp4"  
with open(video_path, "rb") as video_file:  
    video_base64 = base64.b64encode(video_file.read()).decode('utf-8')  
  
client = OpenAI(  
    api_key="YOUR_API_KEY",  
    base_url="http://122.51.35.238:5170/v1"  
)  
  
response = client.chat.completions.create(  
    model="gemini-1.5-pro", # 使用支持视频理解的模型  
    messages=[  
        {  
            "role": "user",  
            "content": [  
                {"type": "text", "text": "Describe this video in detail."},  
                {  
                    "type": "image_url", # 注意：部分库可能需要特定的视频类型字段，或复用image_url传入base64  
                    "image_url": {  
                        "url": f"data:video/mp4;base64,{video_base64}"  
                    }  
                }  
            ]  
        }  
    ]  
)  
  
print(response.choices[0].message.content)
```

> 注意：具体传入视频的方式请参考最新的 OpenAI 兼容多模态格式文档，通常涉及将视频作为 Base64 数据或 URL 传入。


---

> 本页内容来自文档知识库整理，已按 ArmNet 字元服务 服务命名统一更新。
