---
{
  "title": "文本向量化 (Embedding)",
  "source_url": "https://docs.weelinking.com/docs/api-capabilities/text-embedding",
  "description": "通过 weelinking 大模型API中转服务调用文本向量化接口，适用于语义搜索和 RAG 系统",
  "fetched_at": "2026-07-02T06:35:37.913271+00:00"
}
---

# 文本向量化 (Embedding)

文本向量化 (Embedding) API 将文本转换为数字向量，捕捉文本的语义信息。这是构建语义搜索、推荐系统和 RAG (检索增强生成) 应用的基础。

## 支持模型[​](https://docs.weelinking.com/docs/api-capabilities/text-embedding#支持模型 "支持模型的直接链接")

- **text-embedding-3-large**：性能最强，支持降维。
- **text-embedding-3-small**：性能与成本的平衡选择。
- **text-embedding-ada-002**：经典模型，兼容性好。

## 价格[​](https://docs.weelinking.com/docs/api-capabilities/text-embedding#价格 "价格的直接链接")

详见控制台定价页面。通常非常低廉，适合大规模数据处理。

## 快速开始 (Python)[​](https://docs.weelinking.com/docs/api-capabilities/text-embedding#快速开始-python "快速开始 (Python)的直接链接")

```
from openai import OpenAI  
  
client = OpenAI(  
    api_key="YOUR_API_KEY",  
    base_url="https://api.weelinking.com/v1"  
)  
  
response = client.embeddings.create(  
    input="The food was delicious and the waiter...",  
    model="text-embedding-3-small"  
)  
  
print(response.data[0].embedding)
```

## 应用场景[​](https://docs.weelinking.com/docs/api-capabilities/text-embedding#应用场景 "应用场景的直接链接")

1. **语义搜索**：基于含义而非关键词匹配搜索文档。
2. **RAG 系统**：增强 LLM 的知识库，减少幻觉。
3. **聚类与分类**：对文本数据进行分组或打标签。
4. **推荐系统**：根据用户历史行为推荐相似内容。

## 最佳实践[​](https://docs.weelinking.com/docs/api-capabilities/text-embedding#最佳实践 "最佳实践的直接链接")

- **降维**：`text-embedding-3` 系列模型支持通过 `dimensions` 参数减少向量维度，以降低存储和检索成本，同时保持大部分性能。
- **批量处理**：API 支持批量输入，可以一次性处理多条文本以提高效率。
