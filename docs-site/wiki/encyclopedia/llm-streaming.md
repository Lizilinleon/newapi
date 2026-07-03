---
title: "LLM 流式输出"
description: "使用 ArmNet 字元服务 大模型API中转服务实现 SSE 流式输出的完整指南"
lastUpdated: true
---

# LLM 流式输出

流式输出（Streaming）是让 AI 回复实时显示的技术，可以大幅提升用户体验，特别是在生成长文本时。

## 为什么需要流式输出[​](/wiki/encyclopedia/llm-streaming#为什么需要流式输出 "为什么需要流式输出的直接链接")

### 传统模式问题[​](/wiki/encyclopedia/llm-streaming#传统模式问题 "传统模式问题的直接链接")

```
请求 → 等待3-30秒 → 一次性返回全部内容
```

用户体验问题：

- 长时间空白等待
- 无法判断是否正在处理
- 无法提前预览内容

### 流式模式优势[​](/wiki/encyclopedia/llm-streaming#流式模式优势 "流式模式优势的直接链接")

```
请求 → 立即返回第一个字 → 持续返回 → 完成
```

优势：

- 首字延迟极低
- 打字机效果更自然
- 可随时中断

## 基础实现[​](/wiki/encyclopedia/llm-streaming#基础实现 "基础实现的直接链接")

### Python 同步流式[​](/wiki/encyclopedia/llm-streaming#python-同步流式 "Python 同步流式的直接链接")

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
        content = chunk.choices[0].delta.content  
        if content:  
            print(content, end="", flush=True)  
            full_response += content  
      
    print()  # 换行  
    return full_response
```

### Python 异步流式[​](/wiki/encyclopedia/llm-streaming#python-异步流式 "Python 异步流式的直接链接")

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
        content = chunk.choices[0].delta.content  
        if content:  
            print(content, end="", flush=True)  
            full_response += content  
      
    return full_response  
  
# 运行  
asyncio.run(async_stream_chat("讲一个故事"))
```

## 流式数据格式[​](/wiki/encyclopedia/llm-streaming#流式数据格式 "流式数据格式的直接链接")

### SSE 格式[​](/wiki/encyclopedia/llm-streaming#sse-格式 "SSE 格式的直接链接")

Server-Sent Events 是流式输出的标准格式：

```
data: {"id":"chatcmpl-xxx","choices":[{"delta":{"role":"assistant"}}]}  
  
data: {"id":"chatcmpl-xxx","choices":[{"delta":{"content":"你"}}]}  
  
data: {"id":"chatcmpl-xxx","choices":[{"delta":{"content":"好"}}]}  
  
data: {"id":"chatcmpl-xxx","choices":[{"delta":{}}],"finish_reason":"stop"}  
  
data: [DONE]
```

### Chunk 结构[​](/wiki/encyclopedia/llm-streaming#chunk-结构 "Chunk 结构的直接链接")

```
{  
    "id": "chatcmpl-xxx",  
    "object": "chat.completion.chunk",  
    "created": 1234567890,  
    "model": "gpt-4o",  
    "choices": [{  
        "index": 0,  
        "delta": {  
            "role": "assistant",  # 仅首个 chunk  
            "content": "部分内容"   # 后续 chunk  
        },  
        "finish_reason": None  # 最后为 "stop"  
    }]  
}
```

## Web 应用集成[​](/wiki/encyclopedia/llm-streaming#web-应用集成 "Web 应用集成的直接链接")

### FastAPI + SSE[​](/wiki/encyclopedia/llm-streaming#fastapi--sse "FastAPI + SSE的直接链接")

```
from fastapi import FastAPI  
from fastapi.responses import StreamingResponse  
  
app = FastAPI()  
  
async def generate_stream(prompt: str):  
    stream = client.chat.completions.create(  
        model="gpt-4o",  
        messages=[{"role": "user", "content": prompt}],  
        stream=True  
    )  
      
    for chunk in stream:  
        if chunk.choices[0].delta.content:  
            content = chunk.choices[0].delta.content  
            yield f"data: {content}\n\n"  
      
    yield "data: [DONE]\n\n"  
  
@app.get("/chat/stream")  
async def chat_stream(prompt: str):  
    return StreamingResponse(  
        generate_stream(prompt),  
        media_type="text/event-stream",  
        headers={  
            "Cache-Control": "no-cache",  
            "Connection": "keep-alive"  
        }  
    )
```

### Flask + SSE[​](/wiki/encyclopedia/llm-streaming#flask--sse "Flask + SSE的直接链接")

```
from flask import Flask, Response  
  
app = Flask(__name__)  
  
def generate(prompt):  
    stream = client.chat.completions.create(  
        model="gpt-4o",  
        messages=[{"role": "user", "content": prompt}],  
        stream=True  
    )  
      
    for chunk in stream:  
        if chunk.choices[0].delta.content:  
            yield f"data: {chunk.choices[0].delta.content}\n\n"  
      
    yield "data: [DONE]\n\n"  
  
@app.route('/stream')  
def stream():  
    prompt = request.args.get('prompt')  
    return Response(  
        generate(prompt),  
        mimetype='text/event-stream'  
    )
```

### 前端接收[​](/wiki/encyclopedia/llm-streaming#前端接收 "前端接收的直接链接")

```
async function streamChat(prompt) {  
    const response = await fetch(`/chat/stream?prompt=${encodeURIComponent(prompt)}`);  
    const reader = response.body.getReader();  
    const decoder = new TextDecoder();  
      
    let result = '';  
    const outputElement = document.getElementById('output');  
      
    while (true) {  
        const { done, value } = await reader.read();  
        if (done) break;  
          
        const chunk = decoder.decode(value);  
        const lines = chunk.split('\n');  
          
        for (const line of lines) {  
            if (line.startsWith('data: ')) {  
                const data = line.slice(6);  
                if (data === '[DONE]') {  
                    return result;  
                }  
                result += data;  
                outputElement.textContent = result;  
            }  
        }  
    }  
      
    return result;  
}
```

### React 组件[​](/wiki/encyclopedia/llm-streaming#react-组件 "React 组件的直接链接")

```
import { useState, useCallback } from 'react';  
  
function ChatStream() {  
    const [response, setResponse] = useState('');  
    const [loading, setLoading] = useState(false);  
      
    const sendMessage = useCallback(async (message) => {  
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
                  
                const text = decoder.decode(value);  
                const lines = text.split('\n');  
                  
                for (const line of lines) {  
                    if (line.startsWith('data: ') && line !== 'data: [DONE]') {  
                        const content = line.slice(6);  
                        setResponse(prev => prev + content);  
                    }  
                }  
            }  
        } finally {  
            setLoading(false);  
        }  
    }, []);  
      
    return (  
        <div>  
            <button onClick={() => sendMessage('讲个故事')} disabled={loading}>  
                {loading ? '生成中...' : '发送'}  
            </button>  
            <div className="response">  
                {response}  
                {loading && <span className="cursor blink">|</span>}  
            </div>  
        </div>  
    );  
}
```

## 高级功能[​](/wiki/encyclopedia/llm-streaming#高级功能 "高级功能的直接链接")

### 收集完整响应[​](/wiki/encyclopedia/llm-streaming#收集完整响应 "收集完整响应的直接链接")

```
def stream_with_callback(prompt, on_chunk=None, on_complete=None):  
    stream = client.chat.completions.create(  
        model="gpt-4o",  
        messages=[{"role": "user", "content": prompt}],  
        stream=True  
    )  
      
    full_response = ""  
      
    for chunk in stream:  
        content = chunk.choices[0].delta.content  
        if content:  
            full_response += content  
            if on_chunk:  
                on_chunk(content)  
      
    if on_complete:  
        on_complete(full_response)  
      
    return full_response  
  
# 使用  
stream_with_callback(  
    "讲个故事",  
    on_chunk=lambda c: print(c, end=""),  
    on_complete=lambda r: print(f"\n\n总字数: {len(r)}")  
)
```

### 流式 + 函数调用[​](/wiki/encyclopedia/llm-streaming#流式--函数调用 "流式 + 函数调用的直接链接")

```
def stream_with_tools(prompt, tools):  
    stream = client.chat.completions.create(  
        model="gpt-4o",  
        messages=[{"role": "user", "content": prompt}],  
        tools=tools,  
        stream=True  
    )  
      
    content_buffer = ""  
    tool_calls = {}  
      
    for chunk in stream:  
        delta = chunk.choices[0].delta  
          
        # 处理文本  
        if delta.content:  
            content_buffer += delta.content  
            yield {"type": "content", "content": delta.content}  
          
        # 处理工具调用  
        if delta.tool_calls:  
            for tc in delta.tool_calls:  
                if tc.index not in tool_calls:  
                    tool_calls[tc.index] = {  
                        "id": tc.id,  
                        "function": {"name": "", "arguments": ""}  
                    }  
                  
                if tc.function.name:  
                    tool_calls[tc.index]["function"]["name"] = tc.function.name  
                if tc.function.arguments:  
                    tool_calls[tc.index]["function"]["arguments"] += tc.function.arguments  
      
    if tool_calls:  
        yield {"type": "tool_calls", "tool_calls": list(tool_calls.values())}
```

### 可取消的流式请求[​](/wiki/encyclopedia/llm-streaming#可取消的流式请求 "可取消的流式请求的直接链接")

```
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
              
            content = chunk.choices[0].delta.content  
            if content:  
                yield content  
  
# 使用  
streamer = CancellableStream()  
  
# 在另一个线程中取消  
# streamer.cancel()
```

### 超时处理[​](/wiki/encyclopedia/llm-streaming#超时处理 "超时处理的直接链接")

```
import signal  
  
def stream_with_timeout(prompt, timeout=30):  
    def timeout_handler(signum, frame):  
        raise TimeoutError("流式响应超时")  
      
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
        signal.alarm(0)
```

## 错误处理[​](/wiki/encyclopedia/llm-streaming#错误处理 "错误处理的直接链接")

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
      
    except ConnectionError:  
        yield "\n[连接中断]"  
    except TimeoutError:  
        yield "\n[请求超时]"  
    except Exception as e:  
        yield f"\n[错误: {str(e)}]"
```

## 最佳实践[​](/wiki/encyclopedia/llm-streaming#最佳实践 "最佳实践的直接链接")

1. **始终使用流式：** 长文本生成必须使用流式
2. **处理中断：** 用户可能随时中断
3. **错误恢复：** 处理连接中断等问题
4. **进度指示：** 显示加载状态
5. **资源清理：** 取消时正确关闭连接
6. **日志记录：** 记录完整响应用于调试


---

> 本页内容来自文档知识库整理，已按 ArmNet 字元服务 服务命名统一更新。
