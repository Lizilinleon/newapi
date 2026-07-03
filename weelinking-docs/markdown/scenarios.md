---
{
  "title": "使用场景",
  "source_url": "https://docs.weelinking.com/docs/scenarios",
  "description": "weelinking 大模型API中转服务在编程、对话、翻译等场景中的接入指南",
  "fetched_at": "2026-07-02T06:34:28.092590+00:00"
}
---

# 使用场景

weelinking 支持众多主流应用和开发框架的接入。以下是按场景分类的接入指南。

## 编程开发[​](https://docs.weelinking.com/docs/scenarios#编程开发 "编程开发的直接链接")

适用于代码编写、调试、重构等开发场景的工具。

- [Claude Code](https://docs.weelinking.com/docs/scenarios/programming/claude-code): Anthropic 官方 AI 编程助手
- [Gemini CLI](https://docs.weelinking.com/docs/scenarios/programming/gemini-cli): 谷歌 Gemini 命令行工具
- [Codex CLI](https://docs.weelinking.com/docs/scenarios/programming/codex-cli): 命令行 AI 编程助手
- [Cursor](https://docs.weelinking.com/docs/scenarios/programming/cursor): AI 驱动的代码编辑器

## AI智能体[​](https://docs.weelinking.com/docs/scenarios#ai智能体 "AI智能体的直接链接")

适用于构建 AI 应用和工作流的开发框架。

- [LangChain](https://docs.weelinking.com/docs/scenarios/engineering/langchain): 构建 AI 应用的开发框架
- [Dify](https://docs.weelinking.com/docs/scenarios/engineering/dify): 可视化 AI 应用开发平台

## 接入优势[​](https://docs.weelinking.com/docs/scenarios#接入优势 "接入优势的直接链接")

### 统一接口[​](https://docs.weelinking.com/docs/scenarios#统一接口 "统一接口的直接链接")

所有应用都使用相同的 API 接口格式（兼容 OpenAI），配置方式统一：

```
API Base URL: https://api.weelinking.com/v1  
API Key: 您的 weelinking 密钥
```

### 灵活切换[​](https://docs.weelinking.com/docs/scenarios#灵活切换 "灵活切换的直接链接")

只需修改模型名称，即可在不同模型之间切换：

| 应用需求 | 推荐模型 |
| --- | --- |
| 日常对话 | gpt-4o, claude-3-opus |
| 代码开发 | claude-sonnet-4-5, gpt-5.1-codex |
| 长文本 | gemini-2.5-pro |
| 快速响应 | claude-haiku, gpt-4o-mini |

### 成本优化[​](https://docs.weelinking.com/docs/scenarios#成本优化 "成本优化的直接链接")

- 统一计费，透明定价
- 充值加赠，最高8折
- 按量付费，灵活使用
