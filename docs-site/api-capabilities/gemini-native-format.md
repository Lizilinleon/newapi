---
title: "Gemini 原生格式调用"
description: "通过 ArmNet 字元服务 大模型API中转服务使用 Gemini 原生格式调用 Google AI 模型"
lastUpdated: true
---

# Gemini 原生格式调用

ArmNet 字元服务 支持使用 Gemini 的原生 API 格式进行调用，完美支持多模态输入、Function Calling 和代码执行等高级功能。

## 核心特性[​](/api-capabilities/gemini-native-format#核心特性 "核心特性的直接链接")

- **多模态输入**：支持文本、图像、视频、音频混合输入。
- **Function Calling**：支持工具调用。
- **代码执行**：支持模型生成并执行代码。
- **Token 追踪**：精确的 Token 使用统计。
- **Context Caching**：支持上下文缓存。

## Python SDK 示例[​](/api-capabilities/gemini-native-format#python-sdk-示例 "Python SDK 示例的直接链接")

需使用 Google Generative AI SDK。

```
import google.generativeai as genai  
  
genai.configure(api_key="YOUR_API_KEY", transport="rest", client_options={"api_endpoint": "http://122.51.35.238:5170/google"})  
  
model = genai.GenerativeModel('gemini-1.5-flash')  
response = model.generate_content("Hello, how are you?")  
print(response.text)
```

## 功能对比[​](/api-capabilities/gemini-native-format#功能对比 "功能对比的直接链接")

| 功能 | 原生格式 | OpenAI 兼容格式 |
| --- | --- | --- |
| 文本生成 | ✅ | ✅ |
| 图像/视频输入 | ✅ | ✅ (通过 image\_url) |
| Function Calling | ✅ | ✅ |
| 代码执行 | ✅ | ❌ |
| 搜索工具 | ✅ | ❌ |


---

> 本页内容来自文档知识库整理，已按 ArmNet 字元服务 服务命名统一更新。
