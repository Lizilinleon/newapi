---
{
  "title": "温度 (Temperature)",
  "source_url": "https://docs.weelinking.com/docs/wiki/basics/temperature",
  "description": "Temperature 参数详解，在 weelinking 大模型API中转服务中灵活控制输出效果",
  "fetched_at": "2026-07-02T06:34:52.065877+00:00"
}
---

# 温度 (Temperature)

温度（Temperature）是调用 LLM API 时的一个重要参数，用于控制模型输出的随机性和创造性。取值范围通常在 0 到 1 之间（有些模型支持到 2）。

## 参数影响[​](https://docs.weelinking.com/docs/wiki/basics/temperature#参数影响 "参数影响的直接链接")

- **低温度 (0 ~ 0.3):**

  - **特点：** 输出非常稳定、确定性高，每次回答几乎一样。
  - **适用场景：** 代码生成、数学解题、事实性问答、数据提取。
  - **原理：** 模型总是选择概率最高的那个词。
- **高温度 (0.7 ~ 1.0+):**

  - **特点：** 输出更具创造性、多样性，但可能出现幻觉或逻辑错误。
  - **适用场景：** 创意写作、头脑风暴、角色扮演、聊天。
  - **原理：** 模型会按概率随机选择稍微次优的词，增加了变化。

## 建议[​](https://docs.weelinking.com/docs/wiki/basics/temperature#建议 "建议的直接链接")

- 如果你需要**精准**的答案（如 API 解释），请将温度设为 `0`。
- 如果你需要**有趣**的对话，尝试 `0.7` 或更高。
