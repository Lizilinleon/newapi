---
title: "为什么提示 API Key 无效？"
description: "ArmNet 字元服务 大模型API中转服务中 API Key 无效的常见原因和解决方法"
lastUpdated: true
---

# 为什么提示 API Key 无效？

当您在使用 API 时遇到 "Invalid API Key" 或 "Authentication failed" 错误，通常不是 key 本身的问题，而是 Base URL 配置不匹配。

## 常见原因[​](/faq/invalid-api-key#常见原因 "常见原因的直接链接")

### 1. Base URL 未配置或配置错误[​](/faq/invalid-api-key#1-base-url-未配置或配置错误 "1. Base URL 未配置或配置错误的直接链接")

这是最常见的原因。如果您使用了 ArmNet 字元服务 的 API Key，必须配合 ArmNet 字元服务 的 Base URL 使用。

**错误示例：**
使用了 ArmNet 字元服务 的 Key (`sk-...`)，但请求发往了 OpenAI 官方地址 (`https://api.openai.com/v1`)。

**正确配置：**

- **Base URL:** `http://122.51.35.238:5170/v1`

### 2. 客户端默认设置[​](/faq/invalid-api-key#2-客户端默认设置 "2. 客户端默认设置的直接链接")

很多开源软件（如 LangChain, OpenAI Python SDK）默认连接官方服务器。您需要显式指定 `base_url` 参数。

## 解决方法[​](/faq/invalid-api-key#解决方法 "解决方法的直接链接")

### 代码中修改[​](/faq/invalid-api-key#代码中修改 "代码中修改的直接链接")

**Python (OpenAI SDK):**

```
from openai import OpenAI  
  
client = OpenAI(  
    api_key="your-ArmNet 字元服务-key",  
    base_url="http://122.51.35.238:5170/v1"  # 必须指定  
)
```

**Node.js:**

```
const OpenAI = require('openai');  
  
const client = new OpenAI({  
  apiKey: 'your-ArmNet 字元服务-key',  
  baseURL: 'http://122.51.35.238:5170/v1' // 必须指定  
});
```

### 环境变量修改[​](/faq/invalid-api-key#环境变量修改 "环境变量修改的直接链接")

如果您无法修改代码，可以设置环境变量：

```
export OPENAI_API_BASE="http://122.51.35.238:5170/v1"
```

### 快速测试[​](/faq/invalid-api-key#快速测试 "快速测试的直接链接")

使用 curl 命令测试您的 key 是否有效：

```
curl http://122.51.35.238:5170/v1/models \  
  -H "Authorization: Bearer sk-your-key-here"
```

如果此命令返回模型列表，说明 key 是有效的，问题在于您的软件配置。


---

> 本页内容来自文档知识库整理，已按 ArmNet 字元服务 服务命名统一更新。
