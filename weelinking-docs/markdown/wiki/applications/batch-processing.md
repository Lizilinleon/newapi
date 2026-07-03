---
{
  "title": "批处理",
  "source_url": "https://docs.weelinking.com/docs/wiki/applications/batch-processing",
  "description": "通过 weelinking 大模型API中转服务高效批量处理大量AI请求",
  "fetched_at": "2026-07-02T06:35:33.613907+00:00"
}
---

# 批处理

批处理是指同时处理多个 LLM 请求的技术，适用于需要处理大量数据的场景，如批量翻译、内容生成、数据标注等。

## 应用场景[​](https://docs.weelinking.com/docs/wiki/applications/batch-processing#应用场景 "应用场景的直接链接")

### 常见批处理任务[​](https://docs.weelinking.com/docs/wiki/applications/batch-processing#常见批处理任务 "常见批处理任务的直接链接")

- **批量翻译：** 翻译大量文档或字符串
- **内容生成：** 批量生成产品描述、文章
- **数据标注：** 自动分类、打标签
- **内容审核：** 批量检查内容合规性
- **信息提取：** 从大量文本中提取结构化数据

## 实现方式[​](https://docs.weelinking.com/docs/wiki/applications/batch-processing#实现方式 "实现方式的直接链接")

### 1. 简单循环（串行）[​](https://docs.weelinking.com/docs/wiki/applications/batch-processing#1-简单循环串行 "1. 简单循环（串行）的直接链接")

最简单但效率最低：

```
from openai import OpenAI  
  
client = OpenAI(api_key="your-api-key", base_url="https://api.weelinking.com/v1")  
  
def process_batch_serial(items):  
    results = []  
    for item in items:  
        response = client.chat.completions.create(  
            model="gpt-4o-mini",  
            messages=[{"role": "user", "content": item}]  
        )  
        results.append(response.choices[0].message.content)  
    return results  
  
# 使用  
items = ["翻译：Hello", "翻译：World", "翻译：Goodbye"]  
results = process_batch_serial(items)
```

### 2. 异步并发[​](https://docs.weelinking.com/docs/wiki/applications/batch-processing#2-异步并发 "2. 异步并发的直接链接")

使用 asyncio 实现并发请求：

```
import asyncio  
from openai import AsyncOpenAI  
  
async_client = AsyncOpenAI(  
    api_key="your-api-key",  
    base_url="https://api.weelinking.com/v1"  
)  
  
async def process_single(item):  
    response = await async_client.chat.completions.create(  
        model="gpt-4o-mini",  
        messages=[{"role": "user", "content": item}]  
    )  
    return response.choices[0].message.content  
  
async def process_batch_async(items, concurrency=10):  
    semaphore = asyncio.Semaphore(concurrency)  
      
    async def process_with_semaphore(item):  
        async with semaphore:  
            return await process_single(item)  
      
    tasks = [process_with_semaphore(item) for item in items]  
    return await asyncio.gather(*tasks)  
  
# 使用  
items = ["任务1", "任务2", "任务3", ...]  
results = asyncio.run(process_batch_async(items, concurrency=10))
```

### 3. 线程池[​](https://docs.weelinking.com/docs/wiki/applications/batch-processing#3-线程池 "3. 线程池的直接链接")

使用 ThreadPoolExecutor：

```
from concurrent.futures import ThreadPoolExecutor, as_completed  
from openai import OpenAI  
  
client = OpenAI(api_key="your-api-key", base_url="https://api.weelinking.com/v1")  
  
def process_single(item):  
    response = client.chat.completions.create(  
        model="gpt-4o-mini",  
        messages=[{"role": "user", "content": item}]  
    )  
    return response.choices[0].message.content  
  
def process_batch_threaded(items, max_workers=10):  
    results = [None] * len(items)  
      
    with ThreadPoolExecutor(max_workers=max_workers) as executor:  
        future_to_index = {  
            executor.submit(process_single, item): i   
            for i, item in enumerate(items)  
        }  
          
        for future in as_completed(future_to_index):  
            index = future_to_index[future]  
            try:  
                results[index] = future.result()  
            except Exception as e:  
                results[index] = f"Error: {str(e)}"  
      
    return results
```

### 4. OpenAI Batch API[​](https://docs.weelinking.com/docs/wiki/applications/batch-processing#4-openai-batch-api "4. OpenAI Batch API的直接链接")

OpenAI 提供专门的批处理 API，成本更低：

```
import json  
from openai import OpenAI  
  
client = OpenAI(api_key="your-api-key", base_url="https://api.weelinking.com/v1")  
  
def create_batch_file(requests):  
    """创建批处理输入文件"""  
    lines = []  
    for i, req in enumerate(requests):  
        line = {  
            "custom_id": f"request-{i}",  
            "method": "POST",  
            "url": "/v1/chat/completions",  
            "body": {  
                "model": "gpt-4o-mini",  
                "messages": [{"role": "user", "content": req}]  
            }  
        }  
        lines.append(json.dumps(line))  
    return "\n".join(lines)  
  
def submit_batch(requests):  
    # 创建文件内容  
    file_content = create_batch_file(requests)  
      
    # 上传文件  
    file = client.files.create(  
        file=file_content.encode(),  
        purpose="batch"  
    )  
      
    # 创建批处理任务  
    batch = client.batches.create(  
        input_file_id=file.id,  
        endpoint="/v1/chat/completions",  
        completion_window="24h"  
    )  
      
    return batch.id  
  
def get_batch_results(batch_id):  
    batch = client.batches.retrieve(batch_id)  
      
    if batch.status == "completed":  
        # 下载结果  
        result_file = client.files.content(batch.output_file_id)  
        results = []  
        for line in result_file.text.split("\n"):  
            if line:  
                result = json.loads(line)  
                results.append(result)  
        return results  
      
    return {"status": batch.status}
```

## 高级技巧[​](https://docs.weelinking.com/docs/wiki/applications/batch-processing#高级技巧 "高级技巧的直接链接")

### 1. 进度追踪[​](https://docs.weelinking.com/docs/wiki/applications/batch-processing#1-进度追踪 "1. 进度追踪的直接链接")

```
from tqdm import tqdm  
import asyncio  
  
async def process_batch_with_progress(items, concurrency=10):  
    semaphore = asyncio.Semaphore(concurrency)  
    results = []  
      
    async def process_with_semaphore(item, pbar):  
        async with semaphore:  
            result = await process_single(item)  
            pbar.update(1)  
            return result  
      
    with tqdm(total=len(items), desc="处理进度") as pbar:  
        tasks = [process_with_semaphore(item, pbar) for item in items]  
        results = await asyncio.gather(*tasks)  
      
    return results
```

### 2. 错误重试[​](https://docs.weelinking.com/docs/wiki/applications/batch-processing#2-错误重试 "2. 错误重试的直接链接")

```
import asyncio  
from tenacity import retry, stop_after_attempt, wait_exponential  
  
@retry(  
    stop=stop_after_attempt(3),  
    wait=wait_exponential(multiplier=1, min=1, max=10)  
)  
async def process_with_retry(item):  
    return await process_single(item)  
  
async def process_batch_with_retry(items, concurrency=10):  
    semaphore = asyncio.Semaphore(concurrency)  
      
    async def process(item):  
        async with semaphore:  
            try:  
                return {"success": True, "result": await process_with_retry(item)}  
            except Exception as e:  
                return {"success": False, "error": str(e), "item": item}  
      
    tasks = [process(item) for item in items]  
    return await asyncio.gather(*tasks)
```

### 3. 分批处理[​](https://docs.weelinking.com/docs/wiki/applications/batch-processing#3-分批处理 "3. 分批处理的直接链接")

处理超大量数据时分批：

```
def chunk_list(lst, chunk_size):  
    for i in range(0, len(lst), chunk_size):  
        yield lst[i:i + chunk_size]  
  
async def process_large_batch(items, batch_size=100, concurrency=10):  
    all_results = []  
      
    for batch in chunk_list(items, batch_size):  
        batch_results = await process_batch_async(batch, concurrency)  
        all_results.extend(batch_results)  
          
        # 批次间休息，避免过载  
        await asyncio.sleep(1)  
      
    return all_results
```

### 4. 结果持久化[​](https://docs.weelinking.com/docs/wiki/applications/batch-processing#4-结果持久化 "4. 结果持久化的直接链接")

```
import json  
import os  
  
async def process_batch_with_checkpoint(items, output_file, concurrency=10):  
    # 加载已完成的结果  
    completed = {}  
    if os.path.exists(output_file):  
        with open(output_file) as f:  
            for line in f:  
                result = json.loads(line)  
                completed[result["id"]] = result  
      
    # 找出未完成的任务  
    pending = [(i, item) for i, item in enumerate(items) if i not in completed]  
      
    # 处理未完成的任务  
    async def process_and_save(index, item):  
        result = await process_single(item)  
          
        # 立即保存  
        with open(output_file, "a") as f:  
            f.write(json.dumps({  
                "id": index,  
                "input": item,  
                "output": result  
            }) + "\n")  
          
        return result  
      
    semaphore = asyncio.Semaphore(concurrency)  
      
    async def process_with_semaphore(index, item):  
        async with semaphore:  
            return await process_and_save(index, item)  
      
    tasks = [process_with_semaphore(i, item) for i, item in pending]  
    await asyncio.gather(*tasks)  
      
    # 返回所有结果  
    with open(output_file) as f:  
        return [json.loads(line) for line in f]
```

## 成本优化[​](https://docs.weelinking.com/docs/wiki/applications/batch-processing#成本优化 "成本优化的直接链接")

### 1. 使用更便宜的模型[​](https://docs.weelinking.com/docs/wiki/applications/batch-processing#1-使用更便宜的模型 "1. 使用更便宜的模型的直接链接")

```
# 简单任务用 mini 模型  
model = "gpt-4o-mini"  # 比 gpt-4o 便宜很多
```

### 2. 批量请求合并[​](https://docs.weelinking.com/docs/wiki/applications/batch-processing#2-批量请求合并 "2. 批量请求合并的直接链接")

将多个小任务合并为一个请求：

```
def batch_in_one_request(items, batch_size=10):  
    results = []  
      
    for batch in chunk_list(items, batch_size):  
        prompt = "请分别处理以下任务，每个任务结果用 --- 分隔：\n"  
        prompt += "\n".join([f"{i+1}. {item}" for i, item in enumerate(batch)])  
          
        response = client.chat.completions.create(  
            model="gpt-4o-mini",  
            messages=[{"role": "user", "content": prompt}]  
        )  
          
        # 解析结果  
        batch_results = response.choices[0].message.content.split("---")  
        results.extend([r.strip() for r in batch_results])  
      
    return results
```

### 3. 使用 Batch API[​](https://docs.weelinking.com/docs/wiki/applications/batch-processing#3-使用-batch-api "3. 使用 Batch API的直接链接")

Batch API 通常有 50% 的折扣。

## 监控与日志[​](https://docs.weelinking.com/docs/wiki/applications/batch-processing#监控与日志 "监控与日志的直接链接")

```
import logging  
import time  
  
logging.basicConfig(level=logging.INFO)  
logger = logging.getLogger(__name__)  
  
async def process_batch_with_monitoring(items, concurrency=10):  
    start_time = time.time()  
    success_count = 0  
    error_count = 0  
    total_tokens = 0  
      
    async def process(item):  
        nonlocal success_count, error_count, total_tokens  
        try:  
            response = await async_client.chat.completions.create(  
                model="gpt-4o-mini",  
                messages=[{"role": "user", "content": item}]  
            )  
            success_count += 1  
            total_tokens += response.usage.total_tokens  
            return response.choices[0].message.content  
        except Exception as e:  
            error_count += 1  
            logger.error(f"处理失败: {str(e)}")  
            return None  
      
    # 处理所有任务  
    results = await process_batch_async(items, concurrency)  
      
    # 输出统计  
    elapsed = time.time() - start_time  
    logger.info(f"完成: {success_count}/{len(items)}, 失败: {error_count}")  
    logger.info(f"耗时: {elapsed:.2f}s, Token: {total_tokens}")  
      
    return results
```

## 最佳实践[​](https://docs.weelinking.com/docs/wiki/applications/batch-processing#最佳实践 "最佳实践的直接链接")

1. **合理的并发数：** 根据 API 限制设置，通常 10-50
2. **错误处理：** 实现重试和降级策略
3. **进度保存：** 支持断点续传
4. **成本监控：** 实时追踪 token 使用
5. **速率限制：** 遵守 API 调用限制
