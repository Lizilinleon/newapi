---
title: "错误处理"
description: "使用 ArmNet 字元服务 大模型API中转服务时的错误处理最佳实践"
lastUpdated: true
---

# 错误处理

在调用 LLM API 时，正确的错误处理对于构建稳定可靠的应用至关重要。本文介绍常见错误类型及处理方法。

## 常见错误类型[​](/wiki/applications/error-handling#常见错误类型 "常见错误类型的直接链接")

### HTTP 状态码[​](/wiki/applications/error-handling#http-状态码 "HTTP 状态码的直接链接")

| 状态码 | 含义 | 处理方式 |
| --- | --- | --- |
| 400 | 请求格式错误 | 检查请求参数 |
| 401 | 认证失败 | 检查 API Key |
| 403 | 权限不足 | 检查账户权限 |
| 404 | 资源不存在 | 检查模型名称 |
| 429 | 请求过多 | 降低频率或重试 |
| 500 | 服务器错误 | 重试或联系支持 |
| 503 | 服务不可用 | 稍后重试 |

### OpenAI SDK 异常[​](/wiki/applications/error-handling#openai-sdk-异常 "OpenAI SDK 异常的直接链接")

```
from openai import (  
    APIError,  
    APIConnectionError,  
    RateLimitError,  
    AuthenticationError,  
    BadRequestError,  
    NotFoundError,  
    UnprocessableEntityError,  
    InternalServerError  
)
```

## 基础错误处理[​](/wiki/applications/error-handling#基础错误处理 "基础错误处理的直接链接")

### 简单 try-except[​](/wiki/applications/error-handling#简单-try-except "简单 try-except的直接链接")

```
from openai import OpenAI, APIError, RateLimitError  
  
client = OpenAI(api_key="your-api-key", base_url="http://122.51.35.238:5170/v1")  
  
def call_llm(messages):  
    try:  
        response = client.chat.completions.create(  
            model="gpt-4o",  
            messages=messages  
        )  
        return response.choices[0].message.content  
      
    except RateLimitError as e:  
        print(f"请求过于频繁: {e}")  
        return None  
      
    except APIError as e:  
        print(f"API 错误: {e}")  
        return None  
      
    except Exception as e:  
        print(f"未知错误: {e}")  
        return None
```

### 完整错误处理[​](/wiki/applications/error-handling#完整错误处理 "完整错误处理的直接链接")

```
from openai import (  
    OpenAI,  
    APIError,  
    APIConnectionError,  
    RateLimitError,  
    AuthenticationError,  
    BadRequestError  
)  
import logging  
  
logging.basicConfig(level=logging.INFO)  
logger = logging.getLogger(__name__)  
  
def call_llm_robust(messages):  
    try:  
        response = client.chat.completions.create(  
            model="gpt-4o",  
            messages=messages,  
            timeout=30  
        )  
        return {  
            "success": True,  
            "content": response.choices[0].message.content,  
            "usage": response.usage.model_dump()  
        }  
      
    except AuthenticationError as e:  
        logger.error(f"认证失败: {e}")  
        return {"success": False, "error": "invalid_api_key", "message": "API Key 无效"}  
      
    except BadRequestError as e:  
        logger.error(f"请求错误: {e}")  
        return {"success": False, "error": "bad_request", "message": str(e)}  
      
    except RateLimitError as e:  
        logger.warning(f"速率限制: {e}")  
        return {"success": False, "error": "rate_limit", "message": "请求过于频繁"}  
      
    except APIConnectionError as e:  
        logger.error(f"连接错误: {e}")  
        return {"success": False, "error": "connection_error", "message": "网络连接失败"}  
      
    except APIError as e:  
        logger.error(f"API 错误: {e}")  
        return {"success": False, "error": "api_error", "message": str(e)}  
      
    except Exception as e:  
        logger.exception(f"未知错误: {e}")  
        return {"success": False, "error": "unknown", "message": str(e)}
```

## 重试策略[​](/wiki/applications/error-handling#重试策略 "重试策略的直接链接")

### 使用 tenacity[​](/wiki/applications/error-handling#使用-tenacity "使用 tenacity的直接链接")

```
from tenacity import (  
    retry,  
    stop_after_attempt,  
    wait_exponential,  
    retry_if_exception_type  
)  
from openai import RateLimitError, APIError  
  
@retry(  
    stop=stop_after_attempt(3),  
    wait=wait_exponential(multiplier=1, min=1, max=60),  
    retry=retry_if_exception_type((RateLimitError, APIError))  
)  
def call_llm_with_retry(messages):  
    response = client.chat.completions.create(  
        model="gpt-4o",  
        messages=messages  
    )  
    return response.choices[0].message.content
```

### 自定义重试逻辑[​](/wiki/applications/error-handling#自定义重试逻辑 "自定义重试逻辑的直接链接")

```
import time  
  
def call_with_retry(messages, max_retries=3, base_delay=1):  
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
            delay = base_delay * (2 ** attempt)  # 指数退避  
            logger.warning(f"速率限制，等待 {delay}s 后重试...")  
            time.sleep(delay)  
          
        except APIError as e:  
            # 5xx 错误可以重试  
            if e.status_code >= 500:  
                last_error = e  
                delay = base_delay * (2 ** attempt)  
                logger.warning(f"服务器错误，等待 {delay}s 后重试...")  
                time.sleep(delay)  
            else:  
                raise  # 4xx 错误不重试  
      
    raise last_error
```

### 重试装饰器[​](/wiki/applications/error-handling#重试装饰器 "重试装饰器的直接链接")

```
import functools  
import time  
  
def retry_on_error(max_retries=3, delay=1, exceptions=(Exception,)):  
    def decorator(func):  
        @functools.wraps(func)  
        def wrapper(*args, **kwargs):  
            last_error = None  
            for attempt in range(max_retries):  
                try:  
                    return func(*args, **kwargs)  
                except exceptions as e:  
                    last_error = e  
                    if attempt < max_retries - 1:  
                        wait_time = delay * (2 ** attempt)  
                        logger.warning(f"尝试 {attempt + 1} 失败，{wait_time}s 后重试")  
                        time.sleep(wait_time)  
            raise last_error  
        return wrapper  
    return decorator  
  
@retry_on_error(max_retries=3, delay=1, exceptions=(RateLimitError, APIError))  
def call_llm(messages):  
    return client.chat.completions.create(  
        model="gpt-4o",  
        messages=messages  
    ).choices[0].message.content
```

## 超时处理[​](/wiki/applications/error-handling#超时处理 "超时处理的直接链接")

### 设置超时[​](/wiki/applications/error-handling#设置超时 "设置超时的直接链接")

```
# 全局超时  
client = OpenAI(  
    api_key="your-api-key",  
    base_url="http://122.51.35.238:5170/v1",  
    timeout=30.0  # 30秒  
)  
  
# 单次请求超时  
response = client.chat.completions.create(  
    model="gpt-4o",  
    messages=messages,  
    timeout=60.0  # 覆盖默认值  
)
```

### 超时重试[​](/wiki/applications/error-handling#超时重试 "超时重试的直接链接")

```
from openai import APITimeoutError  
  
def call_with_timeout_retry(messages, timeout=30, max_retries=2):  
    for attempt in range(max_retries):  
        try:  
            response = client.chat.completions.create(  
                model="gpt-4o",  
                messages=messages,  
                timeout=timeout  
            )  
            return response.choices[0].message.content  
          
        except APITimeoutError:  
            if attempt < max_retries - 1:  
                logger.warning(f"请求超时，重试中...")  
                timeout *= 1.5  # 增加超时时间  
            else:  
                raise
```

## 降级策略[​](/wiki/applications/error-handling#降级策略 "降级策略的直接链接")

### 模型降级[​](/wiki/applications/error-handling#模型降级 "模型降级的直接链接")

```
def call_with_fallback(messages):  
    models = ["gpt-4o", "gpt-4o-mini", "gpt-3.5-turbo"]  
      
    for model in models:  
        try:  
            response = client.chat.completions.create(  
                model=model,  
                messages=messages  
            )  
            return response.choices[0].message.content  
        except Exception as e:  
            logger.warning(f"{model} 失败: {e}")  
            continue  
      
    raise Exception("所有模型都失败了")
```

### 缓存降级[​](/wiki/applications/error-handling#缓存降级 "缓存降级的直接链接")

```
import hashlib  
import json  
  
cache = {}  
  
def call_with_cache_fallback(messages):  
    # 生成缓存键  
    cache_key = hashlib.md5(json.dumps(messages).encode()).hexdigest()  
      
    try:  
        response = client.chat.completions.create(  
            model="gpt-4o",  
            messages=messages  
        )  
        result = response.choices[0].message.content  
          
        # 更新缓存  
        cache[cache_key] = result  
        return result  
      
    except Exception as e:  
        # 尝试使用缓存  
        if cache_key in cache:  
            logger.warning(f"API 失败，使用缓存结果")  
            return cache[cache_key]  
        raise
```

## 错误日志[​](/wiki/applications/error-handling#错误日志 "错误日志的直接链接")

### 结构化日志[​](/wiki/applications/error-handling#结构化日志 "结构化日志的直接链接")

```
import json  
import logging  
from datetime import datetime  
  
class LLMErrorLogger:  
    def __init__(self, log_file="llm_errors.jsonl"):  
        self.log_file = log_file  
      
    def log_error(self, error, request_data, context=None):  
        log_entry = {  
            "timestamp": datetime.now().isoformat(),  
            "error_type": type(error).__name__,  
            "error_message": str(error),  
            "model": request_data.get("model"),  
            "messages_count": len(request_data.get("messages", [])),  
            "context": context  
        }  
          
        with open(self.log_file, "a") as f:  
            f.write(json.dumps(log_entry, ensure_ascii=False) + "\n")  
          
        return log_entry  
  
error_logger = LLMErrorLogger()  
  
def call_llm_with_logging(messages, model="gpt-4o"):  
    request_data = {"model": model, "messages": messages}  
      
    try:  
        response = client.chat.completions.create(  
            model=model,  
            messages=messages  
        )  
        return response.choices[0].message.content  
      
    except Exception as e:  
        error_logger.log_error(e, request_data)  
        raise
```

## 用户友好的错误消息[​](/wiki/applications/error-handling#用户友好的错误消息 "用户友好的错误消息的直接链接")

```
def get_user_friendly_error(error):  
    error_messages = {  
        "AuthenticationError": "API 密钥无效，请检查配置",  
        "RateLimitError": "请求过于频繁，请稍后再试",  
        "APIConnectionError": "网络连接失败，请检查网络",  
        "BadRequestError": "请求格式错误，请联系技术支持",  
        "InternalServerError": "服务暂时不可用，请稍后重试"  
    }  
      
    error_type = type(error).__name__  
    return error_messages.get(error_type, "发生未知错误，请稍后重试")
```

## 最佳实践[​](/wiki/applications/error-handling#最佳实践 "最佳实践的直接链接")

1. **分类处理：** 不同错误类型采用不同策略
2. **指数退避：** 重试时使用指数退避算法
3. **最大重试：** 设置最大重试次数，避免无限循环
4. **日志记录：** 详细记录错误信息便于排查
5. **降级方案：** 准备备选模型或缓存结果
6. **用户提示：** 提供友好的错误提示
7. **监控告警：** 错误率过高时触发告警


---

> 本页内容来自文档知识库整理，已按 ArmNet 字元服务 服务命名统一更新。
