---
{
  "title": "知识问答",
  "source_url": "https://docs.weelinking.com/docs/wiki/applications/knowledge-qa",
  "description": "通过 weelinking 大模型API中转服务构建基于知识库的智能问答系统",
  "fetched_at": "2026-07-02T06:35:29.807619+00:00"
}
---

# 知识问答

知识问答系统是指能够根据特定知识库回答用户问题的 AI 系统，广泛应用于客服、教育、企业内部等场景。

## 系统架构[​](https://docs.weelinking.com/docs/wiki/applications/knowledge-qa#系统架构 "系统架构的直接链接")

### 基本流程[​](https://docs.weelinking.com/docs/wiki/applications/knowledge-qa#基本流程 "基本流程的直接链接")

```
用户问题 → 意图识别 → 知识检索 → 答案生成 → 回复用户
```

### 核心组件[​](https://docs.weelinking.com/docs/wiki/applications/knowledge-qa#核心组件 "核心组件的直接链接")

1. **知识库：** 存储领域知识
2. **检索系统：** 找到相关知识
3. **生成模型：** 生成自然语言答案
4. **对话管理：** 处理多轮对话

## 知识库构建[​](https://docs.weelinking.com/docs/wiki/applications/knowledge-qa#知识库构建 "知识库构建的直接链接")

### 1. 知识来源[​](https://docs.weelinking.com/docs/wiki/applications/knowledge-qa#1-知识来源 "1. 知识来源的直接链接")

| 类型 | 说明 | 处理方式 |
| --- | --- | --- |
| 文档 | PDF、Word、PPT | 解析提取文本 |
| 网页 | HTML 内容 | 爬取清洗 |
| FAQ | 问答对 | 直接使用 |
| 数据库 | 结构化数据 | SQL 查询 |
| API | 实时数据 | 接口调用 |

### 2. 知识处理[​](https://docs.weelinking.com/docs/wiki/applications/knowledge-qa#2-知识处理 "2. 知识处理的直接链接")

```
from langchain.text_splitter import RecursiveCharacterTextSplitter  
  
def process_document(document_text):  
    # 文本分块  
    splitter = RecursiveCharacterTextSplitter(  
        chunk_size=500,  
        chunk_overlap=50,  
        separators=["\n\n", "\n", "。", ".", " ", ""]  
    )  
    chunks = splitter.split_text(document_text)  
      
    # 生成嵌入  
    embeddings = []  
    for chunk in chunks:  
        embedding = client.embeddings.create(  
            model="text-embedding-3-small",  
            input=chunk  
        ).data[0].embedding  
        embeddings.append({"text": chunk, "embedding": embedding})  
      
    return embeddings
```

### 3. 知识入库[​](https://docs.weelinking.com/docs/wiki/applications/knowledge-qa#3-知识入库 "3. 知识入库的直接链接")

```
import chromadb  
  
def build_knowledge_base(documents):  
    client = chromadb.Client()  
    collection = client.create_collection("knowledge_base")  
      
    for doc in documents:  
        chunks = process_document(doc["content"])  
        for i, chunk in enumerate(chunks):  
            collection.add(  
                ids=[f"{doc['id']}_{i}"],  
                embeddings=[chunk["embedding"]],  
                documents=[chunk["text"]],  
                metadatas=[{"source": doc["source"]}]  
            )  
      
    return collection
```

## 问答实现[​](https://docs.weelinking.com/docs/wiki/applications/knowledge-qa#问答实现 "问答实现的直接链接")

### 基础问答[​](https://docs.weelinking.com/docs/wiki/applications/knowledge-qa#基础问答 "基础问答的直接链接")

```
from openai import OpenAI  
  
client = OpenAI(api_key="your-api-key", base_url="https://api.weelinking.com/v1")  
  
class KnowledgeQA:  
    def __init__(self, collection):  
        self.collection = collection  
      
    def answer(self, question):  
        # 1. 检索相关知识  
        q_embedding = client.embeddings.create(  
            model="text-embedding-3-small",  
            input=question  
        ).data[0].embedding  
          
        results = self.collection.query(  
            query_embeddings=[q_embedding],  
            n_results=5  
        )  
          
        # 2. 构建上下文  
        context = "\n\n".join(results["documents"][0])  
          
        # 3. 生成答案  
        response = client.chat.completions.create(  
            model="gpt-4o",  
            messages=[  
                {  
                    "role": "system",  
                    "content": """你是一个知识问答助手。根据提供的知识回答用户问题。  
  
要求：  
1. 只根据提供的知识回答，不要编造  
2. 如果知识中没有相关信息，诚实说不知道  
3. 回答简洁明了  
4. 适当引用来源"""  
                },  
                {  
                    "role": "user",  
                    "content": f"知识库内容：\n{context}\n\n问题：{question}"  
                }  
            ]  
        )  
          
        return {  
            "answer": response.choices[0].message.content,  
            "sources": results["metadatas"][0]  
        }
```

### 增强问答[​](https://docs.weelinking.com/docs/wiki/applications/knowledge-qa#增强问答 "增强问答的直接链接")

添加意图识别和多轮对话：

```
class AdvancedKnowledgeQA:  
    def __init__(self, collection):  
        self.collection = collection  
        self.conversation_history = []  
      
    def classify_intent(self, question):  
        """识别用户意图"""  
        response = client.chat.completions.create(  
            model="gpt-4o-mini",  
            messages=[  
                {  
                    "role": "system",  
                    "content": """分类用户意图：  
- knowledge_query: 知识查询  
- clarification: 要求澄清  
- feedback: 反馈评价  
- chitchat: 闲聊  
- other: 其他  
  
返回 JSON: {"intent": "...", "entities": [...]}"""  
                },  
                {"role": "user", "content": question}  
            ],  
            response_format={"type": "json_object"}  
        )  
        return json.loads(response.choices[0].message.content)  
      
    def rewrite_query(self, question):  
        """结合历史改写查询"""  
        if not self.conversation_history:  
            return question  
          
        history_text = "\n".join([  
            f"用户: {h['user']}\n助手: {h['assistant']}"  
            for h in self.conversation_history[-3:]  
        ])  
          
        response = client.chat.completions.create(  
            model="gpt-4o-mini",  
            messages=[  
                {  
                    "role": "system",  
                    "content": "根据对话历史，将用户的问题改写为完整的独立问题。只输出改写后的问题。"  
                },  
                {  
                    "role": "user",  
                    "content": f"对话历史：\n{history_text}\n\n当前问题：{question}"  
                }  
            ]  
        )  
        return response.choices[0].message.content  
      
    def answer(self, question):  
        # 意图识别  
        intent = self.classify_intent(question)  
          
        if intent["intent"] == "chitchat":  
            return {"answer": "我是知识问答助手，请问有什么专业问题可以帮您？"}  
          
        # 查询改写  
        refined_query = self.rewrite_query(question)  
          
        # 检索和生成答案  
        result = self._generate_answer(refined_query)  
          
        # 更新历史  
        self.conversation_history.append({  
            "user": question,  
            "assistant": result["answer"]  
        })  
          
        return result
```

## FAQ 匹配[​](https://docs.weelinking.com/docs/wiki/applications/knowledge-qa#faq-匹配 "FAQ 匹配的直接链接")

对于常见问题，可以先尝试精确匹配：

```
class FAQMatcher:  
    def __init__(self, faq_pairs):  
        self.faqs = faq_pairs  
        self.embeddings = self._build_embeddings()  
      
    def _build_embeddings(self):  
        embeddings = []  
        for faq in self.faqs:  
            emb = client.embeddings.create(  
                model="text-embedding-3-small",  
                input=faq["question"]  
            ).data[0].embedding  
            embeddings.append(emb)  
        return embeddings  
      
    def match(self, question, threshold=0.9):  
        q_emb = client.embeddings.create(  
            model="text-embedding-3-small",  
            input=question  
        ).data[0].embedding  
          
        # 计算相似度  
        similarities = [  
            self._cosine_similarity(q_emb, e)  
            for e in self.embeddings  
        ]  
          
        max_sim = max(similarities)  
        if max_sim > threshold:  
            idx = similarities.index(max_sim)  
            return self.faqs[idx]["answer"]  
          
        return None
```

## 答案质量保证[​](https://docs.weelinking.com/docs/wiki/applications/knowledge-qa#答案质量保证 "答案质量保证的直接链接")

### 1. 来源引用[​](https://docs.weelinking.com/docs/wiki/applications/knowledge-qa#1-来源引用 "1. 来源引用的直接链接")

```
def answer_with_citation(question, context_chunks):  
    response = client.chat.completions.create(  
        model="gpt-4o",  
        messages=[  
            {  
                "role": "system",  
                "content": """回答问题时，使用 [1]、[2] 等标注引用来源。  
在答案末尾列出参考来源。"""  
            },  
            {  
                "role": "user",  
                "content": f"[1] {context_chunks[0]}\n[2] {context_chunks[1]}\n\n问题：{question}"  
            }  
        ]  
    )  
    return response.choices[0].message.content
```

### 2. 置信度评估[​](https://docs.weelinking.com/docs/wiki/applications/knowledge-qa#2-置信度评估 "2. 置信度评估的直接链接")

```
def answer_with_confidence(question, context):  
    response = client.chat.completions.create(  
        model="gpt-4o",  
        messages=[  
            {  
                "role": "system",  
                "content": """回答问题并评估置信度。  
返回 JSON：  
{  
    "answer": "答案",  
    "confidence": "high/medium/low",  
    "reason": "置信度理由"  
}"""  
            },  
            {"role": "user", "content": f"知识：{context}\n问题：{question}"}  
        ],  
        response_format={"type": "json_object"}  
    )  
    return json.loads(response.choices[0].message.content)
```

## 应用场景[​](https://docs.weelinking.com/docs/wiki/applications/knowledge-qa#应用场景 "应用场景的直接链接")

### 1. 智能客服[​](https://docs.weelinking.com/docs/wiki/applications/knowledge-qa#1-智能客服 "1. 智能客服的直接链接")

- 产品咨询
- 售后问题
- 订单查询

### 2. 企业知识库[​](https://docs.weelinking.com/docs/wiki/applications/knowledge-qa#2-企业知识库 "2. 企业知识库的直接链接")

- 内部规章制度
- 技术文档
- 项目资料

### 3. 教育答疑[​](https://docs.weelinking.com/docs/wiki/applications/knowledge-qa#3-教育答疑 "3. 教育答疑的直接链接")

- 课程内容
- 习题解答
- 学习辅导

## 最佳实践[​](https://docs.weelinking.com/docs/wiki/applications/knowledge-qa#最佳实践 "最佳实践的直接链接")

1. **知识库质量：** 确保知识准确、完整
2. **检索优化：** 使用混合检索提高召回
3. **答案验证：** 重要问题需要验证
4. **反馈收集：** 收集用户反馈持续优化
5. **人工兜底：** 复杂问题转人工处理
