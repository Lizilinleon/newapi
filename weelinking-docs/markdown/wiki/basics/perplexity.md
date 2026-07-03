---
{
  "title": "困惑度 (Perplexity)",
  "source_url": "https://docs.weelinking.com/docs/wiki/basics/perplexity",
  "description": "困惑度指标介绍，评估 weelinking 大模型API中转平台上各模型的性能表现",
  "fetched_at": "2026-07-02T06:34:55.699980+00:00"
}
---

# 困惑度 (Perplexity)

困惑度（Perplexity，简称 PPL）是衡量概率模型预测样本好坏程度的指标。在自然语言处理中，它常被用来评估语言模型生成文本的流畅度和准确性。

## 定义[​](https://docs.weelinking.com/docs/wiki/basics/perplexity#定义 "定义的直接链接")

简单来说，困惑度反映了模型对下一个词感到“困惑”的程度。

- **困惑度越低：** 模型对预测结果越有信心，生成的文本通常越通顺、自然。
- **困惑度越高：** 模型越拿不准，生成的文本可能杂乱无章。

## 局限性[​](https://docs.weelinking.com/docs/wiki/basics/perplexity#局限性 "局限性的直接链接")

虽然困惑度是训练阶段的重要指标，但它并不完全等同于人类感知的生成质量。一个困惑度很低的模型，可能只是在机械地重复常见的句子，而缺乏逻辑或创造力。

因此，现在评估 LLM 更多采用基准测试（Benchmarks，如 MMLU, GSM8K）或人类评估（LMSYS Chatbot Arena）。
