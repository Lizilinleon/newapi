---
title: "LangChain 接入指南"
description: "在 LangChain 中接入 ArmNet 字元服务 大模型API中转服务，构建智能应用"
lastUpdated: true
---

# LangChain 接入指南

LangChain 是一个用于构建 AI 应用的开发框架，支持多种 LLM 后端。

## 安装[​](/scenarios/engineering/langchain#安装 "安装的直接链接")

```
pip install langchain langchain-openai
```

## 配置 ArmNet 字元服务[​](/scenarios/engineering/langchain#配置-ArmNet 字元服务 "配置 ArmNet 字元服务的直接链接")

### 使用 ChatOpenAI[​](/scenarios/engineering/langchain#使用-chatopenai "使用 ChatOpenAI的直接链接")

```
from langchain_openai import ChatOpenAI  
  
llm = ChatOpenAI(  
    model="gpt-4o",  
    openai_api_key="YOUR_API_KEY",  
    openai_api_base="http://122.51.35.238:5170/v1",  
    temperature=0.7  
)  
  
response = llm.invoke("你好，请介绍一下你自己")  
print(response.content)
```

### 使用 OpenAI[​](/scenarios/engineering/langchain#使用-openai "使用 OpenAI的直接链接")

```
from langchain_openai import OpenAI  
  
llm = OpenAI(  
    model="gpt-3.5-turbo-instruct",  
    openai_api_key="YOUR_API_KEY",  
    openai_api_base="http://122.51.35.238:5170/v1"  
)  
  
response = llm.invoke("写一首关于春天的诗")  
print(response)
```

## 高级用法[​](/scenarios/engineering/langchain#高级用法 "高级用法的直接链接")

### 对话链[​](/scenarios/engineering/langchain#对话链 "对话链的直接链接")

```
from langchain_openai import ChatOpenAI  
from langchain.chains import ConversationChain  
from langchain.memory import ConversationBufferMemory  
  
llm = ChatOpenAI(  
    model="gpt-4o",  
    openai_api_key="YOUR_API_KEY",  
    openai_api_base="http://122.51.35.238:5170/v1"  
)  
  
conversation = ConversationChain(  
    llm=llm,  
    memory=ConversationBufferMemory()  
)  
  
response1 = conversation.predict(input="你好！")  
response2 = conversation.predict(input="我们刚才说了什么？")
```

### RAG 应用[​](/scenarios/engineering/langchain#rag-应用 "RAG 应用的直接链接")

```
from langchain_openai import ChatOpenAI, OpenAIEmbeddings  
from langchain.vectorstores import FAISS  
from langchain.chains import RetrievalQA  
from langchain.document_loaders import TextLoader  
  
# 配置 LLM  
llm = ChatOpenAI(  
    model="gpt-4o",  
    openai_api_key="YOUR_API_KEY",  
    openai_api_base="http://122.51.35.238:5170/v1"  
)  
  
# 配置 Embeddings  
embeddings = OpenAIEmbeddings(  
    openai_api_key="YOUR_API_KEY",  
    openai_api_base="http://122.51.35.238:5170/v1"  
)  
  
# 加载文档  
loader = TextLoader("document.txt")  
documents = loader.load()  
  
# 创建向量存储  
vectorstore = FAISS.from_documents(documents, embeddings)  
  
# 创建问答链  
qa_chain = RetrievalQA.from_chain_type(  
    llm=llm,  
    chain_type="stuff",  
    retriever=vectorstore.as_retriever()  
)  
  
response = qa_chain.run("文档中提到了什么？")
```

### 工具使用[​](/scenarios/engineering/langchain#工具使用 "工具使用的直接链接")

```
from langchain_openai import ChatOpenAI  
from langchain.agents import initialize_agent, Tool  
from langchain.agents import AgentType  
  
llm = ChatOpenAI(  
    model="gpt-4o",  
    openai_api_key="YOUR_API_KEY",  
    openai_api_base="http://122.51.35.238:5170/v1"  
)  
  
tools = [  
    Tool(  
        name="Calculator",  
        func=lambda x: eval(x),  
        description="用于数学计算"  
    )  
]  
  
agent = initialize_agent(  
    tools,  
    llm,  
    agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION,  
    verbose=True  
)  
  
agent.run("计算 25 * 4 + 10")
```

## 推荐模型[​](/scenarios/engineering/langchain#推荐模型 "推荐模型的直接链接")

| 场景 | 模型 |
| --- | --- |
| 通用对话 | gpt-4o |
| 复杂推理 | claude-3-opus, gpt-5 |
| 长文本 | gemini-2.5-pro |
| 代码生成 | claude-sonnet-4-5 |

## 常见问题[​](/scenarios/engineering/langchain#常见问题 "常见问题的直接链接")

### ImportError[​](/scenarios/engineering/langchain#importerror "ImportError的直接链接")

确保安装了正确的包：

```
pip install langchain-openai
```

### API 连接失败[​](/scenarios/engineering/langchain#api-连接失败 "API 连接失败的直接链接")

检查 `openai_api_base` 参数格式，确保包含 `/v1`。


---

> 本页内容来自文档知识库整理，已按 ArmNet 字元服务 服务命名统一更新。
