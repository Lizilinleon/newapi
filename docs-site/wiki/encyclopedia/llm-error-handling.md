---
title: "LLM 错误处理"
description: "使用 ArmNet 字元服务 大模型API中转服务时的错误处理完整指南"
lastUpdated: true
---

# LLM 错误处理

在使用 LLM API 时，正确处理各种错误情况是构建稳定应用的关键。本文详细介绍常见错误类型及处理方法。

## 错误分类[​](/wiki/encyclopedia/llm-error-handling#错误分类 "错误分类的直接链接")

### HTTP 错误[​](/wiki/encyclopedia/llm-error-handling#http-错误 "HTTP 错误的直接链接")

| 状态码 | 名称 | 原因 | 解决方案 |
| --- | --- | --- | --- |
| 400 | Bad Request | 请求格式错误 | 检查参数格式 |
| 401 | Unauthorized | API Key 无效 | 检查密钥配置 |
| 403 | Forbidden | 无权限访问 | 检查账户权限 |
| 404 | Not Found | 资源不存在 | 检查模型名称 |
| 429 | Too Many Requests | 请求过于频繁 | 降低频率或重试 |
| 500 | Internal Server Error | 服务器内部错误 | 重试请求 |
| 502 | Bad Gateway | 网关错误 | 稍后重试 |
| 503 | Service Unavailable | 服务不可用 | 稍后重试 |
| 504 | Gateway Timeout | 网关超时 | 增加超时时间 |

### SDK 异常类型[​](/wiki/encyclopedia/llm-error-handling#sdk-异常类型 "SDK 异常类型的直接链接")

```
from openai import (  
    APIError,  
    APIConnectionError,  
    RateLimitError,  
    AuthenticationError,  
    BadRequestError,  
    NotFoundError,  
    PermissionDeniedError,  
    UnprocessableEntityError,  
    InternalServerError,  
    APITimeoutError  
)
```

## 基础错误处理[​](/wiki/encyclopedia/llm-error-handling#基础错误处理 "基础错误处理的直接链接")

### 完整的 try-except[​](/wiki/encyclopedia/llm-error-handling#完整的-try-except "完整的 try-except的直接链接")

```
from openai import OpenAI, APIError, RateLimitError, AuthenticationError  
  
client = OpenAI(api_key="your-api-key", base_url="http://122.51.35.238:5170/v1")  
  
def safe_chat(messages, model="gpt-4o"):  
    try:  
        response = client.chat.completions.create(  
            model=model,  
            messages=messages  
        )  
        return {"success": True, "content": response.choices[0].message.content}  
      
    except AuthenticationError as e:  
        return {"success": False, "error": "auth_error", "message": "API Key 无效"}  
      
    except RateLimitError as e:  
        return {"success": False, "error": "rate_limit", "message": "请求过于频繁"}  
      
    except APIConnectionError as e:  
        return {"success": False, "error": "connection_error", "message": "网络连接失败"}  
      
    except BadRequestError as e:  
        return {"success": False, "error": "bad_request", "message": f"请求错误: {e}"}  
      
    except InternalServerError as e:  
        return {"success": False, "error": "server_error", "message": "服务器错误"}  
      
    except APIError as e:  
        return {"success": False, "error": "api_error", "message": str(e)}  
      
    except Exception as e:  
        return {"success": False, "error": "unknown", "message": str(e)}
```

## 重试策略[​](/wiki/encyclopedia/llm-error-handling#重试策略 "重试策略的直接链接")

### 简单重试[​](/wiki/encyclopedia/llm-error-handling#简单重试 "简单重试的直接链接")

```
import time  
  
def retry_chat(messages, max_retries=3, delay=1):  
    last_error = None  
      
    for attempt in range(max_retries):  
        try:  
            response = client.chat.completions.create(  
                model="gpt-4o",  
                messages=messages  
            )  
            return response.choices[0].message.content  
          
        except RateLimitError as e:  
            last_error = e  
            wait_time = delay * (2 ** attempt)  # 指数退避  
            print(f"速率限制，等待 {wait_time}s 后重试...")  
            time.sleep(wait_time)  
          
        except (APIError, InternalServerError) as e:  
            if attempt < max_retries - 1:  
                last_error = e  
                time.sleep(delay)  
            else:  
                raise  
      
    raise last_error
```

### 使用 tenacity 库[​](/wiki/encyclopedia/llm-error-handling#使用-tenacity-库 "使用 tenacity 库的直接链接")

```
from tenacity import (  
    retry,  
    stop_after_attempt,  
    wait_exponential,  
    retry_if_exception_type,  
    before_sleep_log  
)  
import logging  
  
logger = logging.getLogger(__name__)  
  
@retry(  
    stop=stop_after_attempt(3),  
    wait=wait_exponential(multiplier=1, min=1, max=60),  
    retry=retry_if_exception_type((RateLimitError, APIError, InternalServerError)),  
    before_sleep=before_sleep_log(logger, logging.WARNING)  
)  
def robust_chat(messages):  
    return client.chat.completions.create(  
        model="gpt-4o",  
        messages=messages  
    ).choices[0].message.content
```

### 自定义重试逻辑[​](/wiki/encyclopedia/llm-error-handling#自定义重试逻辑 "自定义重试逻辑的直接链接")

```
from dataclasses import dataclass  
from typing import Callable, Optional  
import time  
  
@dataclass  
class RetryConfig:  
    max_retries: int = 3  
    initial_delay: float = 1.0  
    max_delay: float = 60.0  
    exponential_base: float = 2.0  
    retryable_errors: tuple = (RateLimitError, InternalServerError)  
  
def with_retry(config: RetryConfig):  
    def decorator(func: Callable):  
        def wrapper(*args, **kwargs):  
            last_error = None  
            delay = config.initial_delay  
              
            for attempt in range(config.max_retries):  
                try:  
                    return func(*args, **kwargs)  
                except config.retryable_errors as e:  
                    last_error = e  
                    if attempt < config.max_retries - 1:  
                        sleep_time = min(delay, config.max_delay)  
                        time.sleep(sleep_time)  
                        delay *= config.exponential_base  
                except Exception:  
                    raise  
              
            raise last_error  
        return wrapper  
    return decorator  
  
@with_retry(RetryConfig(max_retries=5))  
def call_llm(messages):  
    return client.chat.completions.create(  
        model="gpt-4o",  
        messages=messages  
    )
```

## 超时处理[​](/wiki/encyclopedia/llm-error-handling#超时处理 "超时处理的直接链接")

### 设置超时[​](/wiki/encyclopedia/llm-error-handling#设置超时 "设置超时的直接链接")

```
# 全局超时  
client = OpenAI(  
    api_key="your-api-key",  
    base_url="http://122.51.35.238:5170/v1",  
    timeout=30.0  
)  
  
# 单次请求超时  
response = client.chat.completions.create(  
    model="gpt-4o",  
    messages=messages,  
    timeout=60.0  
)
```

### 超时重试[​](/wiki/encyclopedia/llm-error-handling#超时重试 "超时重试的直接链接")

```
from openai import APITimeoutError  
  
def call_with_timeout_retry(messages, initial_timeout=30, max_retries=2):  
    timeout = initial_timeout  
      
    for attempt in range(max_retries):  
        try:  
            return client.chat.completions.create(  
                model="gpt-4o",  
                messages=messages,  
                timeout=timeout  
            )  
        except APITimeoutError:  
            if attempt < max_retries - 1:  
                timeout *= 1.5  # 增加超时时间  
                print(f"超时，使用 {timeout}s 超时重试")  
            else:  
                raise
```

## 降级策略[​](/wiki/encyclopedia/llm-error-handling#降级策略 "降级策略的直接链接")

### 模型降级[​](/wiki/encyclopedia/llm-error-handling#模型降级 "模型降级的直接链接")

```
def call_with_fallback(messages):  
    models = ["gpt-4o", "gpt-4o-mini", "gpt-3.5-turbo"]  
      
    for model in models:  
        try:  
            return client.chat.completions.create(  
                model=model,  
                messages=messages  
            ).choices[0].message.content  
        except Exception as e:  
            print(f"{model} 失败: {e}")  
            continue  
      
    raise Exception("所有模型都失败了")
```

### 缓存降级[​](/wiki/encyclopedia/llm-error-handling#缓存降级 "缓存降级的直接链接")

```
import hashlib  
import json  
  
cache = {}  
  
def call_with_cache_fallback(messages):  
    cache_key = hashlib.md5(json.dumps(messages).encode()).hexdigest()  
      
    try:  
        response = client.chat.completions.create(  
            model="gpt-4o",  
            messages=messages  
        )  
        result = response.choices[0].message.content  
        cache[cache_key] = result  
        return result  
      
    except Exception as e:  
        if cache_key in cache:  
            print("使用缓存结果")  
            return cache[cache_key]  
        raise
```

### 静态响应降级[​](/wiki/encyclopedia/llm-error-handling#静态响应降级 "静态响应降级的直接链接")

```
def call_with_static_fallback(messages, fallback_response="抱歉，服务暂时不可用"):  
    try:  
        return client.chat.completions.create(  
            model="gpt-4o",  
            messages=messages  
        ).choices[0].message.content  
    except Exception as e:  
        logger.error(f"API 调用失败: {e}")  
        return fallback_response
```

## 速率限制处理[​](/wiki/encyclopedia/llm-error-handling#速率限制处理 "速率限制处理的直接链接")

### 提取重试时间[​](/wiki/encyclopedia/llm-error-handling#提取重试时间 "提取重试时间的直接链接")

```
def handle_rate_limit(error):  
    # 从错误信息中提取等待时间  
    import re  
      
    error_message = str(error)  
    match = re.search(r"retry after (\d+)", error_message, re.IGNORECASE)  
      
    if match:  
        return int(match.group(1))  
    return 60  # 默认等待 60 秒
```

### 令牌桶限流[​](/wiki/encyclopedia/llm-error-handling#令牌桶限流 "令牌桶限流的直接链接")

```
import time  
from threading import Lock  
  
class TokenBucket:  
    def __init__(self, rate, capacity):  
        self.rate = rate  
        self.capacity = capacity  
        self.tokens = capacity  
        self.last_update = time.time()  
        self.lock = Lock()  
      
    def acquire(self, tokens=1):  
        with self.lock:  
            now = time.time()  
            elapsed = now - self.last_update  
            self.tokens = min(self.capacity, self.tokens + elapsed * self.rate)  
            self.last_update = now  
              
            if self.tokens >= tokens:  
                self.tokens -= tokens  
                return True  
            return False  
      
    def wait_and_acquire(self, tokens=1):  
        while not self.acquire(tokens):  
            time.sleep(0.1)  
  
# 每秒 10 个请求，最多积累 20 个  
bucket = TokenBucket(rate=10, capacity=20)  
  
def rate_limited_call(messages):  
    bucket.wait_and_acquire()  
    return client.chat.completions.create(  
        model="gpt-4o",  
        messages=messages  
    )
```

## 日志记录[​](/wiki/encyclopedia/llm-error-handling#日志记录 "日志记录的直接链接")

```
import logging  
from datetime import datetime  
  
class ErrorLogger:  
    def __init__(self):  
        self.logger = logging.getLogger("llm_errors")  
        handler = logging.FileHandler("llm_errors.log")  
        handler.setFormatter(logging.Formatter(  
            '%(asctime)s - %(levelname)s - %(message)s'  
        ))  
        self.logger.addHandler(handler)  
        self.logger.setLevel(logging.ERROR)  
      
    def log(self, error, context=None):  
        self.logger.error({  
            "timestamp": datetime.now().isoformat(),  
            "error_type": type(error).__name__,  
            "error_message": str(error),  
            "context": context  
        })  
  
error_logger = ErrorLogger()  
  
def logged_call(messages):  
    try:  
        return client.chat.completions.create(  
            model="gpt-4o",  
            messages=messages  
        )  
    except Exception as e:  
        error_logger.log(e, {"messages": messages})  
        raise
```

## 用户友好错误[​](/wiki/encyclopedia/llm-error-handling#用户友好错误 "用户友好错误的直接链接")

```
ERROR_MESSAGES = {  
    "AuthenticationError": "认证失败，请检查 API 密钥",  
    "RateLimitError": "服务繁忙，请稍后再试",  
    "APIConnectionError": "网络连接失败，请检查网络",  
    "BadRequestError": "请求格式错误",  
    "InternalServerError": "服务器暂时不可用",  
}  
  
def get_user_message(error):  
    error_type = type(error).__name__  
    return ERROR_MESSAGES.get(error_type, "发生未知错误，请稍后重试")
```

## 最佳实践[​](/wiki/encyclopedia/llm-error-handling#最佳实践 "最佳实践的直接链接")

1. **分类处理：** 不同错误采用不同策略
2. **指数退避：** 重试时使用指数退避
3. **最大重试：** 设置最大重试次数
4. **降级方案：** 准备备选方案
5. **日志记录：** 详细记录错误信息
6. **监控告警：** 错误率过高触发告警


---

> 本页内容来自文档知识库整理，已按 ArmNet 字元服务 服务命名统一更新。
