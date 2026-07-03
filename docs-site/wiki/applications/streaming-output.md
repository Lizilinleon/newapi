---
title: "流式输出"
description: "通过 ArmNet 字元服务 大模型API中转服务实现流式输出的打字机效果"
lastUpdated: true
---

# 流式输出

流式输出（Streaming）是一种让 AI 回复逐字/逐词显示的技术，提供更好的用户体验，特别是在生成长文本时。

## 为什么需要流式输出[​](/wiki/applications/streaming-output#为什么需要流式输出 "为什么需要流式输出的直接链接")

### 传统方式的问题[​](/wiki/applications/streaming-output#传统方式的问题 "传统方式的问题的直接链接")

非流式调用需要等待完整响应：

- 长文本生成可能需要几十秒
- 用户只能看到空白等待
- 体验较差

### 流式输出的优势[​](/wiki/applications/streaming-output#流式输出的优势 "流式输出的优势的直接链接")

- **即时反馈：** 第一个字立即显示
- **用户体验：** 打字机效果更自然
- **提前终止：** 用户可以随时中断
- **减少等待焦虑：** 能看到进度

## 基础实现[​](/wiki/applications/streaming-output#基础实现 "基础实现的直接链接")

### Python 同步流式[​](/wiki/applications/streaming-output#python-同步流式 "Python 同步流式的直接链接")

```
from openai import OpenAI  
  
client = OpenAI(  
    api_key="your-api-key",  
    base_url="http://122.51.35.238:5170/v1"  
)  
  
def stream_chat(prompt):  
    stream = client.chat.completions.create(  
        model="gpt-4o",  
        messages=[{"role": "user", "content": prompt}],  
        stream=True  
    )  
      
    full_response = ""  
    for chunk in stream:  
        if chunk.choices[0].delta.content:  
            content = chunk.choices[0].delta.content  
            print(content, end="", flush=True)  
            full_response += content  
      
    print()  # 换行  
    return full_response  
  
# 使用  
response = stream_chat("讲一个短故事")
```

### Python 异步流式[​](/wiki/applications/streaming-output#python-异步流式 "Python 异步流式的直接链接")

```
import asyncio  
from openai import AsyncOpenAI  
  
async_client = AsyncOpenAI(  
    api_key="your-api-key",  
    base_url="http://122.51.35.238:5170/v1"  
)  
  
async def async_stream_chat(prompt):  
    stream = await async_client.chat.completions.create(  
        model="gpt-4o",  
        messages=[{"role": "user", "content": prompt}],  
        stream=True  
    )  
      
    full_response = ""  
    async for chunk in stream:  
        if chunk.choices[0].delta.content:  
            content = chunk.choices[0].delta.content  
            print(content, end="", flush=True)  
            full_response += content  
      
    return full_response  
  
# 运行  
asyncio.run(async_stream_chat("讲一个故事"))
```

## Web 应用集成[​](/wiki/applications/streaming-output#web-应用集成 "Web 应用集成的直接链接")

### FastAPI + SSE[​](/wiki/applications/streaming-output#fastapi--sse "FastAPI + SSE的直接链接")

```
from fastapi import FastAPI  
from fastapi.responses import StreamingResponse  
from openai import OpenAI  
  
app = FastAPI()  
client = OpenAI(api_key="your-api-key", base_url="http://122.51.35.238:5170/v1")  
  
async def generate_stream(prompt: str):  
    stream = client.chat.completions.create(  
        model="gpt-4o",  
        messages=[{"role": "user", "content": prompt}],  
        stream=True  
    )  
      
    for chunk in stream:  
        if chunk.choices[0].delta.content:  
            yield f"data: {chunk.choices[0].delta.content}\n\n"  
      
    yield "data: [DONE]\n\n"  
  
@app.get("/chat/stream")  
async def chat_stream(prompt: str):  
    return StreamingResponse(  
        generate_stream(prompt),  
        media_type="text/event-stream"  
    )
```

### 前端接收（JavaScript）[​](/wiki/applications/streaming-output#前端接收javascript "前端接收（JavaScript）的直接链接")

```
async function streamChat(prompt) {  
    const response = await fetch(`/chat/stream?prompt=${encodeURIComponent(prompt)}`);  
    const reader = response.body.getReader();  
    const decoder = new TextDecoder();  
      
    let result = '';  
      
    while (true) {  
        const { done, value } = await reader.read();  
        if (done) break;  
          
        const chunk = decoder.decode(value);  
        const lines = chunk.split('\n');  
          
        for (const line of lines) {  
            if (line.startsWith('data: ')) {  
                const data = line.slice(6);  
                if (data === '[DONE]') break;  
                  
                result += data;  
                document.getElementById('output').textContent = result;  
            }  
        }  
    }  
      
    return result;  
}
```

### React 组件[​](/wiki/applications/streaming-output#react-组件 "React 组件的直接链接")

```
import { useState } from 'react';  
  
function ChatStream() {  
    const [response, setResponse] = useState('');  
    const [loading, setLoading] = useState(false);  
      
    const sendMessage = async (message) => {  
        setLoading(true);  
        setResponse('');  
          
        try {  
            const res = await fetch('/chat/stream', {  
                method: 'POST',  
                headers: { 'Content-Type': 'application/json' },  
                body: JSON.stringify({ message })  
            });  
              
            const reader = res.body.getReader();  
            const decoder = new TextDecoder();  
              
            while (true) {  
                const { done, value } = await reader.read();  
                if (done) break;  
                  
                const chunk = decoder.decode(value);  
                // 解析 SSE 格式  
                const lines = chunk.split('\n');  
                for (const line of lines) {  
                    if (line.startsWith('data: ')) {  
                        const data = line.slice(6);  
                        if (data !== '[DONE]') {  
                            setResponse(prev => prev + data);  
                        }  
                    }  
                }  
            }  
        } finally {  
            setLoading(false);  
        }  
    };  
      
    return (  
        <div>  
            <button onClick={() => sendMessage('讲个故事')}>  
                发送  
            </button>  
            <div className="response">  
                {response}  
                {loading && <span className="cursor">|</span>}  
            </div>  
        </div>  
    );  
}
```

## 高级用法[​](/wiki/applications/streaming-output#高级用法 "高级用法的直接链接")

### 1. 收集完整响应[​](/wiki/applications/streaming-output#1-收集完整响应 "1. 收集完整响应的直接链接")

```
def stream_with_full_response(prompt):  
    stream = client.chat.completions.create(  
        model="gpt-4o",  
        messages=[{"role": "user", "content": prompt}],  
        stream=True  
    )  
      
    collected_chunks = []  
    collected_content = []  
      
    for chunk in stream:  
        collected_chunks.append(chunk)  
        if chunk.choices[0].delta.content:  
            collected_content.append(chunk.choices[0].delta.content)  
            yield chunk.choices[0].delta.content  
      
    # 获取完整响应  
    full_response = "".join(collected_content)  
    return full_response
```

### 2. 超时处理[​](/wiki/applications/streaming-output#2-超时处理 "2. 超时处理的直接链接")

```
import signal  
  
class TimeoutError(Exception):  
    pass  
  
def timeout_handler(signum, frame):  
    raise TimeoutError("流式响应超时")  
  
def stream_with_timeout(prompt, timeout=30):  
    signal.signal(signal.SIGALRM, timeout_handler)  
    signal.alarm(timeout)  
      
    try:  
        stream = client.chat.completions.create(  
            model="gpt-4o",  
            messages=[{"role": "user", "content": prompt}],  
            stream=True  
        )  
          
        for chunk in stream:  
            if chunk.choices[0].delta.content:  
                yield chunk.choices[0].delta.content  
    finally:  
        signal.alarm(0)  # 取消超时
```

### 3. 流式 + 函数调用[​](/wiki/applications/streaming-output#3-流式--函数调用 "3. 流式 + 函数调用的直接链接")

```
def stream_with_functions(prompt, tools):  
    stream = client.chat.completions.create(  
        model="gpt-4o",  
        messages=[{"role": "user", "content": prompt}],  
        tools=tools,  
        stream=True  
    )  
      
    collected_tool_calls = []  
      
    for chunk in stream:  
        delta = chunk.choices[0].delta  
          
        # 处理文本内容  
        if delta.content:  
            yield {"type": "content", "content": delta.content}  
          
        # 处理工具调用  
        if delta.tool_calls:  
            for tool_call in delta.tool_calls:  
                if tool_call.index >= len(collected_tool_calls):  
                    collected_tool_calls.append({  
                        "id": tool_call.id,  
                        "function": {"name": "", "arguments": ""}  
                    })  
                  
                if tool_call.function.name:  
                    collected_tool_calls[tool_call.index]["function"]["name"] = tool_call.function.name  
                if tool_call.function.arguments:  
                    collected_tool_calls[tool_call.index]["function"]["arguments"] += tool_call.function.arguments  
      
    if collected_tool_calls:  
        yield {"type": "tool_calls", "tool_calls": collected_tool_calls}
```

## 流式输出格式[​](/wiki/applications/streaming-output#流式输出格式 "流式输出格式的直接链接")

### Server-Sent Events (SSE)[​](/wiki/applications/streaming-output#server-sent-events-sse "Server-Sent Events (SSE)的直接链接")

标准的 SSE 格式：

```
data: {"content": "你"}  
  
data: {"content": "好"}  
  
data: {"content": "！"}  
  
data: [DONE]
```

### OpenAI 流式格式[​](/wiki/applications/streaming-output#openai-流式格式 "OpenAI 流式格式的直接链接")

```
# 每个 chunk 的结构  
{  
    "id": "chatcmpl-xxx",  
    "object": "chat.completion.chunk",  
    "created": 1234567890,  
    "model": "gpt-4o",  
    "choices": [  
        {  
            "index": 0,  
            "delta": {  
                "role": "assistant",  # 只在第一个 chunk  
                "content": "部分内容"  # 后续 chunk  
            },  
            "finish_reason": None  # 最后一个 chunk 为 "stop"  
        }  
    ]  
}
```

## 注意事项[​](/wiki/applications/streaming-output#注意事项 "注意事项的直接链接")

### 1. 连接中断处理[​](/wiki/applications/streaming-output#1-连接中断处理 "1. 连接中断处理的直接链接")

```
def robust_stream(prompt):  
    try:  
        stream = client.chat.completions.create(  
            model="gpt-4o",  
            messages=[{"role": "user", "content": prompt}],  
            stream=True  
        )  
          
        for chunk in stream:  
            if chunk.choices[0].delta.content:  
                yield chunk.choices[0].delta.content  
                  
    except Exception as e:  
        yield f"\n[连接中断: {str(e)}]"
```

### 2. 取消请求[​](/wiki/applications/streaming-output#2-取消请求 "2. 取消请求的直接链接")

```
import threading  
  
class CancellableStream:  
    def __init__(self):  
        self.cancelled = False  
      
    def cancel(self):  
        self.cancelled = True  
      
    def stream(self, prompt):  
        stream = client.chat.completions.create(  
            model="gpt-4o",  
            messages=[{"role": "user", "content": prompt}],  
            stream=True  
        )  
          
        for chunk in stream:  
            if self.cancelled:  
                break  
            if chunk.choices[0].delta.content:  
                yield chunk.choices[0].delta.content
```

## 最佳实践[​](/wiki/applications/streaming-output#最佳实践 "最佳实践的直接链接")

1. **始终使用流式：** 长文本生成必须使用流式
2. **处理连接问题：** 添加错误处理和重试
3. **用户体验：** 添加加载指示器
4. **取消支持：** 允许用户中断生成
5. **日志记录：** 记录完整响应用于调试


---

> 本页内容来自文档知识库整理，已按 ArmNet 字元服务 服务命名统一更新。
