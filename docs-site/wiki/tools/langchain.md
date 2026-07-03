---
title: "LangChain"
description: "LangChain 开发框架介绍，结合 ArmNet 字元服务 大模型API中转服务构建 LLM 应用"
lastUpdated: true
---

# LangChain

LangChain 是一个用于构建大语言模型应用的开源框架，提供了丰富的组件和工具，帮助开发者快速构建复杂的 AI 应用。

## 核心概念[​](/wiki/tools/langchain#核心概念 "核心概念的直接链接")

### 什么是 LangChain[​](/wiki/tools/langchain#什么是-langchain "什么是 LangChain的直接链接")

LangChain 提供：

- **标准化接口：** 统一的 LLM 调用方式
- **组件库：** 预构建的功能组件
- **链式组合：** 灵活的工作流编排
- **Agent 框架：** 自主决策能力
- **记忆系统：** 对话状态管理

### 核心组件[​](/wiki/tools/langchain#核心组件 "核心组件的直接链接")

| 组件 | 说明 |
| --- | --- |
| Models | LLM 和聊天模型封装 |
| Prompts | 提示词模板管理 |
| Chains | 多步骤工作流编排 |
| Agents | 自主决策和工具调用 |
| Memory | 对话记忆管理 |
| Retrievers | 数据检索组件 |
| Tools | 外部工具集成 |

## 快速开始[​](/wiki/tools/langchain#快速开始 "快速开始的直接链接")

### 安装[​](/wiki/tools/langchain#安装 "安装的直接链接")

```
pip install langchain langchain-openai
```

### 基础用法[​](/wiki/tools/langchain#基础用法 "基础用法的直接链接")

```
from langchain_openai import ChatOpenAI  
from langchain_core.messages import HumanMessage, SystemMessage  
  
# 初始化模型  
llm = ChatOpenAI(  
    model="gpt-4o",  
    api_key="your-api-key",  
    base_url="http://122.51.35.238:5170/v1"  
)  
  
# 简单对话  
messages = [  
    SystemMessage(content="你是一个有帮助的助手。"),  
    HumanMessage(content="什么是机器学习？")  
]  
  
response = llm.invoke(messages)  
print(response.content)
```

## 提示词模板[​](/wiki/tools/langchain#提示词模板 "提示词模板的直接链接")

### 基础模板[​](/wiki/tools/langchain#基础模板 "基础模板的直接链接")

```
from langchain_core.prompts import ChatPromptTemplate  
  
# 创建模板  
prompt = ChatPromptTemplate.from_messages([  
    ("system", "你是一个{role}专家。"),  
    ("human", "{question}")  
])  
  
# 格式化  
formatted = prompt.format_messages(  
    role="Python",  
    question="如何读取 JSON 文件？"  
)  
  
response = llm.invoke(formatted)
```

### 复杂模板[​](/wiki/tools/langchain#复杂模板 "复杂模板的直接链接")

```
from langchain_core.prompts import PromptTemplate  
  
template = """  
你是一位{expertise}专家。  
  
用户问题：{question}  
  
请按以下格式回答：  
1. 简要回答  
2. 详细解释  
3. 示例代码（如适用）  
"""  
  
prompt = PromptTemplate(  
    input_variables=["expertise", "question"],  
    template=template  
)
```

## 链式调用（Chains）[​](/wiki/tools/langchain#链式调用chains "链式调用（Chains）的直接链接")

### 简单链[​](/wiki/tools/langchain#简单链 "简单链的直接链接")

```
from langchain_core.output_parsers import StrOutputParser  
  
# 使用 LCEL (LangChain Expression Language)  
chain = prompt | llm | StrOutputParser()  
  
result = chain.invoke({  
    "expertise": "Python",  
    "question": "什么是装饰器？"  
})
```

### 顺序链[​](/wiki/tools/langchain#顺序链 "顺序链的直接链接")

```
from langchain_core.runnables import RunnablePassthrough  
  
# 第一步：生成代码  
code_prompt = ChatPromptTemplate.from_template(  
    "用 Python 实现以下功能：{task}"  
)  
  
# 第二步：解释代码  
explain_prompt = ChatPromptTemplate.from_template(  
    "请解释以下代码：\n{code}"  
)  
  
# 组合链  
chain = (  
    {"task": RunnablePassthrough()}  
    | code_prompt  
    | llm  
    | StrOutputParser()  
    | (lambda code: {"code": code})  
    | explain_prompt  
    | llm  
    | StrOutputParser()  
)  
  
result = chain.invoke("计算斐波那契数列")
```

## RAG 实现[​](/wiki/tools/langchain#rag-实现 "RAG 实现的直接链接")

### 文档加载[​](/wiki/tools/langchain#文档加载 "文档加载的直接链接")

```
from langchain_community.document_loaders import (  
    TextLoader,  
    PyPDFLoader,  
    WebBaseLoader  
)  
  
# 加载文本文件  
text_loader = TextLoader("document.txt")  
docs = text_loader.load()  
  
# 加载 PDF  
pdf_loader = PyPDFLoader("document.pdf")  
pdf_docs = pdf_loader.load()  
  
# 加载网页  
web_loader = WebBaseLoader("https://example.com")  
web_docs = web_loader.load()
```

### 文本分割[​](/wiki/tools/langchain#文本分割 "文本分割的直接链接")

```
from langchain.text_splitter import RecursiveCharacterTextSplitter  
  
splitter = RecursiveCharacterTextSplitter(  
    chunk_size=1000,  
    chunk_overlap=200,  
    separators=["\n\n", "\n", "。", ".", " ", ""]  
)  
  
chunks = splitter.split_documents(docs)
```

### 向量存储[​](/wiki/tools/langchain#向量存储 "向量存储的直接链接")

```
from langchain_openai import OpenAIEmbeddings  
from langchain_community.vectorstores import Chroma  
  
# 创建嵌入模型  
embeddings = OpenAIEmbeddings(  
    model="text-embedding-3-small",  
    api_key="your-api-key",  
    base_url="http://122.51.35.238:5170/v1"  
)  
  
# 创建向量存储  
vectorstore = Chroma.from_documents(  
    documents=chunks,  
    embedding=embeddings,  
    persist_directory="./chroma_db"  
)  
  
# 创建检索器  
retriever = vectorstore.as_retriever(  
    search_type="similarity",  
    search_kwargs={"k": 5}  
)
```

### 完整 RAG 链[​](/wiki/tools/langchain#完整-rag-链 "完整 RAG 链的直接链接")

```
from langchain_core.runnables import RunnableParallel  
  
# RAG 提示词  
rag_prompt = ChatPromptTemplate.from_template("""  
基于以下信息回答问题。如果信息中没有相关内容，请说明。  
  
信息：  
{context}  
  
问题：{question}  
""")  
  
# 构建 RAG 链  
rag_chain = (  
    RunnableParallel({  
        "context": retriever | (lambda docs: "\n\n".join(d.page_content for d in docs)),  
        "question": RunnablePassthrough()  
    })  
    | rag_prompt  
    | llm  
    | StrOutputParser()  
)  
  
# 使用  
answer = rag_chain.invoke("什么是机器学习？")
```

## Agent[​](/wiki/tools/langchain#agent "Agent的直接链接")

### 基础 Agent[​](/wiki/tools/langchain#基础-agent "基础 Agent的直接链接")

```
from langchain.agents import create_openai_tools_agent, AgentExecutor  
from langchain.tools import tool  
  
# 定义工具  
@tool  
def search_web(query: str) -> str:  
    """搜索网络获取信息"""  
    # 实际的搜索实现  
    return f"搜索结果：{query}"  
  
@tool  
def calculate(expression: str) -> str:  
    """计算数学表达式"""  
    try:  
        return str(eval(expression))  
    except:  
        return "计算错误"  
  
tools = [search_web, calculate]  
  
# 创建 Agent  
agent_prompt = ChatPromptTemplate.from_messages([  
    ("system", "你是一个有帮助的助手，可以使用工具来帮助用户。"),  
    ("human", "{input}"),  
    ("placeholder", "{agent_scratchpad}")  
])  
  
agent = create_openai_tools_agent(llm, tools, agent_prompt)  
agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)  
  
# 运行  
result = agent_executor.invoke({"input": "计算 123 * 456"})
```

### ReAct Agent[​](/wiki/tools/langchain#react-agent "ReAct Agent的直接链接")

```
from langchain.agents import create_react_agent  
from langchain import hub  
  
# 使用预定义的 ReAct 提示词  
react_prompt = hub.pull("hwchase17/react")  
  
react_agent = create_react_agent(llm, tools, react_prompt)  
react_executor = AgentExecutor(agent=react_agent, tools=tools, verbose=True)  
  
result = react_executor.invoke({"input": "北京今天天气怎么样？"})
```

## 记忆系统[​](/wiki/tools/langchain#记忆系统 "记忆系统的直接链接")

### 对话记忆[​](/wiki/tools/langchain#对话记忆 "对话记忆的直接链接")

```
from langchain.memory import ConversationBufferMemory  
from langchain.chains import ConversationChain  
  
memory = ConversationBufferMemory()  
  
conversation = ConversationChain(  
    llm=llm,  
    memory=memory,  
    verbose=True  
)  
  
# 多轮对话  
conversation.predict(input="我叫小明")  
conversation.predict(input="我刚才说我叫什么？")
```

### 摘要记忆[​](/wiki/tools/langchain#摘要记忆 "摘要记忆的直接链接")

```
from langchain.memory import ConversationSummaryMemory  
  
summary_memory = ConversationSummaryMemory(llm=llm)
```

### 向量记忆[​](/wiki/tools/langchain#向量记忆 "向量记忆的直接链接")

```
from langchain.memory import VectorStoreRetrieverMemory  
  
# 使用向量存储的长期记忆  
vector_memory = VectorStoreRetrieverMemory(  
    retriever=vectorstore.as_retriever()  
)
```

## 输出解析[​](/wiki/tools/langchain#输出解析 "输出解析的直接链接")

### 结构化输出[​](/wiki/tools/langchain#结构化输出 "结构化输出的直接链接")

```
from langchain_core.output_parsers import JsonOutputParser  
from pydantic import BaseModel, Field  
  
class Person(BaseModel):  
    name: str = Field(description="姓名")  
    age: int = Field(description="年龄")  
    occupation: str = Field(description="职业")  
  
parser = JsonOutputParser(pydantic_object=Person)  
  
prompt = ChatPromptTemplate.from_messages([  
    ("system", "提取以下文本中的人物信息。{format_instructions}"),  
    ("human", "{text}")  
]).partial(format_instructions=parser.get_format_instructions())  
  
chain = prompt | llm | parser  
  
result = chain.invoke({"text": "张三，25岁，是一名软件工程师。"})  
# result = {"name": "张三", "age": 25, "occupation": "软件工程师"}
```

## 回调和监控[​](/wiki/tools/langchain#回调和监控 "回调和监控的直接链接")

```
from langchain_core.callbacks import BaseCallbackHandler  
  
class CustomCallback(BaseCallbackHandler):  
    def on_llm_start(self, serialized, prompts, **kwargs):  
        print(f"开始调用 LLM...")  
      
    def on_llm_end(self, response, **kwargs):  
        print(f"LLM 调用完成，Token: {response.llm_output}")  
      
    def on_llm_error(self, error, **kwargs):  
        print(f"LLM 错误: {error}")  
  
# 使用回调  
llm_with_callback = ChatOpenAI(  
    model="gpt-4o",  
    callbacks=[CustomCallback()]  
)
```

## 最佳实践[​](/wiki/tools/langchain#最佳实践 "最佳实践的直接链接")

### 1. 使用 LCEL[​](/wiki/tools/langchain#1-使用-lcel "1. 使用 LCEL的直接链接")

优先使用 LangChain Expression Language：

- 更简洁的语法
- 更好的类型支持
- 自动支持流式和批处理

### 2. 模块化设计[​](/wiki/tools/langchain#2-模块化设计 "2. 模块化设计的直接链接")

```
# 将复杂链拆分为可复用的组件  
summarizer = prompt_summarize | llm | StrOutputParser()  
translator = prompt_translate | llm | StrOutputParser()  
  
# 组合使用  
full_chain = summarizer | translator
```

### 3. 错误处理[​](/wiki/tools/langchain#3-错误处理 "3. 错误处理的直接链接")

```
from langchain_core.runnables import RunnableWithFallbacks  
  
# 添加降级模型  
chain_with_fallback = chain.with_fallbacks([  
    fallback_chain  
])
```

## 相关资源[​](/wiki/tools/langchain#相关资源 "相关资源的直接链接")

- [LangChain 官方文档](https://python.langchain.com/)
- [LangChain GitHub](https://github.com/langchain-ai/langchain)
- [LangSmith](https://smith.langchain.com/) - 调试和监控平台


---

> 本页内容来自文档知识库整理，已按 ArmNet 字元服务 服务命名统一更新。
