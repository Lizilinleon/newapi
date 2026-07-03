---
{
  "title": "多轮对话",
  "source_url": "https://docs.weelinking.com/docs/wiki/applications/multi-turn-dialogue",
  "description": "通过 weelinking 大模型API中转服务构建具有上下文记忆的多轮对话系统",
  "fetched_at": "2026-07-02T06:35:25.614445+00:00"
}
---

# 多轮对话

多轮对话是指 AI 系统能够记住之前的对话内容，在多次交互中保持上下文连贯性的对话方式。

## 核心概念[​](https://docs.weelinking.com/docs/wiki/applications/multi-turn-dialogue#核心概念 "核心概念的直接链接")

### 什么是多轮对话[​](https://docs.weelinking.com/docs/wiki/applications/multi-turn-dialogue#什么是多轮对话 "什么是多轮对话的直接链接")

与单轮问答不同，多轮对话需要：

- 记住历史对话
- 理解指代和省略
- 保持话题连贯
- 追踪对话状态

### 对话示例[​](https://docs.weelinking.com/docs/wiki/applications/multi-turn-dialogue#对话示例 "对话示例的直接链接")

```
用户：北京天气怎么样？  
AI：北京今天晴，25°C。  
  
用户：那上海呢？  ← 省略了"天气怎么样"  
AI：上海今天多云，28°C。  
  
用户：哪个更适合出行？  ← 指代"北京和上海"  
AI：北京天气更好，更适合出行。
```

## 技术实现[​](https://docs.weelinking.com/docs/wiki/applications/multi-turn-dialogue#技术实现 "技术实现的直接链接")

### 1. 消息格式[​](https://docs.weelinking.com/docs/wiki/applications/multi-turn-dialogue#1-消息格式 "1. 消息格式的直接链接")

OpenAI 格式的多轮对话：

```
messages = [  
    {"role": "system", "content": "你是一个有帮助的助手。"},  
    {"role": "user", "content": "我叫小明"},  
    {"role": "assistant", "content": "你好小明，有什么可以帮助你的？"},  
    {"role": "user", "content": "我刚才说我叫什么？"},  
    {"role": "assistant", "content": "你刚才说你叫小明。"}  
]
```

### 2. 角色说明[​](https://docs.weelinking.com/docs/wiki/applications/multi-turn-dialogue#2-角色说明 "2. 角色说明的直接链接")

| 角色 | 说明 |
| --- | --- |
| system | 系统提示，设定 AI 的行为 |
| user | 用户的输入 |
| assistant | AI 的回复 |

### 3. 上下文管理[​](https://docs.weelinking.com/docs/wiki/applications/multi-turn-dialogue#3-上下文管理 "3. 上下文管理的直接链接")

```
from openai import OpenAI  
  
client = OpenAI(api_key="your-api-key", base_url="https://api.weelinking.com/v1")  
  
class ChatSession:  
    def __init__(self, system_prompt="你是一个有帮助的AI助手。"):  
        self.messages = [{"role": "system", "content": system_prompt}]  
      
    def chat(self, user_input):  
        # 添加用户消息  
        self.messages.append({"role": "user", "content": user_input})  
          
        # 调用 API  
        response = client.chat.completions.create(  
            model="gpt-4o",  
            messages=self.messages  
        )  
          
        assistant_message = response.choices[0].message.content  
          
        # 添加助手回复  
        self.messages.append({"role": "assistant", "content": assistant_message})  
          
        return assistant_message  
      
    def get_history(self):  
        return self.messages  
  
# 使用示例  
session = ChatSession()  
print(session.chat("我叫小明"))  
print(session.chat("我刚才说我叫什么？"))
```

## 上下文窗口管理[​](https://docs.weelinking.com/docs/wiki/applications/multi-turn-dialogue#上下文窗口管理 "上下文窗口管理的直接链接")

### 问题：上下文过长[​](https://docs.weelinking.com/docs/wiki/applications/multi-turn-dialogue#问题上下文过长 "问题：上下文过长的直接链接")

当对话很长时，可能超出模型的上下文窗口限制。

### 解决方案[​](https://docs.weelinking.com/docs/wiki/applications/multi-turn-dialogue#解决方案 "解决方案的直接链接")

#### 1. 截断策略[​](https://docs.weelinking.com/docs/wiki/applications/multi-turn-dialogue#1-截断策略 "1. 截断策略的直接链接")

保留最近的 N 条消息：

```
def truncate_messages(messages, max_messages=20):  
    if len(messages) > max_messages:  
        # 保留 system 消息和最近的对话  
        return [messages[0]] + messages[-(max_messages-1):]  
    return messages
```

#### 2. 摘要策略[​](https://docs.weelinking.com/docs/wiki/applications/multi-turn-dialogue#2-摘要策略 "2. 摘要策略的直接链接")

定期总结历史对话：

```
def summarize_history(messages):  
    summary_prompt = "请总结以下对话的关键信息：\n" + format_messages(messages)  
    summary = client.chat.completions.create(  
        model="gpt-4o-mini",  
        messages=[{"role": "user", "content": summary_prompt}]  
    ).choices[0].message.content  
      
    return [  
        {"role": "system", "content": f"之前对话摘要：{summary}"},  
        messages[-1]  # 保留最后一条  
    ]
```

#### 3. 滑动窗口[​](https://docs.weelinking.com/docs/wiki/applications/multi-turn-dialogue#3-滑动窗口 "3. 滑动窗口的直接链接")

保留固定 Token 数量：

```
import tiktoken  
  
def sliding_window(messages, max_tokens=4000):  
    encoder = tiktoken.encoding_for_model("gpt-4o")  
      
    total_tokens = 0  
    result = []  
      
    # 从后往前添加消息  
    for msg in reversed(messages):  
        msg_tokens = len(encoder.encode(msg["content"]))  
        if total_tokens + msg_tokens > max_tokens:  
            break  
        result.insert(0, msg)  
        total_tokens += msg_tokens  
      
    return result
```

## 对话状态追踪[​](https://docs.weelinking.com/docs/wiki/applications/multi-turn-dialogue#对话状态追踪 "对话状态追踪的直接链接")

### 什么是对话状态[​](https://docs.weelinking.com/docs/wiki/applications/multi-turn-dialogue#什么是对话状态 "什么是对话状态的直接链接")

对话状态是对当前对话情况的结构化表示：

```
dialogue_state = {  
    "user_name": "小明",  
    "current_topic": "天气查询",  
    "mentioned_cities": ["北京", "上海"],  
    "user_preference": "晴天"  
}
```

### 状态追踪实现[​](https://docs.weelinking.com/docs/wiki/applications/multi-turn-dialogue#状态追踪实现 "状态追踪实现的直接链接")

```
def update_state(messages, current_state):  
    prompt = f"""  
    当前对话状态：{json.dumps(current_state, ensure_ascii=False)}  
      
    最新对话：  
    用户：{messages[-1]['content']}  
      
    请更新对话状态，返回 JSON 格式。  
    """  
      
    response = client.chat.completions.create(  
        model="gpt-4o",  
        messages=[{"role": "user", "content": prompt}],  
        response_format={"type": "json_object"}  
    )  
      
    return json.loads(response.choices[0].message.content)
```

## 多轮对话的挑战[​](https://docs.weelinking.com/docs/wiki/applications/multi-turn-dialogue#多轮对话的挑战 "多轮对话的挑战的直接链接")

### 1. 指代消解[​](https://docs.weelinking.com/docs/wiki/applications/multi-turn-dialogue#1-指代消解 "1. 指代消解的直接链接")

理解"它"、"那个"、"这里"等指代词：

- 显式：通过上下文推断
- 隐式：模型内部处理

### 2. 话题切换[​](https://docs.weelinking.com/docs/wiki/applications/multi-turn-dialogue#2-话题切换 "2. 话题切换的直接链接")

用户可能突然改变话题：

- 检测话题变化
- 适当保留或清除上下文

### 3. 长期记忆[​](https://docs.weelinking.com/docs/wiki/applications/multi-turn-dialogue#3-长期记忆 "3. 长期记忆的直接链接")

跨会话的记忆：

- 用户偏好
- 历史交互
- 个人信息

## 最佳实践[​](https://docs.weelinking.com/docs/wiki/applications/multi-turn-dialogue#最佳实践 "最佳实践的直接链接")

1. **明确的 System Prompt：** 设定清晰的对话规则
2. **合理的历史长度：** 保留足够但不过多的上下文
3. **状态持久化：** 重要状态单独存储
4. **错误处理：** 处理上下文理解错误
5. **用户确认：** 关键信息主动确认

## 应用场景[​](https://docs.weelinking.com/docs/wiki/applications/multi-turn-dialogue#应用场景 "应用场景的直接链接")

- **客服机器人：** 跨轮次理解用户问题
- **教育辅导：** 持续跟踪学习进度
- **心理咨询：** 记住用户情况和偏好
- **个人助理：** 理解用户习惯和需求
