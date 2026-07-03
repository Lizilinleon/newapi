---
title: "模型列表 API"
description: "ArmNet 字元服务 大模型API中转服务 Models 接口参考，获取平台支持的所有模型信息"
lastUpdated: true
---

# 模型列表 API

Models API 用于获取所有可用模型的列表和详细信息。

## 获取模型列表[​](/api-reference/models#获取模型列表 "获取模型列表的直接链接")

### 接口地址[​](/api-reference/models#接口地址 "接口地址的直接链接")

```
GET http://122.51.35.238:5170/v1/models
```

### 请求头[​](/api-reference/models#请求头 "请求头的直接链接")

```
Authorization: Bearer YOUR_API_KEY
```

### 请求示例[​](/api-reference/models#请求示例 "请求示例的直接链接")

#### Python[​](/api-reference/models#python "Python的直接链接")

```
import openai  
  
client = openai.OpenAI(  
    api_key="YOUR_API_KEY",  
    base_url="http://122.51.35.238:5170/v1"  
)  
  
models = client.models.list()  
  
for model in models.data:  
    print(model.id)
```

#### cURL[​](/api-reference/models#curl "cURL的直接链接")

```
curl http://122.51.35.238:5170/v1/models \  
  -H "Authorization: Bearer YOUR_API_KEY"
```

#### Node.js[​](/api-reference/models#nodejs "Node.js的直接链接")

```
import OpenAI from 'openai';  
  
const client = new OpenAI({  
  apiKey: 'YOUR_API_KEY',  
  baseURL: 'http://122.51.35.238:5170/v1'  
});  
  
async function main() {  
  const models = await client.models.list();  
  
  for (const model of models.data) {  
    console.log(model.id);  
  }  
}  
  
main();
```

### 响应示例[​](/api-reference/models#响应示例 "响应示例的直接链接")

```
{  
  "object": "list",  
  "data": [  
    {  
      "id": "gpt-4o",  
      "object": "model",  
      "created": 1234567890,  
      "owned_by": "openai"  
    },  
    {  
      "id": "claude-3-opus-20240229",  
      "object": "model",  
      "created": 1234567890,  
      "owned_by": "anthropic"  
    },  
    {  
      "id": "gemini-2.5-pro",  
      "object": "model",  
      "created": 1234567890,  
      "owned_by": "google"  
    }  
  ]  
}
```

## 获取单个模型信息[​](/api-reference/models#获取单个模型信息 "获取单个模型信息的直接链接")

### 接口地址[​](/api-reference/models#接口地址-1 "接口地址的直接链接")

```
GET http://122.51.35.238:5170/v1/models/{model_id}
```

### 请求示例[​](/api-reference/models#请求示例-1 "请求示例的直接链接")

```
model = client.models.retrieve("gpt-4o")  
print(model)
```

### 响应示例[​](/api-reference/models#响应示例-1 "响应示例的直接链接")

```
{  
  "id": "gpt-4o",  
  "object": "model",  
  "created": 1234567890,  
  "owned_by": "openai"  
}
```

## 支持的模型分类[​](/api-reference/models#支持的模型分类 "支持的模型分类的直接链接")

### OpenAI 系列[​](/api-reference/models#openai-系列 "OpenAI 系列的直接链接")

| 模型 ID | 说明 | 上下文 |
| --- | --- | --- |
| gpt-5 | 最新旗舰模型 | 128K |
| gpt-5.1 | 智能与速度平衡 | 128K |
| gpt-4o | 多模态综合模型 | 128K |
| gpt-4-turbo | 高性能版本 | 128K |
| o3 | 推理模型 | 128K |
| o4-mini | 轻量推理模型 | 128K |

### Anthropic Claude 系列[​](/api-reference/models#anthropic-claude-系列 "Anthropic Claude 系列的直接链接")

| 模型 ID | 说明 | 上下文 |
| --- | --- | --- |
| claude-opus-4-5-20251101 | 最新旗舰 | 200K |
| claude-sonnet-4-5-20250929 | 编程专用 | 200K |
| claude-haiku-4-5-20251001 | 高性价比 | 200K |
| claude-3-opus-20240229 | Claude 3 旗舰 | 200K |

### Google Gemini 系列[​](/api-reference/models#google-gemini-系列 "Google Gemini 系列的直接链接")

| 模型 ID | 说明 | 上下文 |
| --- | --- | --- |
| gemini-3-pro-preview | LMArena 第一 | 1M |
| gemini-2.5-pro | 正式版 | 2M |
| gemini-2.5-flash | 快速响应 | 1M |

### xAI Grok 系列[​](/api-reference/models#xai-grok-系列 "xAI Grok 系列的直接链接")

| 模型 ID | 说明 | 上下文 |
| --- | --- | --- |
| grok-4 | 最新版本 | 128K |
| grok-4-all | 联网版本 | 128K |
| grok-3 | 稳定版本 | 128K |

### DeepSeek 系列[​](/api-reference/models#deepseek-系列 "DeepSeek 系列的直接链接")

| 模型 ID | 说明 | 上下文 |
| --- | --- | --- |
| deepseek-v3.1 | 混合推理 | 128K |
| deepseek-r1 | 推理模型 | 64K |
| deepseek-v3 | 综合模型 | 128K |

### 图像生成模型[​](/api-reference/models#图像生成模型 "图像生成模型的直接链接")

| 模型 ID | 说明 |
| --- | --- |
| dall-e-3 | DALL·E 3 |
| gpt-image-1 | GPT 图像生成 |
| flux-pro | Flux 专业版 |
| gemini-3-pro-image-preview | Nano Banana Pro |

### 视频生成模型[​](/api-reference/models#视频生成模型 "视频生成模型的直接链接")

| 模型 ID | 说明 |
| --- | --- |
| sora\_video2 | Sora 2 竖屏 |
| sora\_video2-landscape | Sora 2 横屏 |

## 模型选择建议[​](/api-reference/models#模型选择建议 "模型选择建议的直接链接")

### 按场景选择[​](/api-reference/models#按场景选择 "按场景选择的直接链接")

| 场景 | 推荐模型 |
| --- | --- |
| 日常对话 | gpt-4o, claude-3-opus |
| 编程开发 | claude-sonnet-4-5, gpt-5.1-codex |
| 长文本处理 | gemini-2.5-pro (2M 上下文) |
| 快速响应 | gpt-4o-mini, gemini-2.5-flash |
| 复杂推理 | o3, gpt-5, gemini-3-pro-preview |
| 图像生成 | gemini-3-pro-image-preview, flux-pro |

### 按预算选择[​](/api-reference/models#按预算选择 "按预算选择的直接链接")

| 预算 | 推荐模型 |
| --- | --- |
| 低成本 | gpt-4o-mini, claude-haiku, gemini-flash |
| 平衡型 | gpt-4o, claude-sonnet |
| 高性能 | gpt-5, claude-opus, gemini-pro |

## 实时定价[​](/api-reference/models#实时定价 "实时定价的直接链接")

访问 [ArmNet 字元服务控制台](http://122.51.35.238:5170/prices) 查看所有模型的实时定价信息。


---

> 本页内容来自文档知识库整理，已按 ArmNet 字元服务 服务命名统一更新。
