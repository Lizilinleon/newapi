---
title: "API 调用基础"
description: "ArmNet 字元服务 大模型API中转服务的基础调用方法与入门教程"
lastUpdated: true
---

# API 调用基础

本文介绍如何调用大语言模型 API，包括基本概念、请求格式、响应处理等内容。

## API 基础概念[​](/wiki/applications/api-basics#api-基础概念 "API 基础概念的直接链接")

### 什么是 LLM API[​](/wiki/applications/api-basics#什么是-llm-api "什么是 LLM API的直接链接")

LLM API 是大语言模型提供的编程接口，允许开发者：

- 发送文本/图片等输入
- 接收模型生成的回复
- 控制生成参数
- 使用各种高级功能

### OpenAI 兼容格式[​](/wiki/applications/api-basics#openai-兼容格式 "OpenAI 兼容格式的直接链接")

大多数 LLM API 都采用 OpenAI 兼容格式，包括：

- OpenAI (GPT 系列)
- Anthropic (Claude)
- Google (Gemini)
- 国内各大模型

## 快速开始[​](/wiki/applications/api-basics#快速开始 "快速开始的直接链接")

### 安装 SDK[​](/wiki/applications/api-basics#安装-sdk "安装 SDK的直接链接")

```
pip install openai
```

### 基础调用[​](/wiki/applications/api-basics#基础调用 "基础调用的直接链接")

```
from openai import OpenAI  
  
# 初始化客户端  
client = OpenAI(  
    api_key="your-api-key",  
    base_url="http://122.51.35.238:5170/v1"  
)  
  
# 发送请求  
response = client.chat.completions.create(  
    model="gpt-4o",  
    messages=[  
        {"role": "system", "content": "你是一个有帮助的助手。"},  
        {"role": "user", "content": "你好，请介绍一下自己。"}  
    ]  
)  
  
# 获取回复  
print(response.choices[0].message.content)
```

## 请求参数详解[​](/wiki/applications/api-basics#请求参数详解 "请求参数详解的直接链接")

### 核心参数[​](/wiki/applications/api-basics#核心参数 "核心参数的直接链接")

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| model | string | 模型名称 |
| messages | array | 对话消息列表 |
| temperature | float | 随机性，0-2 |
| max\_tokens | int | 最大输出长度 |
| stream | bool | 是否流式输出 |

### messages 格式[​](/wiki/applications/api-basics#messages-格式 "messages 格式的直接链接")

```
messages = [  
    {  
        "role": "system",  # 系统提示  
        "content": "你是一个专业的翻译。"  
    },  
    {  
        "role": "user",  # 用户消息  
        "content": "翻译这句话：Hello World"  
    },  
    {  
        "role": "assistant",  # AI 回复（多轮对话时使用）  
        "content": "你好，世界"  
    }  
]
```

### 高级参数[​](/wiki/applications/api-basics#高级参数 "高级参数的直接链接")

```
response = client.chat.completions.create(  
    model="gpt-4o",  
    messages=messages,  
      
    # 生成控制  
    temperature=0.7,      # 随机性  
    top_p=0.9,            # 核采样  
    max_tokens=1000,      # 最大输出 token  
      
    # 停止条件  
    stop=["###", "END"],  # 停止词  
      
    # 其他  
    n=1,                  # 生成数量  
    presence_penalty=0,   # 重复惩罚  
    frequency_penalty=0,  # 频率惩罚  
      
    # 用户标识  
    user="user-123"       # 用于追踪  
)
```

## 响应处理[​](/wiki/applications/api-basics#响应处理 "响应处理的直接链接")

### 响应结构[​](/wiki/applications/api-basics#响应结构 "响应结构的直接链接")

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
                "content": "回复内容"  
            },  
            "finish_reason": "stop"  
        }  
    ],  
    "usage": {  
        "prompt_tokens": 10,  
        "completion_tokens": 20,  
        "total_tokens": 30  
    }  
}
```

### 提取内容[​](/wiki/applications/api-basics#提取内容 "提取内容的直接链接")

```
# 获取回复文本  
content = response.choices[0].message.content  
  
# 获取 token 使用量  
usage = response.usage  
print(f"输入: {usage.prompt_tokens}, 输出: {usage.completion_tokens}")  
  
# 检查结束原因  
finish_reason = response.choices[0].finish_reason  
# stop: 正常结束  
# length: 达到 max_tokens  
# content_filter: 内容过滤
```

## 流式输出[​](/wiki/applications/api-basics#流式输出 "流式输出的直接链接")

### 基础流式[​](/wiki/applications/api-basics#基础流式 "基础流式的直接链接")

```
stream = client.chat.completions.create(  
    model="gpt-4o",  
    messages=[{"role": "user", "content": "讲个故事"}],  
    stream=True  
)  
  
for chunk in stream:  
    if chunk.choices[0].delta.content:  
        print(chunk.choices[0].delta.content, end="", flush=True)
```

### 异步流式[​](/wiki/applications/api-basics#异步流式 "异步流式的直接链接")

```
from openai import AsyncOpenAI  
  
async_client = AsyncOpenAI(  
    api_key="your-api-key",  
    base_url="http://122.51.35.238:5170/v1"  
)  
  
async def stream_chat():  
    stream = await async_client.chat.completions.create(  
        model="gpt-4o",  
        messages=[{"role": "user", "content": "讲个故事"}],  
        stream=True  
    )  
      
    async for chunk in stream:  
        if chunk.choices[0].delta.content:  
            print(chunk.choices[0].delta.content, end="")
```

## 多模态调用[​](/wiki/applications/api-basics#多模态调用 "多模态调用的直接链接")

### 图片理解[​](/wiki/applications/api-basics#图片理解 "图片理解的直接链接")

```
response = client.chat.completions.create(  
    model="gpt-4o",  
    messages=[  
        {  
            "role": "user",  
            "content": [  
                {"type": "text", "text": "描述这张图片"},  
                {  
                    "type": "image_url",  
                    "image_url": {  
                        "url": "https://example.com/image.jpg"  
                        # 或 base64: "data:image/jpeg;base64,..."  
                    }  
                }  
            ]  
        }  
    ]  
)
```

### 图片生成[​](/wiki/applications/api-basics#图片生成 "图片生成的直接链接")

```
response = client.images.generate(  
    model="dall-e-3",  
    prompt="一只可爱的猫咪在阳光下",  
    size="1024x1024",  
    quality="hd",  
    n=1  
)  
  
image_url = response.data[0].url
```

## 错误处理[​](/wiki/applications/api-basics#错误处理 "错误处理的直接链接")

### 常见错误[​](/wiki/applications/api-basics#常见错误 "常见错误的直接链接")

```
from openai import (  
    APIError,  
    RateLimitError,  
    APIConnectionError,  
    AuthenticationError  
)  
  
try:  
    response = client.chat.completions.create(...)  
except AuthenticationError:  
    print("API Key 无效")  
except RateLimitError:  
    print("请求过于频繁，请稍后重试")  
except APIConnectionError:  
    print("网络连接失败")  
except APIError as e:  
    print(f"API 错误: {e}")
```

### 重试策略[​](/wiki/applications/api-basics#重试策略 "重试策略的直接链接")

```
import time  
from tenacity import retry, stop_after_attempt, wait_exponential  
  
@retry(  
    stop=stop_after_attempt(3),  
    wait=wait_exponential(multiplier=1, min=1, max=10)  
)  
def call_api_with_retry(messages):  
    return client.chat.completions.create(  
        model="gpt-4o",  
        messages=messages  
    )
```

## 最佳实践[​](/wiki/applications/api-basics#最佳实践 "最佳实践的直接链接")

### 1. 环境变量管理[​](/wiki/applications/api-basics#1-环境变量管理 "1. 环境变量管理的直接链接")

```
import os  
from openai import OpenAI  
  
client = OpenAI(  
    api_key=os.getenv("OPENAI_API_KEY"),  
    base_url=os.getenv("OPENAI_BASE_URL", "http://122.51.35.238:5170/v1")  
)
```

### 2. 超时设置[​](/wiki/applications/api-basics#2-超时设置 "2. 超时设置的直接链接")

```
client = OpenAI(  
    api_key="your-api-key",  
    base_url="http://122.51.35.238:5170/v1",  
    timeout=30.0  # 30秒超时  
)
```

### 3. 日志记录[​](/wiki/applications/api-basics#3-日志记录 "3. 日志记录的直接链接")

```
import logging  
  
logging.basicConfig(level=logging.INFO)  
logger = logging.getLogger(__name__)  
  
def call_llm(messages):  
    logger.info(f"调用 LLM，消息数: {len(messages)}")  
    response = client.chat.completions.create(  
        model="gpt-4o",  
        messages=messages  
    )  
    logger.info(f"Token 使用: {response.usage.total_tokens}")  
    return response
```

### 4. 成本控制[​](/wiki/applications/api-basics#4-成本控制 "4. 成本控制的直接链接")

```
def estimate_cost(response, model="gpt-4o"):  
    # 价格（示例，需要根据实际价格调整）  
    prices = {  
        "gpt-4o": {"input": 0.005, "output": 0.015},  
        "gpt-4o-mini": {"input": 0.00015, "output": 0.0006}  
    }  
      
    price = prices.get(model, {"input": 0, "output": 0})  
    input_cost = response.usage.prompt_tokens / 1000 * price["input"]  
    output_cost = response.usage.completion_tokens / 1000 * price["output"]  
      
    return input_cost + output_cost
```


---

> 本页内容来自文档知识库整理，已按 ArmNet 字元服务 服务命名统一更新。
