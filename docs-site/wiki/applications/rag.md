---
title: "RAG（检索增强生成）"
description: "RAG 检索增强生成技术详解，结合 ArmNet 字元服务 大模型API中转服务构建知识驱动应用"
lastUpdated: true
---

# RAG（检索增强生成）

RAG（Retrieval-Augmented Generation，检索增强生成）是一种将信息检索与大语言模型生成相结合的技术，可以让 AI 基于外部知识库回答问题。

## 为什么需要 RAG[​](/wiki/applications/rag#为什么需要-rag "为什么需要 RAG的直接链接")

### LLM 的局限性[​](/wiki/applications/rag#llm-的局限性 "LLM 的局限性的直接链接")

大语言模型存在以下问题：

- **知识截止：** 训练数据有时间限制
- **幻觉问题：** 可能生成虚假信息
- **领域限制：** 缺乏专业领域知识
- **无法更新：** 知识无法实时更新

### RAG 的解决方案[​](/wiki/applications/rag#rag-的解决方案 "RAG 的解决方案的直接链接")

RAG 通过外部检索来增强 LLM：

- 提供最新信息
- 基于真实文档回答
- 支持私有知识库
- 可追溯来源

## 工作原理[​](/wiki/applications/rag#工作原理 "工作原理的直接链接")

### 基本流程[​](/wiki/applications/rag#基本流程 "基本流程的直接链接")

```
用户问题 → 问题向量化 → 向量检索 → 获取相关文档 → 构建提示词 → LLM 生成 → 回答
```

### 详细步骤[​](/wiki/applications/rag#详细步骤 "详细步骤的直接链接")

1. **文档预处理**

   - 加载文档（PDF、Word、网页等）
   - 文本分块（Chunking）
   - 生成向量嵌入
2. **索引构建**

   - 将向量存入向量数据库
   - 建立检索索引
3. **查询处理**

   - 用户问题向量化
   - 相似度检索
   - 获取 Top-K 相关文档
4. **生成回答**

   - 将检索结果加入提示词
   - LLM 基于上下文生成回答

## 关键组件[​](/wiki/applications/rag#关键组件 "关键组件的直接链接")

### 1. 文本分块策略[​](/wiki/applications/rag#1-文本分块策略 "1. 文本分块策略的直接链接")

| 策略 | 说明 | 适用场景 |
| --- | --- | --- |
| 固定大小 | 按字符数分割 | 通用场景 |
| 语义分块 | 按段落/章节分割 | 结构化文档 |
| 递归分块 | 多级分隔符 | 混合内容 |
| 重叠分块 | 块间有重叠 | 保持上下文 |

### 2. 嵌入模型[​](/wiki/applications/rag#2-嵌入模型 "2. 嵌入模型的直接链接")

常用的 Embedding 模型：

- **OpenAI text-embedding-3-large**
- **Cohere embed-v3**
- **BGE-M3**（开源多语言）
- **Jina Embeddings**

### 3. 向量数据库[​](/wiki/applications/rag#3-向量数据库 "3. 向量数据库的直接链接")

| 数据库 | 特点 |
| --- | --- |
| Milvus | 开源、分布式、高性能 |
| Pinecone | 托管服务、易用 |
| Chroma | 轻量、Python 友好 |
| Qdrant | Rust 编写、高性能 |
| pgvector | PostgreSQL 扩展 |

### 4. 检索策略[​](/wiki/applications/rag#4-检索策略 "4. 检索策略的直接链接")

- **向量检索：** 语义相似度
- **关键词检索：** BM25 等传统方法
- **混合检索：** 结合两者优势
- **重排序：** 对检索结果二次排序

## 代码示例[​](/wiki/applications/rag#代码示例 "代码示例的直接链接")

### 基础 RAG 实现[​](/wiki/applications/rag#基础-rag-实现 "基础 RAG 实现的直接链接")

```
from openai import OpenAI  
import chromadb  
  
# 初始化  
client = OpenAI(api_key="your-api-key", base_url="http://122.51.35.238:5170/v1")  
chroma_client = chromadb.Client()  
collection = chroma_client.create_collection("docs")  
  
# 添加文档  
def add_documents(texts, ids):  
    # 生成嵌入  
    embeddings = []  
    for text in texts:  
        response = client.embeddings.create(  
            model="text-embedding-3-small",  
            input=text  
        )  
        embeddings.append(response.data[0].embedding)  
      
    # 存入向量数据库  
    collection.add(  
        embeddings=embeddings,  
        documents=texts,  
        ids=ids  
    )  
  
# RAG 查询  
def rag_query(question):  
    # 问题向量化  
    q_embedding = client.embeddings.create(  
        model="text-embedding-3-small",  
        input=question  
    ).data[0].embedding  
      
    # 检索相关文档  
    results = collection.query(  
        query_embeddings=[q_embedding],  
        n_results=3  
    )  
      
    # 构建提示词  
    context = "\n".join(results['documents'][0])  
    prompt = f"""基于以下信息回答问题：  
  
{context}  
  
问题：{question}  
"""  
      
    # 生成回答  
    response = client.chat.completions.create(  
        model="gpt-4o",  
        messages=[{"role": "user", "content": prompt}]  
    )  
      
    return response.choices[0].message.content
```

## 进阶技术[​](/wiki/applications/rag#进阶技术 "进阶技术的直接链接")

### 1. 查询改写[​](/wiki/applications/rag#1-查询改写 "1. 查询改写的直接链接")

优化用户查询以提高检索效果：

- **HyDE：** 生成假设文档再检索
- **多查询：** 生成多个变体查询
- **查询扩展：** 添加同义词和相关词

### 2. 上下文压缩[​](/wiki/applications/rag#2-上下文压缩 "2. 上下文压缩的直接链接")

减少冗余信息：

- **摘要提取：** 只保留关键信息
- **相关性过滤：** 删除无关内容
- **动态分块：** 根据查询调整

### 3. 多跳推理[​](/wiki/applications/rag#3-多跳推理 "3. 多跳推理的直接链接")

处理复杂问题：

- **迭代检索：** 多轮检索逐步深入
- **子问题分解：** 拆分复杂问题
- **推理链：** 显式推理步骤

## 评估指标[​](/wiki/applications/rag#评估指标 "评估指标的直接链接")

| 指标 | 说明 |
| --- | --- |
| Recall@K | 前 K 个结果的召回率 |
| MRR | 平均倒数排名 |
| NDCG | 归一化折损累计增益 |
| 答案正确性 | 生成答案的准确性 |
| 忠实度 | 答案是否基于检索内容 |

## 最佳实践[​](/wiki/applications/rag#最佳实践 "最佳实践的直接链接")

1. **分块大小：** 通常 200-500 tokens
2. **重叠比例：** 10%-20% 的重叠
3. **Top-K 选择：** 3-5 个文档通常足够
4. **混合检索：** 结合向量和关键词检索
5. **来源引用：** 在回答中标注信息来源


---

> 本页内容来自文档知识库整理，已按 ArmNet 字元服务 服务命名统一更新。
