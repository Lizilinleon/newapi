---
{
  "title": "Top-p (Nucleus Sampling)",
  "source_url": "https://docs.weelinking.com/docs/wiki/basics/top-p",
  "description": "Top-P 参数详解，在 weelinking 大模型API中转服务中控制输出多样性",
  "fetched_at": "2026-07-02T06:34:52.780843+00:00"
}
---

# Top-p (Nucleus Sampling)

Top-p（又称核采样）是除了 Temperature 之外，另一个常用的控制模型输出随机性的参数。

## 工作原理[​](https://docs.weelinking.com/docs/wiki/basics/top-p#工作原理 "工作原理的直接链接")

模型在生成下一个词时，会预测所有可能词的概率分布。

- **Top-p = 0.1:** 模型只考虑累积概率达到 10% 的那些最高概率的词。这会使输出非常保守和准确。
- **Top-p = 0.9:** 模型会考虑累积概率达到 90% 的词，这意味着很多低概率的词也有机会被选中，增加了多样性。

## Top-p vs Temperature[​](https://docs.weelinking.com/docs/wiki/basics/top-p#top-p-vs-temperature "Top-p vs Temperature的直接链接")

- **Temperature** 是调整概率分布的“形状”（平滑或尖锐）。
- **Top-p** 是直接“截断”低概率的尾部。

## 最佳实践[​](https://docs.weelinking.com/docs/wiki/basics/top-p#最佳实践 "最佳实践的直接链接")

**不要同时调整 Temperature 和 Top-p。**
通常建议：

- 固定 Top-p (例如 1.0)，只调整 Temperature。
- 或者固定 Temperature (例如 1.0)，只调整 Top-p。
