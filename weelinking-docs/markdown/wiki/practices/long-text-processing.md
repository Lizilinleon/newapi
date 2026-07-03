---
{
  "title": "长文本处理",
  "source_url": "https://docs.weelinking.com/docs/wiki/practices/long-text-processing",
  "description": "通过 weelinking 大模型API中转服务处理超长文本和大型文档的策略",
  "fetched_at": "2026-07-02T06:35:17.024302+00:00"
}
---

# 长文本处理

虽然现代 LLM 的上下文窗口越来越大（128K、200K 甚至 1M+），但处理长文本仍然面临成本、效率和效果的挑战。本文介绍长文本处理的最佳策略。

## 挑战与限制[​](https://docs.weelinking.com/docs/wiki/practices/long-text-processing#挑战与限制 "挑战与限制的直接链接")

### 上下文窗口限制[​](https://docs.weelinking.com/docs/wiki/practices/long-text-processing#上下文窗口限制 "上下文窗口限制的直接链接")

| 模型 | 上下文窗口 | 约等于字数 |
| --- | --- | --- |
| GPT-4o | 128K | ~10万字 |
| Claude 3.5 | 200K | ~15万字 |
| Gemini 1.5 Pro | 2M | ~150万字 |

### 长上下文的问题[​](https://docs.weelinking.com/docs/wiki/practices/long-text-processing#长上下文的问题 "长上下文的问题的直接链接")

1. **成本高昂：** Token 数量大
2. **注意力稀释：** 中间内容容易被忽略
3. **延迟增加：** 处理时间更长
4. **精度下降：** 关键信息可能被遗漏

## 处理策略[​](https://docs.weelinking.com/docs/wiki/practices/long-text-processing#处理策略 "处理策略的直接链接")

### 1. 分块处理（Chunking）[​](https://docs.weelinking.com/docs/wiki/practices/long-text-processing#1-分块处理chunking "1. 分块处理（Chunking）的直接链接")

将长文本分成多个块分别处理：

```
def chunk_text(text, chunk_size=4000, overlap=200):  
    """将文本分成重叠的块"""  
    chunks = []  
    start = 0  
      
    while start < len(text):  
        end = start + chunk_size  
        chunk = text[start:end]  
        chunks.append({  
            "content": chunk,  
            "start": start,  
            "end": min(end, len(text))  
        })  
        start = end - overlap  
      
    return chunks  
  
def process_long_document(document, task):  
    chunks = chunk_text(document)  
    results = []  
      
    for chunk in chunks:  
        result = call_llm(f"{task}\n\n文本片段：\n{chunk['content']}")  
        results.append(result)  
      
    # 合并结果  
    return merge_results(results)
```

### 2. 递归摘要（Map-Reduce）[​](https://docs.weelinking.com/docs/wiki/practices/long-text-processing#2-递归摘要map-reduce "2. 递归摘要（Map-Reduce）的直接链接")

先摘要各部分，再汇总：

```
def recursive_summarize(document, max_chunk_size=4000):  
    # 分块  
    chunks = chunk_text(document, max_chunk_size)  
      
    # Map: 每块生成摘要  
    summaries = []  
    for chunk in chunks:  
        summary = call_llm(f"请摘要以下内容（200字以内）：\n{chunk['content']}")  
        summaries.append(summary)  
      
    # 合并摘要  
    combined = "\n\n".join(summaries)  
      
    # 如果合并后仍然太长，递归处理  
    if count_tokens(combined) > max_chunk_size:  
        return recursive_summarize(combined, max_chunk_size)  
      
    # Reduce: 生成最终摘要  
    final_summary = call_llm(f"基于以下分段摘要，生成一份完整的文档摘要：\n{combined}")  
      
    return final_summary
```

### 3. 关键信息提取 + 压缩[​](https://docs.weelinking.com/docs/wiki/practices/long-text-processing#3-关键信息提取--压缩 "3. 关键信息提取 + 压缩的直接链接")

先提取关键信息，再处理：

```
def extract_and_process(document, query):  
    # 提取与查询相关的关键段落  
    relevant_parts = extract_relevant_sections(document, query)  
      
    # 压缩关键信息  
    compressed = call_llm(f"""  
    请提取以下文本中与"{query}"相关的关键信息，  
    压缩到 1000 字以内，保留关键数据和结论：  
      
    {relevant_parts}  
    """)  
      
    # 基于压缩内容回答  
    answer = call_llm(f"""  
    基于以下信息回答问题：  
      
    信息：{compressed}  
      
    问题：{query}  
    """)  
      
    return answer
```

### 4. 滑动窗口[​](https://docs.weelinking.com/docs/wiki/practices/long-text-processing#4-滑动窗口 "4. 滑动窗口的直接链接")

处理需要连续性的长文本：

```
def sliding_window_analysis(document, window_size=8000, step=4000):  
    """滑动窗口分析，保持上下文连续性"""  
    results = []  
      
    for start in range(0, len(document), step):  
        end = min(start + window_size, len(document))  
        window = document[start:end]  
          
        # 包含之前窗口的摘要  
        context = f"之前内容摘要：{results[-1]['summary'] if results else '无'}"  
          
        result = call_llm(f"""  
        {context}  
          
        请分析以下文本段落：  
        {window}  
        """)  
          
        results.append({  
            "start": start,  
            "end": end,  
            "analysis": result,  
            "summary": extract_summary(result)  
        })  
      
    return results
```

## RAG 增强处理[​](https://docs.weelinking.com/docs/wiki/practices/long-text-processing#rag-增强处理 "RAG 增强处理的直接链接")

### 向量检索[​](https://docs.weelinking.com/docs/wiki/practices/long-text-processing#向量检索 "向量检索的直接链接")

不是处理全部文本，而是检索最相关的部分：

```
def rag_long_document(document, query):  
    # 1. 文档分块和向量化  
    chunks = chunk_text(document, chunk_size=500)  
      
    for chunk in chunks:  
        embedding = get_embedding(chunk["content"])  
        vector_db.insert({"text": chunk["content"], "embedding": embedding})  
      
    # 2. 检索相关块  
    query_embedding = get_embedding(query)  
    relevant_chunks = vector_db.search(query_embedding, top_k=10)  
      
    # 3. 基于相关内容回答  
    context = "\n\n".join([c["text"] for c in relevant_chunks])  
      
    answer = call_llm(f"""  
    基于以下相关内容回答问题：  
      
    内容：  
    {context}  
      
    问题：{query}  
    """)  
      
    return answer
```

## 特定任务的处理[​](https://docs.weelinking.com/docs/wiki/practices/long-text-processing#特定任务的处理 "特定任务的处理的直接链接")

### 1. 文档问答[​](https://docs.weelinking.com/docs/wiki/practices/long-text-processing#1-文档问答 "1. 文档问答的直接链接")

```
def document_qa(document, questions):  
    # 创建文档索引  
    index = create_document_index(document)  
      
    answers = []  
    for question in questions:  
        # 检索相关段落  
        relevant = index.search(question, top_k=5)  
          
        # 生成答案  
        answer = call_llm(f"""  
        根据以下文档内容回答问题。如果文档中没有相关信息，请说明。  
          
        文档内容：  
        {relevant}  
          
        问题：{question}  
        """)  
          
        answers.append({"question": question, "answer": answer})  
      
    return answers
```

### 2. 文档摘要[​](https://docs.weelinking.com/docs/wiki/practices/long-text-processing#2-文档摘要 "2. 文档摘要的直接链接")

```
def hierarchical_summary(document):  
    """层级摘要：章节摘要 → 全文摘要"""  
      
    # 按章节分割  
    chapters = split_by_chapters(document)  
      
    # 每章摘要  
    chapter_summaries = []  
    for chapter in chapters:  
        summary = call_llm(f"""  
        请为以下章节生成摘要（100字以内）：  
          
        标题：{chapter['title']}  
        内容：{chapter['content']}  
        """)  
        chapter_summaries.append(f"## {chapter['title']}\n{summary}")  
      
    # 全文摘要  
    overall_summary = call_llm(f"""  
    基于以下章节摘要，生成一份 300 字的全文摘要：  
      
    {chr(10).join(chapter_summaries)}  
    """)  
      
    return {  
        "chapter_summaries": chapter_summaries,  
        "overall_summary": overall_summary  
    }
```

### 3. 文档翻译[​](https://docs.weelinking.com/docs/wiki/practices/long-text-processing#3-文档翻译 "3. 文档翻译的直接链接")

```
def translate_long_document(document, target_lang="中文"):  
    # 按段落分割  
    paragraphs = document.split("\n\n")  
      
    translated = []  
    for i, para in enumerate(paragraphs):  
        if not para.strip():  
            translated.append("")  
            continue  
          
        # 翻译时提供上下文  
        context = translated[-2:] if len(translated) >= 2 else []  
          
        translation = call_llm(f"""  
        翻译以下段落为{target_lang}，保持与上文的连贯性。  
          
        上文参考：  
        {chr(10).join(context)}  
          
        待翻译段落：  
        {para}  
          
        只输出翻译结果。  
        """)  
          
        translated.append(translation)  
      
    return "\n\n".join(translated)
```

### 4. 代码库分析[​](https://docs.weelinking.com/docs/wiki/practices/long-text-processing#4-代码库分析 "4. 代码库分析的直接链接")

```
def analyze_codebase(code_files):  
    # 1. 先分析各文件结构  
    file_analyses = []  
    for file in code_files:  
        analysis = call_llm(f"""  
        分析以下代码文件，提取：  
        - 主要功能  
        - 关键类/函数  
        - 依赖关系  
          
        文件：{file['path']}  
        代码：  
        ```  
        {file['content']}  
        ```  
        """)  
        file_analyses.append({"file": file['path'], "analysis": analysis})  
      
    # 2. 综合分析整体架构  
    overall = call_llm(f"""  
    基于以下各文件分析，描述整体代码架构：  
      
    {json.dumps(file_analyses, ensure_ascii=False, indent=2)}  
    """)  
      
    return overall
```

## 性能优化[​](https://docs.weelinking.com/docs/wiki/practices/long-text-processing#性能优化 "性能优化的直接链接")

### 1. 并行处理[​](https://docs.weelinking.com/docs/wiki/practices/long-text-processing#1-并行处理 "1. 并行处理的直接链接")

```
import asyncio  
  
async def process_chunks_parallel(chunks, task, max_concurrent=5):  
    semaphore = asyncio.Semaphore(max_concurrent)  
      
    async def process_chunk(chunk):  
        async with semaphore:  
            return await async_llm_call(f"{task}\n\n{chunk['content']}")  
      
    tasks = [process_chunk(chunk) for chunk in chunks]  
    results = await asyncio.gather(*tasks)  
      
    return results
```

### 2. 缓存中间结果[​](https://docs.weelinking.com/docs/wiki/practices/long-text-processing#2-缓存中间结果 "2. 缓存中间结果的直接链接")

```
import hashlib  
  
cache = {}  
  
def process_with_cache(document, task):  
    cache_key = hashlib.md5((document + task).encode()).hexdigest()  
      
    if cache_key in cache:  
        return cache[cache_key]  
      
    result = process_long_document(document, task)  
    cache[cache_key] = result  
      
    return result
```

## 最佳实践[​](https://docs.weelinking.com/docs/wiki/practices/long-text-processing#最佳实践 "最佳实践的直接链接")

1. **选择合适的分块大小：** 通常 500-2000 tokens
2. **保留重叠：** 分块时保持 10-20% 重叠
3. **使用 RAG：** 大文档优先考虑检索增强
4. **分层处理：** 先提取要点，再深入分析
5. **利用长上下文模型：** Gemini、Claude 适合处理超长文本
6. **监控成本：** 长文本处理成本高，注意控制
