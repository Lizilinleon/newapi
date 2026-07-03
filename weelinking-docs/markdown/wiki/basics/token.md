---
{
  "title": "Token (词元)",
  "source_url": "https://docs.weelinking.com/docs/wiki/basics/token",
  "description": "Token 概念详解，理解 weelinking 大模型API中转服务的计费基础",
  "fetched_at": "2026-07-02T06:34:49.911345+00:00"
}
---

# Token (词元)

Token 是大语言模型处理文本的最小单位。模型并不直接“读”懂单词或汉字，而是将文本切分成一个个 Token，然后将其转换为数字向量进行计算。

## 什么是 Token？[​](https://docs.weelinking.com/docs/wiki/basics/token#什么是-token "什么是 Token？的直接链接")

Token 可以是一个单词、一个汉字、一个词根，甚至是一个字符。

- **英文：** 一个单词通常是一个 Token，但也可能被拆分（例如 "ing"）。平均 1000 个单词 ≈ 750 个 Token。
- **中文：** 一个汉字通常对应 1~2 个 Token，具体取决于模型使用的分词器（Tokenizer）。

## 为什么重要？[​](https://docs.weelinking.com/docs/wiki/basics/token#为什么重要 "为什么重要？的直接链接")

1. **计费单位：** 几乎所有的商业 API 都是按 Token 数量计费的（输入 Token + 输出 Token）。
2. **上下文限制：** 每个模型都有最大 Token 限制（Context Window），超过这个长度的内容会被截断或遗忘。

## 示例[​](https://docs.weelinking.com/docs/wiki/basics/token#示例 "示例的直接链接")

句子："我爱人工智能"

- **分词结果（假设）：** ["我", "爱", "人工", "智能"]
- **Token 数量：** 4 个 Token

句子："I love AI"

- **分词结果：** ["I", " love", " AI"]
- **Token 数量：** 3 个 Token
