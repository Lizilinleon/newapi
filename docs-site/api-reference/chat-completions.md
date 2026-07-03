---
title: "对话补全 API"
description: "ArmNet 字元服务 大模型API中转服务 Chat Completions 接口参考，创建多轮对话和文本生成"
lastUpdated: true
---

# 对话补全 API

Chat Completions API 是最常用的 API 接口，用于创建多轮对话和文本生成任务。

## 接口地址[​](/api-reference/chat-completions#接口地址 "接口地址的直接链接")

```
POST http://122.51.35.238:5170/v1/chat/completions
```

## 请求头[​](/api-reference/chat-completions#请求头 "请求头的直接链接")

```
Authorization: Bearer YOUR_API_KEY  
Content-Type: application/json
```

## 请求参数[​](/api-reference/chat-completions#请求参数 "请求参数的直接链接")

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| model | string | 是 | 模型名称，如 `gpt-4o`、`claude-3-opus-20240229` |
| messages | array | 是 | 消息数组，包含对话历史 |
| temperature | number | 否 | 采样温度，0-2 之间，默认 1 |
| max\_tokens | number | 否 | 最大生成 token 数 |
| stream | boolean | 否 | 是否流式输出，默认 false |
| top\_p | number | 否 | 核采样参数，0-1 之间 |

### messages 参数格式[​](/api-reference/chat-completions#messages-参数格式 "messages 参数格式的直接链接")

```
[  
  {"role": "system", "content": "你是一个有帮助的助手"},  
  {"role": "user", "content": "你好"},  
  {"role": "assistant", "content": "你好！有什么可以帮助你的吗？"},  
  {"role": "user", "content": "请介绍一下你自己"}  
]
```

## 请求示例[​](/api-reference/chat-completions#请求示例 "请求示例的直接链接")

### Python[​](/api-reference/chat-completions#python "Python的直接链接")

```
import openai  
  
client = openai.OpenAI(  
    api_key="YOUR_API_KEY",  
    base_url="http://122.51.35.238:5170/v1"  
)  
  
response = client.chat.completions.create(  
    model="gpt-4o",  
    messages=[  
        {"role": "system", "content": "你是一个有帮助的助手"},  
        {"role": "user", "content": "你好，请介绍一下你自己"}  
    ],  
    temperature=0.7,  
    max_tokens=1000  
)  
  
print(response.choices[0].message.content)
```

### cURL[​](/api-reference/chat-completions#curl "cURL的直接链接")

```
curl http://122.51.35.238:5170/v1/chat/completions \  
  -H "Content-Type: application/json" \  
  -H "Authorization: Bearer YOUR_API_KEY" \  
  -d '{  
    "model": "gpt-4o",  
    "messages": [  
      {"role": "system", "content": "你是一个有帮助的助手"},  
      {"role": "user", "content": "你好，请介绍一下你自己"}  
    ],  
    "temperature": 0.7,  
    "max_tokens": 1000  
  }'
```

### Node.js[​](/api-reference/chat-completions#nodejs "Node.js的直接链接")

```
import OpenAI from 'openai';  
  
const client = new OpenAI({  
  apiKey: 'YOUR_API_KEY',  
  baseURL: 'http://122.51.35.238:5170/v1'  
});  
  
async function main() {  
  const response = await client.chat.completions.create({  
    model: 'gpt-4o',  
    messages: [  
      { role: 'system', content: '你是一个有帮助的助手' },  
      { role: 'user', content: '你好，请介绍一下你自己' }  
    ],  
    temperature: 0.7,  
    max_tokens: 1000  
  });  
  
  console.log(response.choices[0].message.content);  
}  
  
main();
```

## 响应示例[​](/api-reference/chat-completions#响应示例 "响应示例的直接链接")

```
{  
  "id": "chatcmpl-xxx",  
  "object": "chat.completion",  
  "created": 1234567890,  
  "model": "gpt-4o",  
  "choices": [  
    {  
      "index": 0,  
      "message": {  
        "role": "assistant",  
        "content": "你好！我是一个 AI 助手，基于大型语言模型技术..."  
      },  
      "finish_reason": "stop"  
    }  
  ],  
  "usage": {  
    "prompt_tokens": 25,  
    "completion_tokens": 100,  
    "total_tokens": 125  
  }  
}
```

## 流式输出[​](/api-reference/chat-completions#流式输出 "流式输出的直接链接")

设置 `stream: true` 可以启用流式输出：

```
response = client.chat.completions.create(  
    model="gpt-4o",  
    messages=[{"role": "user", "content": "写一首诗"}],  
    stream=True  
)  
  
for chunk in response:  
    if chunk.choices[0].delta.content:  
        print(chunk.choices[0].delta.content, end="")
```

## 多模态输入[​](/api-reference/chat-completions#多模态输入 "多模态输入的直接链接")

部分模型支持图像输入：

```
response = client.chat.completions.create(  
    model="gpt-4o",  
    messages=[  
        {  
            "role": "user",  
            "content": [  
                {"type": "text", "text": "这张图片里有什么？"},  
                {  
                    "type": "image_url",  
                    "image_url": {"url": "https://example.com/image.jpg"}  
                }  
            ]  
        }  
    ]  
)
```

## 常见错误码[​](/api-reference/chat-completions#常见错误码 "常见错误码的直接链接")

| 错误码 | 说明 | 解决方案 |
| --- | --- | --- |
| 401 | API Key 无效 | 检查 API Key 是否正确 |
| 429 | 请求过于频繁 | 降低请求频率或升级套餐 |
| 500 | 服务器错误 | 稍后重试 |
| 503 | 服务暂时不可用 | 稍后重试 |


---

> 本页内容来自文档知识库整理，已按 ArmNet 字元服务 服务命名统一更新。
