---
title: "Sora 2 异步 API"
description: "通过 ArmNet 字元服务 大模型API中转服务调用 Sora 2 异步视频生成接口，支持批量处理"
lastUpdated: true
---

# Sora 2 异步 API

Sora 2 异步 API 提供异步调用模式，适合批量处理、后台任务等场景，无需等待视频生成完成即可返回。

## 适用场景[​](/api-capabilities/sora-2-video-async#适用场景 "适用场景的直接链接")

- **批量生成**：一次提交多个视频生成任务
- **后台处理**：不阻塞主流程，后台完成生成
- **长视频**：生成时间较长的高质量视频
- **队列管理**：需要管理多个任务的场景

## 工作流程[​](/api-capabilities/sora-2-video-async#工作流程 "工作流程的直接链接")

```
1. 提交任务 → 获取任务 ID  
2. 轮询状态 → 等待完成  
3. 获取结果 → 下载视频
```

## API 接口[​](/api-capabilities/sora-2-video-async#api-接口 "API 接口的直接链接")

### 提交任务[​](/api-capabilities/sora-2-video-async#提交任务 "提交任务的直接链接")

```
POST http://122.51.35.238:5170/v1/video/generations
```

**请求参数**

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| model | string | 是 | `sora-2` 或 `sora-2-pro` |
| prompt | string | 是 | 视频描述 |
| duration | integer | 否 | 视频时长（秒），5/10/15/20 |
| async | boolean | 是 | 设为 `true` 启用异步模式 |

**响应**

```
{  
  "id": "task_xxxxxxxx",  
  "status": "pending",  
  "created_at": 1234567890  
}
```

### 查询状态[​](/api-capabilities/sora-2-video-async#查询状态 "查询状态的直接链接")

```
GET http://122.51.35.238:5170/v1/video/generations/{task_id}
```

**状态值**

| 状态 | 说明 |
| --- | --- |
| pending | 排队中 |
| processing | 生成中 |
| completed | 已完成 |
| failed | 生成失败 |

## 使用示例[​](/api-capabilities/sora-2-video-async#使用示例 "使用示例的直接链接")

### Python[​](/api-capabilities/sora-2-video-async#python "Python的直接链接")

```
import openai  
import time  
  
client = openai.OpenAI(  
    api_key="YOUR_API_KEY",  
    base_url="http://122.51.35.238:5170/v1"  
)  
  
# 1. 提交异步任务  
response = client.post(  
    "/video/generations",  
    body={  
        "model": "sora-2",  
        "prompt": "一只猫在草地上奔跑，阳光明媚，慢动作",  
        "duration": 10,  
        "async": True  
    }  
)  
  
task_id = response["id"]  
print(f"任务已提交: {task_id}")  
  
# 2. 轮询状态  
while True:  
    status = client.get(f"/video/generations/{task_id}")  
  
    if status["status"] == "completed":  
        print(f"视频已生成: {status['video_url']}")  
        break  
    elif status["status"] == "failed":  
        print("生成失败")  
        break  
    else:  
        print(f"状态: {status['status']}")  
        time.sleep(10)
```

## 最佳实践[​](/api-capabilities/sora-2-video-async#最佳实践 "最佳实践的直接链接")

### 轮询间隔[​](/api-capabilities/sora-2-video-async#轮询间隔 "轮询间隔的直接链接")

- 短视频（5-10秒）：每 5-10 秒轮询
- 长视频（15-20秒）：每 15-30 秒轮询

### 错误处理[​](/api-capabilities/sora-2-video-async#错误处理 "错误处理的直接链接")

```
try:  
    status = client.get(f"/video/generations/{task_id}")  
    if status["status"] == "failed":  
        error_msg = status.get("error", "未知错误")  
        # 处理错误  
except Exception as e:  
    # 处理网络错误  
    pass
```

## 常见问题[​](/api-capabilities/sora-2-video-async#常见问题 "常见问题的直接链接")

### 任务超时[​](/api-capabilities/sora-2-video-async#任务超时 "任务超时的直接链接")

长时间未完成的任务会自动取消，请检查提示词是否合规。

### 查询不到任务[​](/api-capabilities/sora-2-video-async#查询不到任务 "查询不到任务的直接链接")

任务 ID 有效期为 24 小时，过期后无法查询。


---

> 本页内容来自文档知识库整理，已按 ArmNet 字元服务 服务命名统一更新。
