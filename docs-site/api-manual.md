---
title: "API 手册"
description: "ArmNet 字元服务 大模型API中转服务接口使用手册，帮助您快速集成和使用我们的服务"
lastUpdated: true
---

# API 手册

## 平台特色[​](/api-manual#平台特色 "平台特色的直接链接")

### OpenAI 兼容模式[​](/api-manual#openai-兼容模式 "OpenAI 兼容模式的直接链接")

ArmNet 字元服务采用OpenAI 兼容格式，让您可以用统一的接口调用200+主流大模型：

- **支持的模型厂商**：
  - 🤖 OpenAI：gpt-4o、gpt-5-chat-latest、gpt-3.5-turbo等
  - 🧠 Anthropic：claude-sonnet-4-20250514、claude-opus-4-1-20250805 等
  - 💎 Google：gemini-2.5-pro、gemini-2.5-flash 等
  - 🚀 xAI：grok-4-0709、grok-3 等
  - 🔍 DeepSeek：deepSeek-r1、deepSeek-v3 等
  - 🌟 阿里：Qwen系列模型
  - 💬 Moonshot：Kimi模型等

### 功能支持范围[​](/api-manual#功能支持范围 "功能支持范围的直接链接")

- **✅ 支持的功能**：

  - 💬 对话补全：Chat Completions接口
  - 🖼️ 图像生成：gpt-image-1、flux-kontext-pro、flux-kontext-max 等
  - 🔊 语音处理：Whisper转录
  - 📊 嵌入向量：文本向量化
  - ⚡ 函数调用：Function Calling
  - 📡 流式输出：实时响应
  - 🔧 OpenAI参数：temperature、top\_p、max\_tokens等
  - 🆕 Responses端点：OpenAI最新功能
- **❌ 不支持的功能**：

  - 🔧 微调接口（Fine-tuning）
  - 📁 Files管理接口
  - 🏢 组织管理接口
  - 💳 计费管理接口

### 简单切换模型[​](/api-manual#简单切换模型 "简单切换模型的直接链接")

核心优势：**一套代码，多种模型**。用OpenAI格式跑通后，只需要更换模型名称即可切换到其他大模型：

```
# 使用GPT-4o  
response = client.chat.completions.create(  
    model="gpt-4o", # OpenAI模型  
    messages=[...]  
)  
  
# 切换到Claude，其他代码完全不变！  
response = client.chat.completions.create(  
    model="claude-3.5-sonnet", # 只改模型名  
    messages=[...]  
)  
  
# 切换到Gemini  
response = client.chat.completions.create(  
    model="gemini-1.5-pro", # 只改模型名  
    messages=[...]  
)
```

## 快速开始[​](/api-manual#快速开始 "快速开始的直接链接")

### 获取API Key[​](/api-manual#获取api-key "获取API Key的直接链接")

1. 登录您的账户
2. 在秘钥管理页面点击”创建密钥”
3. 复制生成的API Key用于接口调用

### 查看请求示例[​](/api-manual#查看请求示例 "查看请求示例的直接链接")

在令牌管理页面，您可以快速获取各种编程语言的代码示例（cURL, Python, Node.js, Java, C#, Go, PHP, Ruby等）。

## 基础信息[​](/api-manual#基础信息 "基础信息的直接链接")

- **API 端点**:
  - 主要端点： `http://122.51.35.238:5170/v1`
- **认证方式**:
  - Header: `Authorization: Bearer YOUR_API_KEY`
- **请求格式**:
  - Content-Type: `application/json`
  - 编码格式：UTF-8

## 核心接口[​](/api-manual#核心接口 "核心接口的直接链接")

### 1. 对话补全（Chat Completions）[​](/api-manual#1-对话补全chat-completions "1. 对话补全（Chat Completions）的直接链接")

创建一个对话补全请求，支持多轮对话。

- **请求端点**: `POST /v1/chat/completions`
- **请求参数**:

  - `model` (string, 必填): 模型名称
  - `messages` (array, 必填): 对话消息数组
  - `temperature` (number): 采样温度，0-2之间，默认1
  - `max_tokens` (integer): 最大生成令牌数
  - `stream` (boolean): 是否流式返回，默认false
- **完整代码示例 (cURL)**:

  ```
  curl -X POST "http://122.51.35.238:5170/v1/chat/completions" \  
    -H "Authorization: Bearer YOUR_API_KEY" \  
    -H "Content-Type: application/json" \  
    -d '{  
      "model": "gpt-3.5-turbo",  
      "messages": [  
        {"role": "system", "content": "你是一个有用的AI助手。"},  
        {"role": "user", "content": "你好！请介绍一下自己。"}  
      ],  
      "temperature": 0.7,  
      "max_tokens": 1000  
    }'
  ```

### 2. 文本补全（Completions）[​](/api-manual#2-文本补全completions "2. 文本补全（Completions）的直接链接")

为兼容旧版接口保留，建议使用Chat Completions。

- **请求端点**: `POST /v1/completions`

### 3. 嵌入向量（Embeddings）[​](/api-manual#3-嵌入向量embeddings "3. 嵌入向量（Embeddings）的直接链接")

将文本转换为向量表示。

- **请求端点**: `POST /v1/embeddings`

### 4. 图像生成（Images）[​](/api-manual#4-图像生成images "4. 图像生成（Images）的直接链接")

生成、编辑或变换图像。

- **请求端点**: `POST /v1/images/generations`
- **代码示例**:

  ```
  curl -X POST "http://122.51.35.238:5170/v1/images/generations" \  
    -H "Authorization: Bearer YOUR_API_KEY" \  
    -H "Content-Type: application/json" \  
    -d '{  
      "model": "gpt-image-1",  
      "prompt": "一只可爱的橙色小猫坐在阳光明媚的花园里",  
      "n": 1,  
      "size": "1024x1024",  
      "quality": "hd"  
    }'
  ```

### 5. 音频转文字（Audio）[​](/api-manual#5-音频转文字audio "5. 音频转文字（Audio）的直接链接")

语音识别和转录。

- **请求端点**: `POST /v1/audio/transcriptions`

### 6. 模型列表[​](/api-manual#6-模型列表 "6. 模型列表的直接链接")

获取可用模型列表。

- **请求端点**: `GET /v1/models`

## 流式响应[​](/api-manual#流式响应 "流式响应的直接链接")

### 开启流式输出[​](/api-manual#开启流式输出 "开启流式输出的直接链接")

在请求中设置 `stream: true`。

### 流式响应格式[​](/api-manual#流式响应格式 "流式响应格式的直接链接")

响应将以Server-Sent Events (SSE) 格式返回：

```
data: {"id":"chatcmpl-123",...}  
data: {"id":"chatcmpl-123",...}  
data: [DONE]
```

## 错误处理[​](/api-manual#错误处理 "错误处理的直接链接")

### 常见错误码[​](/api-manual#常见错误码 "常见错误码的直接链接")

- `401` **invalid\_api\_key**: API密钥无效
- `429` **insufficient\_quota**: 额度不足
- `404` **model\_not\_found**: 模型不存在
- `400` **invalid\_request\_error**: 请求参数错误
- `500` **server\_error**: 服务器内部错误

### 最佳实践[​](/api-manual#最佳实践 "最佳实践的直接链接")

1. **请求优化**: 合理设置 `max_tokens`，使用 `temperature` 控制随机性。
2. **错误重试**: 实现指数退避的重试机制。
3. **安全建议**: 保护API密钥，使用环境变量存储。
4. **性能优化**: 使用流式输出，缓存响应。


---

> 本页内容来自文档知识库整理，已按 ArmNet 字元服务 服务命名统一更新。
