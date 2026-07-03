---
{
  "title": "成本优化",
  "source_url": "https://docs.weelinking.com/docs/wiki/applications/cost-optimization",
  "description": "使用 weelinking 大模型API中转服务时降低成本的实用策略",
  "fetched_at": "2026-07-02T06:35:21.746271+00:00"
}
---

# 成本优化

LLM API 的使用成本可能快速累积，本文介绍各种成本优化策略，帮助你在保证质量的同时降低开支。

## 成本构成[​](https://docs.weelinking.com/docs/wiki/applications/cost-optimization#成本构成 "成本构成的直接链接")

### Token 计费模式[​](https://docs.weelinking.com/docs/wiki/applications/cost-optimization#token-计费模式 "Token 计费模式的直接链接")

大多数 LLM API 按 Token 计费：

- **输入 Token：** 你发送给模型的内容
- **输出 Token：** 模型生成的内容
- 输出 Token 通常比输入 Token 贵 2-4 倍

### 价格示例[​](https://docs.weelinking.com/docs/wiki/applications/cost-optimization#价格示例 "价格示例的直接链接")

> 各模型的具体价格请参考官方定价页面或 [控制台](https://api.weelinking.com) 实时定价，以下仅为计费模式说明。

一般来说，输出 Token 价格高于输入 Token 价格，不同模型之间价格差异较大。选择模型时需综合考虑性能和成本。

## 模型选择优化[​](https://docs.weelinking.com/docs/wiki/applications/cost-optimization#模型选择优化 "模型选择优化的直接链接")

### 1. 任务分层[​](https://docs.weelinking.com/docs/wiki/applications/cost-optimization#1-任务分层 "1. 任务分层的直接链接")

根据任务复杂度选择模型：

```
def select_model(task_type, content_length):  
    if task_type == "simple_qa" or content_length < 500:  
        return "gpt-4o-mini"  # 简单任务用便宜模型  
    elif task_type == "code_review" or task_type == "complex_analysis":  
        return "gpt-4o"  # 复杂任务用强模型  
    else:  
        return "gpt-4o-mini"  # 默认用便宜模型
```

### 2. 模型 A/B 测试[​](https://docs.weelinking.com/docs/wiki/applications/cost-optimization#2-模型-ab-测试 "2. 模型 A/B 测试的直接链接")

评估不同模型的性价比：

```
def evaluate_model_cost_performance(task, models):  
    results = []  
      
    for model in models:  
        response = client.chat.completions.create(  
            model=model,  
            messages=[{"role": "user", "content": task}]  
        )  
          
        quality_score = evaluate_quality(response.choices[0].message.content)  
        cost = calculate_cost(model, response.usage)  
          
        results.append({  
            "model": model,  
            "quality": quality_score,  
            "cost": cost,  
            "cost_efficiency": quality_score / cost  
        })  
      
    return sorted(results, key=lambda x: x["cost_efficiency"], reverse=True)
```

## Prompt 优化[​](https://docs.weelinking.com/docs/wiki/applications/cost-optimization#prompt-优化 "Prompt 优化的直接链接")

### 1. 精简输入[​](https://docs.weelinking.com/docs/wiki/applications/cost-optimization#1-精简输入 "1. 精简输入的直接链接")

```
# 不好：包含大量无关信息  
prompt = """  
我们公司是一家成立于2010年的科技公司，主要从事软件开发业务...  
（省略500字背景介绍）  
...请帮我翻译以下句子：Hello World  
"""  
  
# 好：只包含必要信息  
prompt = "将以下英文翻译成中文：Hello World"
```

### 2. 压缩上下文[​](https://docs.weelinking.com/docs/wiki/applications/cost-optimization#2-压缩上下文 "2. 压缩上下文的直接链接")

```
def compress_context(context, max_tokens=1000):  
    """压缩长上下文"""  
    if count_tokens(context) <= max_tokens:  
        return context  
      
    # 使用模型摘要  
    summary = client.chat.completions.create(  
        model="gpt-4o-mini",  
        messages=[  
            {"role": "system", "content": "提取关键信息，压缩到200字以内"},  
            {"role": "user", "content": context}  
        ]  
    ).choices[0].message.content  
      
    return summary
```

### 3. 优化系统提示词[​](https://docs.weelinking.com/docs/wiki/applications/cost-optimization#3-优化系统提示词 "3. 优化系统提示词的直接链接")

```
# 不好：冗长的系统提示  
system_prompt = """  
你是一个非常专业的翻译专家，你需要准确地翻译用户给出的内容，  
翻译时要注意语法正确、用词准确、语义通顺，  
要考虑上下文语境，保持原文风格...  
（继续100字描述）  
"""  
  
# 好：简洁有效  
system_prompt = "你是翻译专家。准确、自然地翻译内容。"
```

## 缓存策略[​](https://docs.weelinking.com/docs/wiki/applications/cost-optimization#缓存策略 "缓存策略的直接链接")

### 1. 结果缓存[​](https://docs.weelinking.com/docs/wiki/applications/cost-optimization#1-结果缓存 "1. 结果缓存的直接链接")

```
import hashlib  
import json  
import redis  
  
redis_client = redis.Redis()  
  
def cached_llm_call(messages, model="gpt-4o", ttl=3600):  
    # 生成缓存键  
    cache_key = hashlib.md5(  
        json.dumps({"model": model, "messages": messages}).encode()  
    ).hexdigest()  
      
    # 检查缓存  
    cached = redis_client.get(cache_key)  
    if cached:  
        return json.loads(cached)  
      
    # 调用 API  
    response = client.chat.completions.create(  
        model=model,  
        messages=messages  
    )  
    result = response.choices[0].message.content  
      
    # 存入缓存  
    redis_client.setex(cache_key, ttl, json.dumps(result))  
      
    return result
```

### 2. 语义缓存[​](https://docs.weelinking.com/docs/wiki/applications/cost-optimization#2-语义缓存 "2. 语义缓存的直接链接")

缓存相似问题的答案：

```
def semantic_cache_lookup(query, threshold=0.95):  
    query_embedding = get_embedding(query)  
      
    # 在缓存中查找相似问题  
    similar = vector_db.search(query_embedding, threshold=threshold)  
      
    if similar:  
        return similar[0]["answer"]  
      
    return None  
  
def llm_with_semantic_cache(query):  
    # 先查缓存  
    cached = semantic_cache_lookup(query)  
    if cached:  
        return cached  
      
    # 调用 API  
    answer = call_llm(query)  
      
    # 存入缓存  
    vector_db.insert({  
        "query": query,  
        "embedding": get_embedding(query),  
        "answer": answer  
    })  
      
    return answer
```

## 批处理优化[​](https://docs.weelinking.com/docs/wiki/applications/cost-optimization#批处理优化 "批处理优化的直接链接")

### 1. 合并请求[​](https://docs.weelinking.com/docs/wiki/applications/cost-optimization#1-合并请求 "1. 合并请求的直接链接")

```
def batch_translate(texts, batch_size=10):  
    """将多个翻译任务合并为一个请求"""  
    results = []  
      
    for i in range(0, len(texts), batch_size):  
        batch = texts[i:i+batch_size]  
          
        prompt = "翻译以下内容（用 ||| 分隔结果）：\n"  
        prompt += "\n---\n".join(batch)  
          
        response = client.chat.completions.create(  
            model="gpt-4o-mini",  
            messages=[{"role": "user", "content": prompt}]  
        )  
          
        batch_results = response.choices[0].message.content.split("|||")  
        results.extend([r.strip() for r in batch_results])  
      
    return results
```

### 2. 使用 Batch API[​](https://docs.weelinking.com/docs/wiki/applications/cost-optimization#2-使用-batch-api "2. 使用 Batch API的直接链接")

OpenAI Batch API 通常有 50% 折扣：

```
# 创建批处理任务  
batch = client.batches.create(  
    input_file_id=file.id,  
    endpoint="/v1/chat/completions",  
    completion_window="24h"  # 24小时内完成  
)
```

## 输出控制[​](https://docs.weelinking.com/docs/wiki/applications/cost-optimization#输出控制 "输出控制的直接链接")

### 1. 限制输出长度[​](https://docs.weelinking.com/docs/wiki/applications/cost-optimization#1-限制输出长度 "1. 限制输出长度的直接链接")

```
response = client.chat.completions.create(  
    model="gpt-4o",  
    messages=messages,  
    max_tokens=500  # 限制输出  
)
```

### 2. 结构化输出[​](https://docs.weelinking.com/docs/wiki/applications/cost-optimization#2-结构化输出 "2. 结构化输出的直接链接")

```
# 请求简洁的 JSON 输出  
response = client.chat.completions.create(  
    model="gpt-4o",  
    messages=[  
        {"role": "system", "content": "只返回 JSON，不要其他内容"},  
        {"role": "user", "content": "提取姓名和年龄"}  
    ],  
    response_format={"type": "json_object"}  
)
```

### 3. 提前终止[​](https://docs.weelinking.com/docs/wiki/applications/cost-optimization#3-提前终止 "3. 提前终止的直接链接")

```
response = client.chat.completions.create(  
    model="gpt-4o",  
    messages=messages,  
    stop=["结论：", "总结："]  # 到达停止词就结束  
)
```

## 成本监控[​](https://docs.weelinking.com/docs/wiki/applications/cost-optimization#成本监控 "成本监控的直接链接")

### 1. Token 追踪[​](https://docs.weelinking.com/docs/wiki/applications/cost-optimization#1-token-追踪 "1. Token 追踪的直接链接")

```
class CostTracker:  
    def __init__(self):  
        self.total_input_tokens = 0  
        self.total_output_tokens = 0  
        self.prices = {  
            "gpt-4o": {"input": 0.0025, "output": 0.01},  
            "gpt-4o-mini": {"input": 0.00015, "output": 0.0006}  
        }  
      
    def track(self, model, usage):  
        self.total_input_tokens += usage.prompt_tokens  
        self.total_output_tokens += usage.completion_tokens  
      
    def get_cost(self, model):  
        price = self.prices.get(model, {"input": 0, "output": 0})  
        input_cost = self.total_input_tokens / 1000 * price["input"]  
        output_cost = self.total_output_tokens / 1000 * price["output"]  
        return input_cost + output_cost  
      
    def report(self):  
        return {  
            "input_tokens": self.total_input_tokens,  
            "output_tokens": self.total_output_tokens,  
            "estimated_cost": self.get_cost("gpt-4o")  
        }  
  
tracker = CostTracker()
```

### 2. 预算控制[​](https://docs.weelinking.com/docs/wiki/applications/cost-optimization#2-预算控制 "2. 预算控制的直接链接")

```
class BudgetController:  
    def __init__(self, daily_budget=10.0):  
        self.daily_budget = daily_budget  
        self.daily_spent = 0.0  
      
    def can_spend(self, estimated_cost):  
        return self.daily_spent + estimated_cost <= self.daily_budget  
      
    def spend(self, cost):  
        self.daily_spent += cost  
          
        if self.daily_spent >= self.daily_budget * 0.8:  
            logger.warning(f"已使用 {self.daily_spent/self.daily_budget*100:.0f}% 预算")  
      
    def reset_daily(self):  
        self.daily_spent = 0.0  
  
budget = BudgetController(daily_budget=10.0)  
  
def call_with_budget(messages, model="gpt-4o"):  
    estimated_cost = estimate_cost(messages, model)  
      
    if not budget.can_spend(estimated_cost):  
        raise Exception("超出每日预算")  
      
    response = client.chat.completions.create(  
        model=model,  
        messages=messages  
    )  
      
    actual_cost = calculate_cost(model, response.usage)  
    budget.spend(actual_cost)  
      
    return response
```

## 成本优化清单[​](https://docs.weelinking.com/docs/wiki/applications/cost-optimization#成本优化清单 "成本优化清单的直接链接")

| 策略 | 节省比例 | 实施难度 |
| --- | --- | --- |
| 使用更小的模型 | 80-95% | 低 |
| 结果缓存 | 30-70% | 中 |
| 压缩 Prompt | 20-50% | 低 |
| 批处理合并 | 20-40% | 中 |
| Batch API | 50% | 低 |
| 限制输出长度 | 10-30% | 低 |

## 最佳实践[​](https://docs.weelinking.com/docs/wiki/applications/cost-optimization#最佳实践 "最佳实践的直接链接")

1. **监控先行：** 先了解成本分布再优化
2. **模型分层：** 不同任务用不同模型
3. **缓存优先：** 重复查询必须缓存
4. **精简输入：** 只发送必要信息
5. **控制输出：** 明确需要的输出格式和长度
6. **预算告警：** 设置成本告警阈值
