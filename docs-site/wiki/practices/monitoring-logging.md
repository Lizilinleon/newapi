---
title: "监控与日志"
description: "使用 ArmNet 字元服务 大模型API中转服务时的监控与日志最佳实践"
lastUpdated: true
---

# 监控与日志

良好的监控和日志系统是保障 LLM 应用稳定运行的关键。本文介绍如何构建完善的可观测性体系。

## 监控指标[​](/wiki/practices/monitoring-logging#监控指标 "监控指标的直接链接")

### 核心指标[​](/wiki/practices/monitoring-logging#核心指标 "核心指标的直接链接")

| 指标类型 | 指标名称 | 说明 |
| --- | --- | --- |
| 性能 | 延迟 (Latency) | 请求响应时间 |
| 性能 | 吞吐量 (QPS) | 每秒请求数 |
| 性能 | Token/秒 | 生成速度 |
| 可用性 | 成功率 | 成功请求占比 |
| 可用性 | 错误率 | 失败请求占比 |
| 成本 | Token 使用量 | 输入/输出 Token |
| 成本 | API 费用 | 实际花费 |
| 质量 | 用户满意度 | 用户反馈评分 |

### 指标收集[​](/wiki/practices/monitoring-logging#指标收集 "指标收集的直接链接")

```
from dataclasses import dataclass, field  
from datetime import datetime  
from typing import Dict, List  
import threading  
  
@dataclass  
class RequestMetric:  
    timestamp: datetime  
    model: str  
    input_tokens: int  
    output_tokens: int  
    latency: float  
    success: bool  
    error_type: str = None  
  
class MetricsCollector:  
    def __init__(self):  
        self.metrics: List[RequestMetric] = []  
        self.lock = threading.Lock()  
      
    def record(self, metric: RequestMetric):  
        with self.lock:  
            self.metrics.append(metric)  
      
    def get_summary(self, minutes=60):  
        cutoff = datetime.now() - timedelta(minutes=minutes)  
        recent = [m for m in self.metrics if m.timestamp > cutoff]  
          
        if not recent:  
            return {}  
          
        successful = [m for m in recent if m.success]  
        failed = [m for m in recent if not m.success]  
          
        return {  
            "total_requests": len(recent),  
            "success_rate": len(successful) / len(recent),  
            "avg_latency": sum(m.latency for m in successful) / len(successful) if successful else 0,  
            "p95_latency": self._percentile([m.latency for m in successful], 95),  
            "total_input_tokens": sum(m.input_tokens for m in recent),  
            "total_output_tokens": sum(m.output_tokens for m in recent),  
            "error_breakdown": self._count_errors(failed)  
        }  
      
    def _percentile(self, data, p):  
        if not data:  
            return 0  
        sorted_data = sorted(data)  
        idx = int(len(sorted_data) * p / 100)  
        return sorted_data[min(idx, len(sorted_data) - 1)]  
      
    def _count_errors(self, failed):  
        errors = {}  
        for m in failed:  
            errors[m.error_type] = errors.get(m.error_type, 0) + 1  
        return errors  
  
collector = MetricsCollector()
```

### 使用 Prometheus[​](/wiki/practices/monitoring-logging#使用-prometheus "使用 Prometheus的直接链接")

```
from prometheus_client import Counter, Histogram, Gauge, start_http_server  
  
# 定义指标  
REQUEST_COUNT = Counter(  
    'llm_requests_total',  
    'Total LLM API requests',  
    ['model', 'status']  
)  
  
REQUEST_LATENCY = Histogram(  
    'llm_request_latency_seconds',  
    'LLM request latency',  
    ['model'],  
    buckets=[0.5, 1, 2, 5, 10, 30, 60]  
)  
  
TOKEN_USAGE = Counter(  
    'llm_tokens_total',  
    'Total tokens used',  
    ['model', 'type']  # type: input/output  
)  
  
ACTIVE_REQUESTS = Gauge(  
    'llm_active_requests',  
    'Currently active requests'  
)  
  
def monitored_llm_call(messages, model="gpt-4o"):  
    ACTIVE_REQUESTS.inc()  
    start_time = time.time()  
      
    try:  
        response = client.chat.completions.create(  
            model=model,  
            messages=messages  
        )  
          
        # 记录指标  
        REQUEST_COUNT.labels(model=model, status='success').inc()  
        REQUEST_LATENCY.labels(model=model).observe(time.time() - start_time)  
        TOKEN_USAGE.labels(model=model, type='input').inc(response.usage.prompt_tokens)  
        TOKEN_USAGE.labels(model=model, type='output').inc(response.usage.completion_tokens)  
          
        return response.choices[0].message.content  
      
    except Exception as e:  
        REQUEST_COUNT.labels(model=model, status='error').inc()  
        raise  
      
    finally:  
        ACTIVE_REQUESTS.dec()  
  
# 启动 Prometheus 指标服务器  
start_http_server(8000)
```

## 日志记录[​](/wiki/practices/monitoring-logging#日志记录 "日志记录的直接链接")

### 结构化日志[​](/wiki/practices/monitoring-logging#结构化日志 "结构化日志的直接链接")

```
import json  
import logging  
from datetime import datetime  
  
class StructuredLogger:  
    def __init__(self, name):  
        self.logger = logging.getLogger(name)  
        handler = logging.StreamHandler()  
        handler.setFormatter(logging.Formatter('%(message)s'))  
        self.logger.addHandler(handler)  
        self.logger.setLevel(logging.INFO)  
      
    def log(self, level, event, **kwargs):  
        log_entry = {  
            "timestamp": datetime.now().isoformat(),  
            "level": level,  
            "event": event,  
            **kwargs  
        }  
          
        log_method = getattr(self.logger, level.lower())  
        log_method(json.dumps(log_entry, ensure_ascii=False))  
  
logger = StructuredLogger("llm_app")  
  
def logged_llm_call(messages, model="gpt-4o", request_id=None):  
    logger.log("INFO", "llm_request_start",   
               request_id=request_id,  
               model=model,  
               message_count=len(messages))  
      
    start_time = time.time()  
      
    try:  
        response = client.chat.completions.create(  
            model=model,  
            messages=messages  
        )  
          
        logger.log("INFO", "llm_request_success",  
                   request_id=request_id,  
                   model=model,  
                   latency=time.time() - start_time,  
                   input_tokens=response.usage.prompt_tokens,  
                   output_tokens=response.usage.completion_tokens)  
          
        return response.choices[0].message.content  
      
    except Exception as e:  
        logger.log("ERROR", "llm_request_error",  
                   request_id=request_id,  
                   model=model,  
                   latency=time.time() - start_time,  
                   error_type=type(e).__name__,  
                   error_message=str(e))  
        raise
```

### 日志级别[​](/wiki/practices/monitoring-logging#日志级别 "日志级别的直接链接")

```
class LLMLogger:  
    def log_request(self, request_id, model, messages):  
        """记录请求（DEBUG 级别，生产环境可能关闭）"""  
        self.logger.debug({  
            "event": "request",  
            "request_id": request_id,  
            "model": model,  
            "messages": self._truncate_messages(messages)  
        })  
      
    def log_response(self, request_id, response, latency):  
        """记录响应（INFO 级别）"""  
        self.logger.info({  
            "event": "response",  
            "request_id": request_id,  
            "latency": latency,  
            "tokens": response.usage.total_tokens  
        })  
      
    def log_error(self, request_id, error):  
        """记录错误（ERROR 级别）"""  
        self.logger.error({  
            "event": "error",  
            "request_id": request_id,  
            "error_type": type(error).__name__,  
            "error_message": str(error)  
        })  
      
    def log_rate_limit(self, request_id):  
        """记录速率限制（WARNING 级别）"""  
        self.logger.warning({  
            "event": "rate_limit",  
            "request_id": request_id  
        })  
      
    def _truncate_messages(self, messages, max_length=200):  
        """截断消息内容保护隐私"""  
        truncated = []  
        for msg in messages:  
            content = msg.get("content", "")  
            if len(content) > max_length:  
                content = content[:max_length] + "..."  
            truncated.append({**msg, "content": content})  
        return truncated
```

## 告警配置[​](/wiki/practices/monitoring-logging#告警配置 "告警配置的直接链接")

### 告警规则[​](/wiki/practices/monitoring-logging#告警规则 "告警规则的直接链接")

```
class AlertRule:  
    def __init__(self, name, condition, threshold, window_minutes=5):  
        self.name = name  
        self.condition = condition  
        self.threshold = threshold  
        self.window_minutes = window_minutes  
      
    def check(self, metrics):  
        value = self.condition(metrics)  
        return value > self.threshold, value  
  
class AlertManager:  
    def __init__(self):  
        self.rules = []  
        self.alert_handlers = []  
      
    def add_rule(self, rule):  
        self.rules.append(rule)  
      
    def add_handler(self, handler):  
        self.alert_handlers.append(handler)  
      
    def check_all(self, metrics):  
        for rule in self.rules:  
            triggered, value = rule.check(metrics)  
            if triggered:  
                for handler in self.alert_handlers:  
                    handler(rule.name, value, rule.threshold)  
  
# 配置告警规则  
alert_manager = AlertManager()  
  
# 错误率告警  
alert_manager.add_rule(AlertRule(  
    name="high_error_rate",  
    condition=lambda m: 1 - m.get("success_rate", 1),  
    threshold=0.1  # 10% 错误率  
))  
  
# 延迟告警  
alert_manager.add_rule(AlertRule(  
    name="high_latency",  
    condition=lambda m: m.get("p95_latency", 0),  
    threshold=10  # 10秒  
))  
  
# 成本告警  
alert_manager.add_rule(AlertRule(  
    name="high_token_usage",  
    condition=lambda m: m.get("total_input_tokens", 0) + m.get("total_output_tokens", 0),  
    threshold=1000000  # 100万 tokens  
))
```

### 告警通知[​](/wiki/practices/monitoring-logging#告警通知 "告警通知的直接链接")

```
import requests  
  
def slack_alert(rule_name, current_value, threshold):  
    webhook_url = "https://hooks.slack.com/services/xxx"  
      
    payload = {  
        "text": f"🚨 告警: {rule_name}",  
        "attachments": [{  
            "color": "danger",  
            "fields": [  
                {"title": "当前值", "value": str(current_value), "short": True},  
                {"title": "阈值", "value": str(threshold), "short": True}  
            ]  
        }]  
    }  
      
    requests.post(webhook_url, json=payload)  
  
def email_alert(rule_name, current_value, threshold):  
    # 发送邮件告警  
    pass  
  
alert_manager.add_handler(slack_alert)
```

## 追踪（Tracing）[​](/wiki/practices/monitoring-logging#追踪tracing "追踪（Tracing）的直接链接")

### 请求追踪[​](/wiki/practices/monitoring-logging#请求追踪 "请求追踪的直接链接")

```
import uuid  
  
class RequestTracer:  
    def __init__(self):  
        self.traces = {}  
      
    def start_trace(self):  
        trace_id = str(uuid.uuid4())  
        self.traces[trace_id] = {  
            "trace_id": trace_id,  
            "start_time": time.time(),  
            "spans": []  
        }  
        return trace_id  
      
    def add_span(self, trace_id, name, **kwargs):  
        span = {  
            "name": name,  
            "timestamp": time.time(),  
            **kwargs  
        }  
        self.traces[trace_id]["spans"].append(span)  
      
    def end_trace(self, trace_id):  
        trace = self.traces[trace_id]  
        trace["end_time"] = time.time()  
        trace["duration"] = trace["end_time"] - trace["start_time"]  
        return trace  
  
tracer = RequestTracer()  
  
def traced_workflow(user_input):  
    trace_id = tracer.start_trace()  
      
    try:  
        # 输入处理  
        tracer.add_span(trace_id, "input_processing")  
        processed = process_input(user_input)  
          
        # LLM 调用  
        tracer.add_span(trace_id, "llm_call", model="gpt-4o")  
        response = call_llm(processed)  
          
        # 输出处理  
        tracer.add_span(trace_id, "output_processing")  
        result = process_output(response)  
          
        tracer.add_span(trace_id, "success")  
        return result  
      
    except Exception as e:  
        tracer.add_span(trace_id, "error", error=str(e))  
        raise  
      
    finally:  
        trace = tracer.end_trace(trace_id)  
        logger.log("INFO", "trace_complete", **trace)
```

## Dashboard[​](/wiki/practices/monitoring-logging#dashboard "Dashboard的直接链接")

### Grafana 配置示例[​](/wiki/practices/monitoring-logging#grafana-配置示例 "Grafana 配置示例的直接链接")

```
{  
  "dashboard": {  
    "title": "LLM Application Metrics",  
    "panels": [  
      {  
        "title": "Request Rate",  
        "type": "graph",  
        "targets": [{  
          "expr": "rate(llm_requests_total[5m])"  
        }]  
      },  
      {  
        "title": "Latency P95",  
        "type": "graph",  
        "targets": [{  
          "expr": "histogram_quantile(0.95, llm_request_latency_seconds_bucket)"  
        }]  
      },  
      {  
        "title": "Error Rate",  
        "type": "stat",  
        "targets": [{  
          "expr": "sum(rate(llm_requests_total{status='error'}[5m])) / sum(rate(llm_requests_total[5m]))"  
        }]  
      },  
      {  
        "title": "Token Usage",  
        "type": "graph",  
        "targets": [{  
          "expr": "sum(rate(llm_tokens_total[5m])) by (type)"  
        }]  
      }  
    ]  
  }  
}
```

## 最佳实践[​](/wiki/practices/monitoring-logging#最佳实践 "最佳实践的直接链接")

### 监控[​](/wiki/practices/monitoring-logging#监控 "监控的直接链接")

1. **关键指标：** 延迟、错误率、Token 使用
2. **多维度：** 按模型、用户、功能分类
3. **实时性：** 关键指标实时监控
4. **历史数据：** 保留足够的历史用于分析

### 日志[​](/wiki/practices/monitoring-logging#日志 "日志的直接链接")

1. **结构化：** 使用 JSON 格式
2. **追踪 ID：** 每个请求分配唯一 ID
3. **隐私保护：** 不记录敏感信息
4. **适当级别：** 生产环境用 INFO 及以上

### 告警[​](/wiki/practices/monitoring-logging#告警 "告警的直接链接")

1. **分级告警：** 不同严重程度不同通知方式
2. **避免噪音：** 设置合理阈值
3. **可操作：** 告警应包含足够信息
4. **定期回顾：** 调整告警规则


---

> 本页内容来自文档知识库整理，已按 ArmNet 字元服务 服务命名统一更新。
