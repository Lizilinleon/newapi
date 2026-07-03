---
{
  "title": "向量数据库 (Vector Database)",
  "source_url": "https://docs.weelinking.com/docs/wiki/basics/vector-database",
  "description": "向量数据库概念介绍，配合 weelinking 大模型API中转服务构建检索增强应用",
  "fetched_at": "2026-07-02T06:34:54.226549+00:00"
}
---

# 向量数据库 (Vector Database)

向量数据库是一种专门设计用于存储、管理和索引高维向量数据的数据库。它是实现 RAG（检索增强生成）和现代 AI 应用的关键基础设施。

## 为什么需要向量数据库？[​](https://docs.weelinking.com/docs/wiki/basics/vector-database#为什么需要向量数据库 "为什么需要向量数据库？的直接链接")

传统的数据库（如 MySQL, PostgreSQL）擅长精确匹配（如 `WHERE id = 1`），但不擅长在高维空间中寻找“最相似”的数据。

向量数据库使用了特殊的索引算法（如 HNSW, IVFFlat），可以在数亿条数据中毫秒级地找到与查询向量最相似的 Top-K 条记录。

## 常见向量数据库[​](https://docs.weelinking.com/docs/wiki/basics/vector-database#常见向量数据库 "常见向量数据库的直接链接")

- **Milvus:** 开源、高性能、云原生。
- **Pinecone:** 托管型服务，易于使用。
- **Chroma:** 轻量级，适合 Python 开发。
- **Qdrant:** Rust 编写，性能优异。
- **pgvector:** PostgreSQL 的向量扩展插件。

## 工作流程[​](https://docs.weelinking.com/docs/wiki/basics/vector-database#工作流程 "工作流程的直接链接")

1. 将知识库文本通过 Embedding 模型转换为向量。
2. 将向量存入向量数据库。
3. 用户提问时，将问题也转换为向量。
4. 在数据库中搜索最相似的向量。
5. 返回相关文本给 LLM 生成答案。
