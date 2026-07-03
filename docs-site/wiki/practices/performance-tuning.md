---
title: "性能调优"
description: "通过 ArmNet 字元服务 大模型API中转服务优化 LLM 应用的响应速度和吞吐量"
lastUpdated: true
---

# 性能调优

LLM 应用的性能优化涉及减少延迟、提高吞吐量、降低成本等多个方面。本文介绍常用的性能调优技术。

## 性能指标[​](/wiki/practices/performance-tuning#性能指标 "性能指标的直接链接")

### 关键指标[​](/wiki/practices/performance-tuning#关键指标 "关键指标的直接链接")

| 指标 | 说明 | 优化目标 |
| --- | --- | --- |
| TTFB | 首字节时间 | < 1 秒 |
| 延迟 | 完整响应时间 | 取决于输出长度 |
| 吞吐量 | QPS | 最大化 |
| Token/秒 | 生成速度 | 最大化 |

### 影响因素[​](/wiki/practices/performance-tuning#影响因素 "影响因素的直接链接")

- 模型大小
- 输入/输出长度
- 网络延迟
- 并发数
- API 服务器负载

## 优化策略[​](/wiki/practices/performance-tuning#优化策略 "优化策略的直接链接")

### 1. 模型选择[​](/wiki/practices/performance-tuning#1-模型选择 "1. 模型选择的直接链接")

选择合适的模型平衡性能和质量：

```
def select_model_for_performance(task_type, latency_requirement):  
    if latency_requirement == "low":  
        # 低延迟场景  
        return "gpt-4o-mini"  # 更快  
    elif task_type == "simple":  
        return "gpt-4o-mini"  
    else:  
        return "gpt-4o"
```

### 2. 流式输出[​](/wiki/practices/performance-tuning#2-流式输出 "2. 流式输出的直接链接")

使用流式输出改善用户体验：

```
def stream_response(prompt):  
    stream = client.chat.completions.create(  
        model="gpt-4o",  
        messages=[{"role": "user", "content": prompt}],  
        stream=True  
    )  
      
    for chunk in stream:  
        if chunk.choices[0].delta.content:  
            yield chunk.choices[0].delta.content
```

### 3. 并发请求[​](/wiki/practices/performance-tuning#3-并发请求 "3. 并发请求的直接链接")

使用异步并发提高吞吐量：

```
import asyncio  
from openai import AsyncOpenAI  
  
async_client = AsyncOpenAI(  
    api_key="your-api-key",  
    base_url="http://122.51.35.238:5170/v1"  
)  
  
async def concurrent_requests(prompts, max_concurrent=10):  
    semaphore = asyncio.Semaphore(max_concurrent)  
      
    async def process_one(prompt):  
        async with semaphore:  
            response = await async_client.chat.completions.create(  
                model="gpt-4o-mini",  
                messages=[{"role": "user", "content": prompt}]  
            )  
            return response.choices[0].message.content  
      
    tasks = [process_one(p) for p in prompts]  
    return await asyncio.gather(*tasks)  
  
# 使用  
prompts = ["问题1", "问题2", "问题3", ...]  
results = asyncio.run(concurrent_requests(prompts, max_concurrent=20))
```

### 4. 连接池[​](/wiki/practices/performance-tuning#4-连接池 "4. 连接池的直接链接")

复用 HTTP 连接：

```
import httpx  
  
# 创建持久连接的客户端  
http_client = httpx.Client(  
    limits=httpx.Limits(  
        max_keepalive_connections=20,  
        max_connections=100,  
        keepalive_expiry=30  
    ),  
    timeout=httpx.Timeout(60.0)  
)  
  
client = OpenAI(  
    api_key="your-api-key",  
    base_url="http://122.51.35.238:5170/v1",  
    http_client=http_client  
)
```

### 5. 缓存[​](/wiki/practices/performance-tuning#5-缓存 "5. 缓存的直接链接")

缓存常见请求：

```
import hashlib  
import redis  
  
redis_client = redis.Redis()  
  
def cached_llm_call(messages, model="gpt-4o", ttl=3600):  
    # 生成缓存键  
    cache_key = hashlib.md5(  
        f"{model}:{str(messages)}".encode()  
    ).hexdigest()  
      
    # 检查缓存  
    cached = redis_client.get(cache_key)  
    if cached:  
        return cached.decode()  
      
    # 调用 API  
    response = client.chat.completions.create(  
        model=model,  
        messages=messages  
    )  
    result = response.choices[0].message.content  
      
    # 存入缓存  
    redis_client.setex(cache_key, ttl, result)  
      
    return result
```

## Prompt 优化[​](/wiki/practices/performance-tuning#prompt-优化 "Prompt 优化的直接链接")

### 1. 精简输入[​](/wiki/practices/performance-tuning#1-精简输入 "1. 精简输入的直接链接")

```
def optimize_prompt(prompt, max_tokens=1000):  
    # 移除多余空白  
    prompt = " ".join(prompt.split())  
      
    # 如果太长，进行摘要  
    if count_tokens(prompt) > max_tokens:  
        prompt = summarize(prompt, max_tokens)  
      
    return prompt
```

### 2. 限制输出[​](/wiki/practices/performance-tuning#2-限制输出 "2. 限制输出的直接链接")

```
response = client.chat.completions.create(  
    model="gpt-4o",  
    messages=messages,  
    max_tokens=500,  # 限制输出长度  
    stop=["。", ".", "\n\n"]  # 提前停止  
)
```

### 3. 使用结构化输出[​](/wiki/practices/performance-tuning#3-使用结构化输出 "3. 使用结构化输出的直接链接")

```
response = client.chat.completions.create(  
    model="gpt-4o",  
    messages=[  
        {"role": "system", "content": "只返回 JSON，不要其他内容"},  
        {"role": "user", "content": "提取姓名和年龄"}  
    ],  
    response_format={"type": "json_object"}  
)
```

## 架构优化[​](/wiki/practices/performance-tuning#架构优化 "架构优化的直接链接")

### 1. 预热[​](/wiki/practices/performance-tuning#1-预热 "1. 预热的直接链接")

应用启动时预热连接：

```
def warmup():  
    """预热 API 连接"""  
    try:  
        client.chat.completions.create(  
            model="gpt-4o-mini",  
            messages=[{"role": "user", "content": "hi"}],  
            max_tokens=1  
        )  
    except:  
        pass  
  
# 应用启动时调用  
warmup()
```

### 2. 负载均衡[​](/wiki/practices/performance-tuning#2-负载均衡 "2. 负载均衡的直接链接")

多个 API 端点轮询：

```
import itertools  
  
class LoadBalancer:  
    def __init__(self, endpoints):  
        self.endpoints = itertools.cycle(endpoints)  
        self.clients = {  
            ep: OpenAI(api_key="key", base_url=ep)  
            for ep in endpoints  
        }  
      
    def get_client(self):  
        endpoint = next(self.endpoints)  
        return self.clients[endpoint]  
  
balancer = LoadBalancer([  
    "https://api1.example.com/v1",  
    "https://api2.example.com/v1"  
])  
  
def call_with_lb(messages):  
    client = balancer.get_client()  
    return client.chat.completions.create(  
        model="gpt-4o",  
        messages=messages  
    )
```

### 3. 队列处理[​](/wiki/practices/performance-tuning#3-队列处理 "3. 队列处理的直接链接")

使用消息队列处理请求：

```
import queue  
import threading  
  
request_queue = queue.Queue()  
result_dict = {}  
  
def worker():  
    while True:  
        request_id, messages = request_queue.get()  
        try:  
            result = call_llm(messages)  
            result_dict[request_id] = {"success": True, "result": result}  
        except Exception as e:  
            result_dict[request_id] = {"success": False, "error": str(e)}  
        request_queue.task_done()  
  
# 启动工作线程  
for _ in range(5):  
    t = threading.Thread(target=worker, daemon=True)  
    t.start()  
  
def async_call(request_id, messages):  
    request_queue.put((request_id, messages))
```

## 监控和分析[​](/wiki/practices/performance-tuning#监控和分析 "监控和分析的直接链接")

### 性能监控[​](/wiki/practices/performance-tuning#性能监控 "性能监控的直接链接")

```
import time  
from dataclasses import dataclass  
from typing import List  
  
@dataclass  
class PerformanceMetrics:  
    latency: float  
    input_tokens: int  
    output_tokens: int  
    model: str  
  
class PerformanceMonitor:  
    def __init__(self):  
        self.metrics: List[PerformanceMetrics] = []  
      
    def record(self, metric: PerformanceMetrics):  
        self.metrics.append(metric)  
      
    def get_stats(self):  
        if not self.metrics:  
            return {}  
          
        latencies = [m.latency for m in self.metrics]  
        return {  
            "avg_latency": sum(latencies) / len(latencies),  
            "p50_latency": sorted(latencies)[len(latencies) // 2],  
            "p99_latency": sorted(latencies)[int(len(latencies) * 0.99)],  
            "total_requests": len(self.metrics),  
            "total_tokens": sum(m.input_tokens + m.output_tokens for m in self.metrics)  
        }  
  
monitor = PerformanceMonitor()  
  
def monitored_call(messages, model="gpt-4o"):  
    start = time.time()  
    response = client.chat.completions.create(  
        model=model,  
        messages=messages  
    )  
    latency = time.time() - start  
      
    monitor.record(PerformanceMetrics(  
        latency=latency,  
        input_tokens=response.usage.prompt_tokens,  
        output_tokens=response.usage.completion_tokens,  
        model=model  
    ))  
      
    return response.choices[0].message.content
```

### 瓶颈分析[​](/wiki/practices/performance-tuning#瓶颈分析 "瓶颈分析的直接链接")

```
import cProfile  
import pstats  
  
def profile_function(func, *args, **kwargs):  
    profiler = cProfile.Profile()  
    profiler.enable()  
      
    result = func(*args, **kwargs)  
      
    profiler.disable()  
    stats = pstats.Stats(profiler)  
    stats.sort_stats('cumulative')  
    stats.print_stats(10)  
      
    return result
```

## 性能优化清单[​](/wiki/practices/performance-tuning#性能优化清单 "性能优化清单的直接链接")

| 优化项 | 效果 | 实施难度 |
| --- | --- | --- |
| 流式输出 | 改善体验 | 低 |
| 结果缓存 | 减少调用 | 中 |
| 并发请求 | 提高吞吐 | 中 |
| 模型降级 | 降低延迟 | 低 |
| 连接复用 | 减少开销 | 低 |
| Prompt 优化 | 减少 Token | 低 |

## 最佳实践[​](/wiki/practices/performance-tuning#最佳实践 "最佳实践的直接链接")

1. **测量先行：** 先测量，再优化
2. **流式优先：** 长回复必须使用流式
3. **合理并发：** 根据 API 限制设置并发数
4. **缓存策略：** 缓存可重复的请求
5. **监控告警：** 监控延迟和错误率
6. **渐进优化：** 一次优化一个方面


---

> 本页内容来自文档知识库整理，已按 ArmNet 字元服务 服务命名统一更新。
