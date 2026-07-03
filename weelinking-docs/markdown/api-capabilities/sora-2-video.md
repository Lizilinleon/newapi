---
{
  "title": "Sora 2 视频生成",
  "source_url": "https://docs.weelinking.com/docs/api-capabilities/sora-2-video",
  "description": "通过 weelinking 大模型API中转服务调用 Sora 2 视频生成，音视频同步，无水印输出",
  "fetched_at": "2026-07-02T06:34:38.041578+00:00"
}
---

# Sora 2 视频生成

Sora 2 Video Generation API 是 OpenAI 于 2025 年 10 月 1 日发布的革命性视频生成模型。它支持文生视频和图生视频，具备音视频同步功能，大幅提升了物理真实感，可生成长达 15 秒的连贯叙事视频。

weelinking 提供无邀请码访问，且生成的视频**无水印**。

## 核心特性[​](https://docs.weelinking.com/docs/api-capabilities/sora-2-video#核心特性 "核心特性的直接链接")

- **模型支持**：
  - `sora_video2`：竖屏 (704 × 1280)
  - `sora_video2-landscape`：横屏 (1280 × 704)
  - 15秒版本支持
- **功能**：音视频同步，流式输出进度更新。
- **生成时间**：通常 2-3 分钟 (10秒视频)，总处理时间 2.5-4 分钟。建议设置超时时间至少 5 分钟。
- **存储**：视频在 CDN 保留 1 天，请及时下载。

## 快速开始[​](https://docs.weelinking.com/docs/api-capabilities/sora-2-video#快速开始 "快速开始的直接链接")

### Python 示例 (文生视频)[​](https://docs.weelinking.com/docs/api-capabilities/sora-2-video#python-示例-文生视频 "Python 示例 (文生视频)的直接链接")

```
# 需使用支持流式输出或长超时的客户端配置  
import requests  
  
url = "https://api.weelinking.com/v1/video/generations" # 假设端点，具体请参考API手册  
headers = {  
    "Authorization": "Bearer YOUR_API_KEY",  
    "Content-Type": "application/json"  
}  
data = {  
    "model": "sora_video2",  
    "prompt": "A cinematic drone shot of a futuristic city at sunset",  
    "with_audio": True  
}  
  
response = requests.post(url, json=data, timeout=300)  
print(response.json())
```

## 常见问题[​](https://docs.weelinking.com/docs/api-capabilities/sora-2-video#常见问题 "常见问题的直接链接")

- **水印**：weelinking输出无水印。
- **超时**：请确保客户端超时设置足够长。
