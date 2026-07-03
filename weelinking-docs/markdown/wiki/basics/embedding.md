---
{
  "title": "嵌入 (Embedding)",
  "source_url": "https://docs.weelinking.com/docs/wiki/basics/embedding",
  "description": "Embedding 向量化技术介绍，weelinking 大模型API中转服务支持多种向量模型",
  "fetched_at": "2026-07-02T06:34:53.506420+00:00"
}
---

# 嵌入 (Embedding)

嵌入（Embedding）是将文本（词、句子、段落）转换为由浮点数组成的固定长度的\*\*向量（Vector）\*\*的过程。

## 核心概念[​](https://docs.weelinking.com/docs/wiki/basics/embedding#核心概念 "核心概念的直接链接")

计算机无法直接理解文字的含义，但可以计算数字之间的距离。Embedding 将语义相似的文本映射到向量空间中距离较近的点。

- **输入：** "猫"
- **Embedding 输出：** `[0.12, -0.56, 0.88, ...]` (假设是 1536 维的向量)

## 语义相似度[​](https://docs.weelinking.com/docs/wiki/basics/embedding#语义相似度 "语义相似度的直接链接")

如果两个文本在语义上相似，它们的 Embedding 向量之间的距离（通常用余弦相似度计算）就会很近。

- "猫" 和 "小猫" 的向量距离：**极近**
- "猫" 和 "狗" 的向量距离：**较近**（都是宠物）
- "猫" 和 "冰箱" 的向量距离：**很远**

## 应用[​](https://docs.weelinking.com/docs/wiki/basics/embedding#应用 "应用的直接链接")

- **语义搜索：** 不仅仅匹配关键词，而是匹配含义。
- **推荐系统：** 推荐相似的内容。
- **RAG (检索增强生成)：** 知识库检索的核心技术。
