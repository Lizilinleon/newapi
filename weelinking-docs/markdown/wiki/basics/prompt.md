---
{
  "title": "提示词 (Prompt)",
  "source_url": "https://docs.weelinking.com/docs/wiki/basics/prompt",
  "description": "Prompt 提示词概念介绍，掌握通过 weelinking 大模型API中转服务高效使用AI的基础",
  "fetched_at": "2026-07-02T06:34:50.629207+00:00"
}
---

# 提示词 (Prompt)

提示词（Prompt）是指用户发送给大语言模型的输入文本，它包含了用户的指令、问题、上下文信息以及期望的输出格式。

## Prompt 的结构[​](https://docs.weelinking.com/docs/wiki/basics/prompt#prompt-的结构 "Prompt 的结构的直接链接")

一个高质量的 Prompt 通常包含以下要素：

1. **立人设 (Role):** 告诉 AI 它是谁（例如：“你是一位资深的 Python 程序员”）。
2. **背景 (Context):** 提供任务的背景信息。
3. **指令 (Instruction):** 明确告诉 AI 要做什么（例如：“请解释这段代码”）。
4. **约束 (Constraints):** 限制输出的范围或风格（例如：“请用通俗易懂的语言，不超过 200 字”）。
5. **示例 (Few-Shot):** 提供几个输入输出的例子（Few-Shot Learning），帮助 AI 理解预期。

## 提示词工程 (Prompt Engineering)[​](https://docs.weelinking.com/docs/wiki/basics/prompt#提示词工程-prompt-engineering "提示词工程 (Prompt Engineering)的直接链接")

提示词工程是一门通过优化 Prompt 来提升 AI 输出质量的技术。好的 Prompt 能让模型发挥出 120% 的能力，而糟糕的 Prompt 可能导致模型答非所问。

## 示例[​](https://docs.weelinking.com/docs/wiki/basics/prompt#示例 "示例的直接链接")

**普通 Prompt:**

> 帮我写个请假条。

**优质 Prompt:**

> 你是公司的行政助手。请帮我写一份病假条。
> 原因：重感冒发烧。
> 时间：明天（周三）一天。
> 语气：正式、礼貌。
> 接收人：王经理。
