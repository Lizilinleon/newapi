---
{
  "title": "函数调用",
  "source_url": "https://docs.weelinking.com/docs/wiki/applications/function-calling",
  "description": "通过 weelinking 大模型API中转服务实现 Function Calling，让AI调用外部工具",
  "fetched_at": "2026-07-02T06:35:32.648653+00:00"
}
---

# 函数调用

函数调用（Function Calling / Tool Use）是让大语言模型能够调用外部函数或 API 的技术，极大地扩展了 LLM 的能力边界。

## 核心概念[​](https://docs.weelinking.com/docs/wiki/applications/function-calling#核心概念 "核心概念的直接链接")

### 什么是函数调用[​](https://docs.weelinking.com/docs/wiki/applications/function-calling#什么是函数调用 "什么是函数调用的直接链接")

函数调用让 LLM 可以：

- 识别何时需要调用外部函数
- 生成正确的函数参数
- 基于函数返回结果继续对话

### 工作流程[​](https://docs.weelinking.com/docs/wiki/applications/function-calling#工作流程 "工作流程的直接链接")

```
用户提问 → LLM 判断需要调用函数 → 返回函数调用请求  
     ↓  
执行函数获取结果 → 将结果返回给 LLM → LLM 生成最终回答
```

## 基础用法[​](https://docs.weelinking.com/docs/wiki/applications/function-calling#基础用法 "基础用法的直接链接")

### 定义函数[​](https://docs.weelinking.com/docs/wiki/applications/function-calling#定义函数 "定义函数的直接链接")

```
from openai import OpenAI  
  
client = OpenAI(  
    api_key="your-api-key",  
    base_url="https://api.weelinking.com/v1"  
)  
  
# 定义可用的工具/函数  
tools = [  
    {  
        "type": "function",  
        "function": {  
            "name": "get_weather",  
            "description": "获取指定城市的天气信息",  
            "parameters": {  
                "type": "object",  
                "properties": {  
                    "city": {  
                        "type": "string",  
                        "description": "城市名称，如：北京、上海"  
                    },  
                    "unit": {  
                        "type": "string",  
                        "enum": ["celsius", "fahrenheit"],  
                        "description": "温度单位"  
                    }  
                },  
                "required": ["city"]  
            }  
        }  
    }  
]
```

### 发起调用[​](https://docs.weelinking.com/docs/wiki/applications/function-calling#发起调用 "发起调用的直接链接")

```
def chat_with_tools(user_message):  
    messages = [{"role": "user", "content": user_message}]  
      
    # 第一次调用：让 LLM 决定是否需要调用函数  
    response = client.chat.completions.create(  
        model="gpt-4o",  
        messages=messages,  
        tools=tools,  
        tool_choice="auto"  # auto, none, 或指定函数  
    )  
      
    message = response.choices[0].message  
      
    # 检查是否需要调用函数  
    if message.tool_calls:  
        # 执行函数调用  
        messages.append(message)  
          
        for tool_call in message.tool_calls:  
            function_name = tool_call.function.name  
            arguments = json.loads(tool_call.function.arguments)  
              
            # 执行实际函数  
            result = execute_function(function_name, arguments)  
              
            # 将结果添加到消息  
            messages.append({  
                "role": "tool",  
                "tool_call_id": tool_call.id,  
                "content": json.dumps(result, ensure_ascii=False)  
            })  
          
        # 第二次调用：基于函数结果生成回答  
        response = client.chat.completions.create(  
            model="gpt-4o",  
            messages=messages,  
            tools=tools  
        )  
          
        return response.choices[0].message.content  
    else:  
        return message.content  
  
def execute_function(name, args):  
    if name == "get_weather":  
        # 这里是实际的天气 API 调用  
        return {  
            "city": args["city"],  
            "temperature": 25,  
            "condition": "晴",  
            "humidity": 45  
        }  
    return {"error": "未知函数"}
```

## 高级用法[​](https://docs.weelinking.com/docs/wiki/applications/function-calling#高级用法 "高级用法的直接链接")

### 多函数支持[​](https://docs.weelinking.com/docs/wiki/applications/function-calling#多函数支持 "多函数支持的直接链接")

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
                    "city": {"type": "string", "description": "城市"}  
                },  
                "required": ["city"]  
            }  
        }  
    },  
    {  
        "type": "function",  
        "function": {  
            "name": "search_web",  
            "description": "搜索互联网信息",  
            "parameters": {  
                "type": "object",  
                "properties": {  
                    "query": {"type": "string", "description": "搜索关键词"}  
                },  
                "required": ["query"]  
            }  
        }  
    },  
    {  
        "type": "function",  
        "function": {  
            "name": "send_email",  
            "description": "发送电子邮件",  
            "parameters": {  
                "type": "object",  
                "properties": {  
                    "to": {"type": "string", "description": "收件人邮箱"},  
                    "subject": {"type": "string", "description": "邮件主题"},  
                    "body": {"type": "string", "description": "邮件内容"}  
                },  
                "required": ["to", "subject", "body"]  
            }  
        }  
    }  
]
```

### 并行函数调用[​](https://docs.weelinking.com/docs/wiki/applications/function-calling#并行函数调用 "并行函数调用的直接链接")

LLM 可能一次返回多个函数调用：

```
def handle_parallel_calls(message):  
    if message.tool_calls:  
        tool_results = []  
          
        # 并行执行所有函数调用  
        for tool_call in message.tool_calls:  
            result = execute_function(  
                tool_call.function.name,  
                json.loads(tool_call.function.arguments)  
            )  
            tool_results.append({  
                "role": "tool",  
                "tool_call_id": tool_call.id,  
                "content": json.dumps(result, ensure_ascii=False)  
            })  
          
        return tool_results
```

### 强制函数调用[​](https://docs.weelinking.com/docs/wiki/applications/function-calling#强制函数调用 "强制函数调用的直接链接")

```
# 强制调用特定函数  
response = client.chat.completions.create(  
    model="gpt-4o",  
    messages=messages,  
    tools=tools,  
    tool_choice={"type": "function", "function": {"name": "get_weather"}}  
)  
  
# 禁止函数调用  
response = client.chat.completions.create(  
    model="gpt-4o",  
    messages=messages,  
    tools=tools,  
    tool_choice="none"  
)
```

### 函数装饰器[​](https://docs.weelinking.com/docs/wiki/applications/function-calling#函数装饰器 "函数装饰器的直接链接")

使用装饰器简化函数定义：

```
def tool(description):  
    def decorator(func):  
        func._tool_definition = {  
            "type": "function",  
            "function": {  
                "name": func.__name__,  
                "description": description,  
                "parameters": get_parameters_from_annotations(func)  
            }  
        }  
        return func  
    return decorator  
  
@tool("获取指定城市的天气")  
def get_weather(city: str, unit: str = "celsius") -> dict:  
    """  
    Args:  
        city: 城市名称  
        unit: 温度单位  
    """  
    return {"city": city, "temp": 25}  
  
# 自动生成 tools 列表  
tools = [get_weather._tool_definition]
```

## 常见应用场景[​](https://docs.weelinking.com/docs/wiki/applications/function-calling#常见应用场景 "常见应用场景的直接链接")

### 1. 数据库查询[​](https://docs.weelinking.com/docs/wiki/applications/function-calling#1-数据库查询 "1. 数据库查询的直接链接")

```
{  
    "type": "function",  
    "function": {  
        "name": "query_database",  
        "description": "查询数据库获取业务数据",  
        "parameters": {  
            "type": "object",  
            "properties": {  
                "sql": {  
                    "type": "string",  
                    "description": "SQL 查询语句"  
                }  
            },  
            "required": ["sql"]  
        }  
    }  
}
```

### 2. 日历管理[​](https://docs.weelinking.com/docs/wiki/applications/function-calling#2-日历管理 "2. 日历管理的直接链接")

```
{  
    "type": "function",  
    "function": {  
        "name": "create_event",  
        "description": "创建日历事件",  
        "parameters": {  
            "type": "object",  
            "properties": {  
                "title": {"type": "string", "description": "事件标题"},  
                "start_time": {"type": "string", "description": "开始时间，ISO 格式"},  
                "end_time": {"type": "string", "description": "结束时间，ISO 格式"},  
                "attendees": {  
                    "type": "array",  
                    "items": {"type": "string"},  
                    "description": "参与者邮箱列表"  
                }  
            },  
            "required": ["title", "start_time"]  
        }  
    }  
}
```

### 3. 代码执行[​](https://docs.weelinking.com/docs/wiki/applications/function-calling#3-代码执行 "3. 代码执行的直接链接")

```
{  
    "type": "function",  
    "function": {  
        "name": "execute_python",  
        "description": "执行 Python 代码并返回结果",  
        "parameters": {  
            "type": "object",  
            "properties": {  
                "code": {"type": "string", "description": "要执行的 Python 代码"}  
            },  
            "required": ["code"]  
        }  
    }  
}
```

## 错误处理[​](https://docs.weelinking.com/docs/wiki/applications/function-calling#错误处理 "错误处理的直接链接")

### 函数执行错误[​](https://docs.weelinking.com/docs/wiki/applications/function-calling#函数执行错误 "函数执行错误的直接链接")

```
def execute_function_safe(name, args):  
    try:  
        result = execute_function(name, args)  
        return {"success": True, "data": result}  
    except Exception as e:  
        return {  
            "success": False,  
            "error": str(e),  
            "message": "函数执行失败，请检查参数"  
        }
```

### 参数验证[​](https://docs.weelinking.com/docs/wiki/applications/function-calling#参数验证 "参数验证的直接链接")

```
def validate_and_execute(tool_call):  
    name = tool_call.function.name  
      
    try:  
        args = json.loads(tool_call.function.arguments)  
    except json.JSONDecodeError:  
        return {"error": "参数格式错误"}  
      
    # 参数验证  
    if name == "get_weather":  
        if "city" not in args:  
            return {"error": "缺少必需参数: city"}  
      
    return execute_function(name, args)
```

## 最佳实践[​](https://docs.weelinking.com/docs/wiki/applications/function-calling#最佳实践 "最佳实践的直接链接")

### 1. 清晰的函数描述[​](https://docs.weelinking.com/docs/wiki/applications/function-calling#1-清晰的函数描述 "1. 清晰的函数描述的直接链接")

```
# 好的描述  
"description": "获取指定城市的实时天气信息，包括温度、湿度、天气状况"  
  
# 不好的描述  
"description": "获取天气"
```

### 2. 详细的参数说明[​](https://docs.weelinking.com/docs/wiki/applications/function-calling#2-详细的参数说明 "2. 详细的参数说明的直接链接")

```
"parameters": {  
    "type": "object",  
    "properties": {  
        "date": {  
            "type": "string",  
            "description": "查询日期，格式：YYYY-MM-DD，如 2024-01-15"  
        }  
    }  
}
```

### 3. 使用枚举限制[​](https://docs.weelinking.com/docs/wiki/applications/function-calling#3-使用枚举限制 "3. 使用枚举限制的直接链接")

```
"status": {  
    "type": "string",  
    "enum": ["pending", "completed", "cancelled"],  
    "description": "订单状态"  
}
```

### 4. 安全考虑[​](https://docs.weelinking.com/docs/wiki/applications/function-calling#4-安全考虑 "4. 安全考虑的直接链接")

- 验证所有输入参数
- 限制函数执行权限
- 记录函数调用日志
- 对敏感操作要求确认

## 注意事项[​](https://docs.weelinking.com/docs/wiki/applications/function-calling#注意事项 "注意事项的直接链接")

1. **成本：** 函数调用会增加 token 消耗
2. **延迟：** 多轮调用会增加响应时间
3. **可靠性：** 需要处理函数执行失败的情况
4. **安全：** 不要暴露敏感操作给 LLM
