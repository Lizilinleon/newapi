---
{
  "title": "LLM API 基础概念",
  "source_url": "https://docs.weelinking.com/docs/wiki/llm-api-basics",
  "description": "weelinking 大模型API中转服务核心概念全解析，快速上手AI接口开发",
  "fetched_at": "2026-07-02T06:34:36.505309+00:00"
}
---

# LLM API 基础概念

本文全面介绍大语言模型 API 的基础概念，帮助开发者快速理解和使用 LLM API。

## API 概述[​](https://docs.weelinking.com/docs/wiki/llm-api-basics#api-概述 "API 概述的直接链接")

### 什么是 LLM API[​](https://docs.weelinking.com/docs/wiki/llm-api-basics#什么是-llm-api "什么是 LLM API的直接链接")

LLM API 是大语言模型提供的编程接口，允许开发者通过 HTTP 请求与模型交互：

```
应用程序 → HTTP 请求 → API 服务器 → 模型推理 → HTTP 响应 → 应用程序
```

### 主要接口类型[​](https://docs.weelinking.com/docs/wiki/llm-api-basics#主要接口类型 "主要接口类型的直接链接")

| 接口 | 说明 | 用途 |
| --- | --- | --- |
| Chat Completions | 对话补全 | 聊天、问答 |
| Completions | 文本补全 | 续写、生成 |
| Embeddings | 向量嵌入 | 语义搜索、RAG |
| Images | 图像生成/编辑 | 文生图、图像处理 |
| Audio | 语音处理 | STT、TTS |
| Moderations | 内容审核 | 安全过滤 |

## Chat Completions API[​](https://docs.weelinking.com/docs/wiki/llm-api-basics#chat-completions-api "Chat Completions API的直接链接")

### 基本结构[​](https://docs.weelinking.com/docs/wiki/llm-api-basics#基本结构 "基本结构的直接链接")

```
from openai import OpenAI  
  
client = OpenAI(  
    api_key="your-api-key",  
    base_url="https://api.weelinking.com/v1"  
)  
  
response = client.chat.completions.create(  
    model="gpt-4o",  
    messages=[  
        {"role": "system", "content": "你是一个有帮助的助手。"},  
        {"role": "user", "content": "你好！"}  
    ]  
)  
  
print(response.choices[0].message.content)
```

### 消息角色[​](https://docs.weelinking.com/docs/wiki/llm-api-basics#消息角色 "消息角色的直接链接")

| 角色 | 说明 | 用途 |
| --- | --- | --- |
| system | 系统消息 | 设定 AI 行为和规则 |
| user | 用户消息 | 用户的输入 |
| assistant | 助手消息 | AI 的回复 |
| tool | 工具消息 | 工具调用结果 |

### 请求参数[​](https://docs.weelinking.com/docs/wiki/llm-api-basics#请求参数 "请求参数的直接链接")

```
response = client.chat.completions.create(  
    # 必需参数  
    model="gpt-4o",                    # 模型名称  
    messages=[...],                     # 消息列表  
      
    # 生成控制  
    temperature=0.7,                    # 随机性 (0-2)  
    top_p=1.0,                         # 核采样 (0-1)  
    max_tokens=1000,                   # 最大输出长度  
      
    # 停止条件  
    stop=["###"],                      # 停止词  
      
    # 输出控制  
    n=1,                               # 生成数量  
    presence_penalty=0,                # 话题新鲜度惩罚  
    frequency_penalty=0,               # 重复惩罚  
      
    # 工具  
    tools=[...],                       # 可用工具列表  
    tool_choice="auto",                # 工具选择策略  
      
    # 格式  
    response_format={"type": "json_object"},  # 输出格式  
      
    # 流式  
    stream=False,                      # 是否流式输出  
      
    # 其他  
    user="user-123"                    # 用户标识  
)
```

### 响应结构[​](https://docs.weelinking.com/docs/wiki/llm-api-basics#响应结构 "响应结构的直接链接")

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
                "content": "你好！有什么可以帮助你的吗？"  
            },  
            "finish_reason": "stop"  
        }  
    ],  
    "usage": {  
        "prompt_tokens": 20,  
        "completion_tokens": 15,  
        "total_tokens": 35  
    }  
}
```

## 核心参数详解[​](https://docs.weelinking.com/docs/wiki/llm-api-basics#核心参数详解 "核心参数详解的直接链接")

### Temperature（温度）[​](https://docs.weelinking.com/docs/wiki/llm-api-basics#temperature温度 "Temperature（温度）的直接链接")

控制输出的随机性：

- **0：** 确定性输出，每次结果相同
- **0.1-0.3：** 低随机性，适合代码、事实问答
- **0.7-0.9：** 中等随机性，适合创意写作
- **1.0+：** 高随机性，更有创意但可能不稳定

```
# 代码生成 - 低温度  
response = client.chat.completions.create(  
    model="gpt-4o",  
    messages=[{"role": "user", "content": "写一个排序函数"}],  
    temperature=0  
)  
  
# 创意写作 - 高温度  
response = client.chat.completions.create(  
    model="gpt-4o",  
    messages=[{"role": "user", "content": "写一首关于春天的诗"}],  
    temperature=0.9  
)
```

### Max Tokens[​](https://docs.weelinking.com/docs/wiki/llm-api-basics#max-tokens "Max Tokens的直接链接")

限制输出长度：

```
response = client.chat.completions.create(  
    model="gpt-4o",  
    messages=[{"role": "user", "content": "解释量子物理"}],  
    max_tokens=500  # 最多生成 500 个 token  
)
```

### Stop Sequences[​](https://docs.weelinking.com/docs/wiki/llm-api-basics#stop-sequences "Stop Sequences的直接链接")

指定停止生成的标记：

```
response = client.chat.completions.create(  
    model="gpt-4o",  
    messages=[{"role": "user", "content": "列出三个水果："}],  
    stop=["\n", "4."]  # 遇到换行或 "4." 时停止  
)
```

## 流式输出[​](https://docs.weelinking.com/docs/wiki/llm-api-basics#流式输出 "流式输出的直接链接")

### 基础流式[​](https://docs.weelinking.com/docs/wiki/llm-api-basics#基础流式 "基础流式的直接链接")

```
stream = client.chat.completions.create(  
    model="gpt-4o",  
    messages=[{"role": "user", "content": "讲一个故事"}],  
    stream=True  
)  
  
for chunk in stream:  
    if chunk.choices[0].delta.content:  
        print(chunk.choices[0].delta.content, end="")
```

### 流式响应格式[​](https://docs.weelinking.com/docs/wiki/llm-api-basics#流式响应格式 "流式响应格式的直接链接")

```
{"id":"chatcmpl-xxx","choices":[{"delta":{"role":"assistant"},"index":0}]}  
{"id":"chatcmpl-xxx","choices":[{"delta":{"content":"你"},"index":0}]}  
{"id":"chatcmpl-xxx","choices":[{"delta":{"content":"好"},"index":0}]}  
{"id":"chatcmpl-xxx","choices":[{"delta":{},"finish_reason":"stop","index":0}]}
```

## Embeddings API[​](https://docs.weelinking.com/docs/wiki/llm-api-basics#embeddings-api "Embeddings API的直接链接")

### 生成嵌入向量[​](https://docs.weelinking.com/docs/wiki/llm-api-basics#生成嵌入向量 "生成嵌入向量的直接链接")

```
response = client.embeddings.create(  
    model="text-embedding-3-small",  
    input="这是一段测试文本"  
)  
  
embedding = response.data[0].embedding  
print(f"向量维度: {len(embedding)}")  # 1536
```

### 批量嵌入[​](https://docs.weelinking.com/docs/wiki/llm-api-basics#批量嵌入 "批量嵌入的直接链接")

```
response = client.embeddings.create(  
    model="text-embedding-3-small",  
    input=["文本1", "文本2", "文本3"]  
)  
  
for i, item in enumerate(response.data):  
    print(f"文本 {i}: 维度 {len(item.embedding)}")
```

## 函数调用[​](https://docs.weelinking.com/docs/wiki/llm-api-basics#函数调用 "函数调用的直接链接")

### 定义工具[​](https://docs.weelinking.com/docs/wiki/llm-api-basics#定义工具 "定义工具的直接链接")

```
tools = [  
    {  
        "type": "function",  
        "function": {  
            "name": "get_weather",  
            "description": "获取天气信息",  
            "parameters": {  
                "type": "object",  
                "properties": {  
                    "city": {  
                        "type": "string",  
                        "description": "城市名称"  
                    }  
                },  
                "required": ["city"]  
            }  
        }  
    }  
]  
  
response = client.chat.completions.create(  
    model="gpt-4o",  
    messages=[{"role": "user", "content": "北京天气怎么样？"}],  
    tools=tools  
)
```

### 处理工具调用[​](https://docs.weelinking.com/docs/wiki/llm-api-basics#处理工具调用 "处理工具调用的直接链接")

```
message = response.choices[0].message  
  
if message.tool_calls:  
    for tool_call in message.tool_calls:  
        function_name = tool_call.function.name  
        arguments = json.loads(tool_call.function.arguments)  
          
        # 执行函数  
        result = call_function(function_name, arguments)  
          
        # 返回结果给模型  
        messages.append(message)  
        messages.append({  
            "role": "tool",  
            "tool_call_id": tool_call.id,  
            "content": json.dumps(result)  
        })
```

## 错误处理[​](https://docs.weelinking.com/docs/wiki/llm-api-basics#错误处理 "错误处理的直接链接")

### 常见错误码[​](https://docs.weelinking.com/docs/wiki/llm-api-basics#常见错误码 "常见错误码的直接链接")

| 错误码 | 说明 | 处理方式 |
| --- | --- | --- |
| 400 | 请求格式错误 | 检查参数 |
| 401 | 认证失败 | 检查 API Key |
| 403 | 权限不足 | 检查账户权限 |
| 429 | 请求过多 | 降低频率 |
| 500 | 服务器错误 | 重试 |
| 503 | 服务不可用 | 稍后重试 |

### 错误处理示例[​](https://docs.weelinking.com/docs/wiki/llm-api-basics#错误处理示例 "错误处理示例的直接链接")

```
from openai import APIError, RateLimitError, AuthenticationError  
  
try:  
    response = client.chat.completions.create(...)  
except AuthenticationError:  
    print("API Key 无效")  
except RateLimitError:  
    print("请求过于频繁")  
except APIError as e:  
    print(f"API 错误: {e}")
```

## Token 计费[​](https://docs.weelinking.com/docs/wiki/llm-api-basics#token-计费 "Token 计费的直接链接")

### Token 概念[​](https://docs.weelinking.com/docs/wiki/llm-api-basics#token-概念 "Token 概念的直接链接")

Token 是模型处理的最小单位：

- 英文：约 1 个词 = 1 token
- 中文：约 1 个字 = 1-2 token

### 计费方式[​](https://docs.weelinking.com/docs/wiki/llm-api-basics#计费方式 "计费方式的直接链接")

```
费用 = (输入 Token × 输入价格) + (输出 Token × 输出价格)
```

### Token 统计[​](https://docs.weelinking.com/docs/wiki/llm-api-basics#token-统计 "Token 统计的直接链接")

```
response = client.chat.completions.create(  
    model="gpt-4o",  
    messages=[{"role": "user", "content": "你好"}]  
)  
  
usage = response.usage  
print(f"输入: {usage.prompt_tokens} tokens")  
print(f"输出: {usage.completion_tokens} tokens")  
print(f"总计: {usage.total_tokens} tokens")
```

## 最佳实践[​](https://docs.weelinking.com/docs/wiki/llm-api-basics#最佳实践 "最佳实践的直接链接")

### 1. 设置合理超时[​](https://docs.weelinking.com/docs/wiki/llm-api-basics#1-设置合理超时 "1. 设置合理超时的直接链接")

```
client = OpenAI(  
    api_key="your-api-key",  
    timeout=30.0  
)
```

### 2. 使用环境变量[​](https://docs.weelinking.com/docs/wiki/llm-api-basics#2-使用环境变量 "2. 使用环境变量的直接链接")

```
import os  
client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))
```

### 3. 实现重试机制[​](https://docs.weelinking.com/docs/wiki/llm-api-basics#3-实现重试机制 "3. 实现重试机制的直接链接")

```
from tenacity import retry, stop_after_attempt, wait_exponential  
  
@retry(stop=stop_after_attempt(3), wait=wait_exponential())  
def call_with_retry(messages):  
    return client.chat.completions.create(  
        model="gpt-4o",  
        messages=messages  
    )
```

### 4. 监控使用量[​](https://docs.weelinking.com/docs/wiki/llm-api-basics#4-监控使用量 "4. 监控使用量的直接链接")

```
def call_and_log(messages, model):  
    response = client.chat.completions.create(  
        model=model,  
        messages=messages  
    )  
      
    logger.info(f"Token usage: {response.usage.total_tokens}")  
    return response
```
