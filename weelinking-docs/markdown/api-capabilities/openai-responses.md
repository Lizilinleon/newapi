---
{
  "title": "OpenAI Responses API 支持",
  "source_url": "https://docs.weelinking.com/docs/api-capabilities/openai-responses",
  "description": "weelinking 大模型API中转服务对 OpenAI Responses API 的完整支持说明",
  "fetched_at": "2026-07-02T06:35:00.311006+00:00"
}
---

# OpenAI Responses API 支持

Responses API 是 OpenAI 最新推出的智能体 (Agent) 构建接口，旨在简化构建具备多步推理、工具使用和状态管理能力的 AI 应用。weelinking 已全量支持该接口。

## 核心特性[​](https://docs.weelinking.com/docs/api-capabilities/openai-responses#核心特性 "核心特性的直接链接")

- **内置工具支持**：原生支持 Web Search (联网搜索)、File Search (文件搜索)、Code Interpreter (代码解释器) 和 Function Calling。
- **状态管理**：无需开发者手动维护复杂的对话历史，API 内部管理状态。
- **持久化推理**：支持 O3 / O4-mini 等模型的推理过程持久化。
- **简化开发**：相比 Chat Completions API，大幅减少了构建 Agent 所需的胶水代码。

## 快速开始[​](https://docs.weelinking.com/docs/api-capabilities/openai-responses#快速开始 "快速开始的直接链接")

### Python 示例[​](https://docs.weelinking.com/docs/api-capabilities/openai-responses#python-示例 "Python 示例的直接链接")

```
from openai import OpenAI  
  
client = OpenAI(  
    api_key="YOUR_API_KEY",  
    base_url="https://api.weelinking.com/v1"  
)  
  
# 注意：使用 responses.create 而不是 chat.completions.create  
response = client.responses.create(  
    model="gpt-4o",  
    tools=[{"type": "web_search"}], # 启用联网搜索  
    instructions="Help me find the latest news about AI."  
)  
  
print(response)
```

## 与 Chat Completions API 对比[​](https://docs.weelinking.com/docs/api-capabilities/openai-responses#与-chat-completions-api-对比 "与 Chat Completions API 对比的直接链接")

| 特性 | Chat Completions API | Responses API |
| --- | --- | --- |
| 定位 | 基础对话生成 | 智能体构建 |
| 工具调用 | 需手动解析并回传结果 | 内置自动调用与循环 |
| 状态管理 | 客户端维护 `messages` | 服务端维护 |
| 适用场景 | 简单对话、单次任务 | 复杂任务、Agent 开发 |

## 请求参数[​](https://docs.weelinking.com/docs/api-capabilities/openai-responses#请求参数 "请求参数的直接链接")

- `model` (必填): 模型 ID。
- `tools` (可选): 启用的工具列表。
- `instructions` (可选): 系统指令/提示词。
- `input` (可选): 用户输入内容。
