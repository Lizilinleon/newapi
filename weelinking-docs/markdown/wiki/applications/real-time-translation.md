---
{
  "title": "实时翻译",
  "source_url": "https://docs.weelinking.com/docs/wiki/applications/real-time-translation",
  "description": "通过 weelinking 大模型API中转服务实现高质量的AI实时翻译",
  "fetched_at": "2026-07-02T06:35:28.917169+00:00"
}
---

# 实时翻译

大语言模型在翻译任务上表现出色，能够理解上下文、保持语义连贯，并处理复杂的语言现象。

## LLM 翻译的优势[​](https://docs.weelinking.com/docs/wiki/applications/real-time-translation#llm-翻译的优势 "LLM 翻译的优势的直接链接")

### 对比传统翻译[​](https://docs.weelinking.com/docs/wiki/applications/real-time-translation#对比传统翻译 "对比传统翻译的直接链接")

| 特性 | 传统 NMT | LLM 翻译 |
| --- | --- | --- |
| 上下文理解 | 有限 | 强大 |
| 领域适应 | 需要专门训练 | 提示词即可 |
| 风格控制 | 困难 | 简单 |
| 术语一致性 | 需要词典 | 可通过提示词指定 |
| 创意翻译 | 较弱 | 强 |

### LLM 翻译能做到[​](https://docs.weelinking.com/docs/wiki/applications/real-time-translation#llm-翻译能做到 "LLM 翻译能做到的直接链接")

- 理解复杂句式和隐含含义
- 保持文风和语气
- 处理俚语和文化特定表达
- 根据指令调整翻译风格
- 保持专业术语一致性

## 基础翻译实现[​](https://docs.weelinking.com/docs/wiki/applications/real-time-translation#基础翻译实现 "基础翻译实现的直接链接")

### 简单翻译[​](https://docs.weelinking.com/docs/wiki/applications/real-time-translation#简单翻译 "简单翻译的直接链接")

```
from openai import OpenAI  
  
client = OpenAI(api_key="your-api-key", base_url="https://api.weelinking.com/v1")  
  
def translate(text, source_lang="auto", target_lang="中文"):  
    response = client.chat.completions.create(  
        model="gpt-4o-mini",  
        messages=[  
            {  
                "role": "system",  
                "content": f"你是一个专业翻译，将文本翻译成{target_lang}。只输出翻译结果，不要解释。"  
            },  
            {  
                "role": "user",  
                "content": text  
            }  
        ],  
        temperature=0.3  
    )  
    return response.choices[0].message.content  
  
# 使用示例  
result = translate("Hello, how are you today?")  
print(result)  # 你好，今天怎么样？
```

### 高质量翻译[​](https://docs.weelinking.com/docs/wiki/applications/real-time-translation#高质量翻译 "高质量翻译的直接链接")

```
def professional_translate(text, source_lang, target_lang, context=None, style=None, glossary=None):  
    system_prompt = f"""你是一位专业的{source_lang}到{target_lang}翻译专家。  
  
## 翻译要求  
- 准确传达原文含义  
- 保持语言流畅自然  
- 符合目标语言的表达习惯"""  
  
    if context:  
        system_prompt += f"\n\n## 背景信息\n{context}"  
      
    if style:  
        system_prompt += f"\n\n## 风格要求\n{style}"  
      
    if glossary:  
        system_prompt += f"\n\n## 术语表（必须使用指定翻译）\n"  
        for term, trans in glossary.items():  
            system_prompt += f"- {term} → {trans}\n"  
  
    system_prompt += "\n\n只输出翻译结果，不要添加任何解释。"  
  
    response = client.chat.completions.create(  
        model="gpt-4o",  
        messages=[  
            {"role": "system", "content": system_prompt},  
            {"role": "user", "content": text}  
        ],  
        temperature=0.3  
    )  
      
    return response.choices[0].message.content  
  
# 使用示例  
result = professional_translate(  
    text="The API endpoint has been deprecated.",  
    source_lang="英文",  
    target_lang="中文",  
    context="技术文档，面向开发者",  
    style="正式、专业",  
    glossary={  
        "API": "API",  
        "endpoint": "端点",  
        "deprecated": "已弃用"  
    }  
)
```

## 高级功能[​](https://docs.weelinking.com/docs/wiki/applications/real-time-translation#高级功能 "高级功能的直接链接")

### 1. 流式翻译[​](https://docs.weelinking.com/docs/wiki/applications/real-time-translation#1-流式翻译 "1. 流式翻译的直接链接")

实时输出翻译结果：

```
def stream_translate(text, target_lang="中文"):  
    stream = client.chat.completions.create(  
        model="gpt-4o-mini",  
        messages=[  
            {  
                "role": "system",  
                "content": f"将文本翻译成{target_lang}。只输出翻译结果。"  
            },  
            {"role": "user", "content": text}  
        ],  
        stream=True  
    )  
      
    for chunk in stream:  
        if chunk.choices[0].delta.content:  
            yield chunk.choices[0].delta.content  
  
# 使用示例  
for char in stream_translate("This is a long document..."):  
    print(char, end="", flush=True)
```

### 2. 批量翻译[​](https://docs.weelinking.com/docs/wiki/applications/real-time-translation#2-批量翻译 "2. 批量翻译的直接链接")

```
import asyncio  
from openai import AsyncOpenAI  
  
async_client = AsyncOpenAI(api_key="your-api-key", base_url="https://api.weelinking.com/v1")  
  
async def translate_batch(texts, target_lang="中文"):  
    async def translate_one(text):  
        response = await async_client.chat.completions.create(  
            model="gpt-4o-mini",  
            messages=[  
                {"role": "system", "content": f"翻译成{target_lang}，只输出结果。"},  
                {"role": "user", "content": text}  
            ]  
        )  
        return response.choices[0].message.content  
      
    tasks = [translate_one(text) for text in texts]  
    return await asyncio.gather(*tasks)  
  
# 使用示例  
texts = ["Hello", "World", "How are you?"]  
results = asyncio.run(translate_batch(texts))
```

### 3. 文档翻译[​](https://docs.weelinking.com/docs/wiki/applications/real-time-translation#3-文档翻译 "3. 文档翻译的直接链接")

保持格式的文档翻译：

```
def translate_document(document, target_lang="中文"):  
    response = client.chat.completions.create(  
        model="gpt-4o",  
        messages=[  
            {  
                "role": "system",  
                "content": f"""你是一位专业的文档翻译专家。  
请将文档翻译成{target_lang}。  
  
要求：  
1. 保持原有的 Markdown 格式  
2. 保持代码块不变  
3. 保持链接格式  
4. 保持标题层级结构"""  
            },  
            {"role": "user", "content": document}  
        ],  
        temperature=0.3  
    )  
    return response.choices[0].message.content
```

### 4. 双语对照[​](https://docs.weelinking.com/docs/wiki/applications/real-time-translation#4-双语对照 "4. 双语对照的直接链接")

```
def bilingual_translate(text, source_lang="英文", target_lang="中文"):  
    response = client.chat.completions.create(  
        model="gpt-4o",  
        messages=[  
            {  
                "role": "system",  
                "content": f"""将{source_lang}文本翻译成{target_lang}，并输出双语对照格式。  
  
格式：  
原文：[原文]  
译文：[译文]  
  
逐段对照输出。"""  
            },  
            {"role": "user", "content": text}  
        ]  
    )  
    return response.choices[0].message.content
```

## 特殊场景处理[​](https://docs.weelinking.com/docs/wiki/applications/real-time-translation#特殊场景处理 "特殊场景处理的直接链接")

### 1. 技术文档翻译[​](https://docs.weelinking.com/docs/wiki/applications/real-time-translation#1-技术文档翻译 "1. 技术文档翻译的直接链接")

```
tech_glossary = {  
    "machine learning": "机器学习",  
    "neural network": "神经网络",  
    "API": "API",  
    "SDK": "SDK",  
    "backend": "后端",  
    "frontend": "前端"  
}  
  
result = professional_translate(  
    text=tech_doc,  
    source_lang="英文",  
    target_lang="中文",  
    context="技术文档",  
    glossary=tech_glossary  
)
```

### 2. 文学翻译[​](https://docs.weelinking.com/docs/wiki/applications/real-time-translation#2-文学翻译 "2. 文学翻译的直接链接")

```
result = professional_translate(  
    text=novel_chapter,  
    source_lang="英文",  
    target_lang="中文",  
    style="文学性强，保持原作风格，人名地名音译"  
)
```

### 3. 商务翻译[​](https://docs.weelinking.com/docs/wiki/applications/real-time-translation#3-商务翻译 "3. 商务翻译的直接链接")

```
result = professional_translate(  
    text=business_email,  
    source_lang="英文",  
    target_lang="中文",  
    style="正式、礼貌、专业，保持商务礼仪"  
)
```

## 质量评估[​](https://docs.weelinking.com/docs/wiki/applications/real-time-translation#质量评估 "质量评估的直接链接")

### 翻译评估提示词[​](https://docs.weelinking.com/docs/wiki/applications/real-time-translation#翻译评估提示词 "翻译评估提示词的直接链接")

```
def evaluate_translation(source, translation, source_lang, target_lang):  
    response = client.chat.completions.create(  
        model="gpt-4o",  
        messages=[  
            {  
                "role": "system",  
                "content": """你是翻译质量评估专家。请从以下维度评分（1-10）：  
1. 准确性：含义是否准确传达  
2. 流畅性：目标语言是否自然  
3. 风格：是否保持原文风格  
4. 术语：专业术语是否正确  
  
返回 JSON 格式：  
{"accuracy": X, "fluency": X, "style": X, "terminology": X, "overall": X, "issues": []}"""  
            },  
            {  
                "role": "user",  
                "content": f"原文（{source_lang}）：\n{source}\n\n译文（{target_lang}）：\n{translation}"  
            }  
        ],  
        response_format={"type": "json_object"}  
    )  
    return json.loads(response.choices[0].message.content)
```

## 最佳实践[​](https://docs.weelinking.com/docs/wiki/applications/real-time-translation#最佳实践 "最佳实践的直接链接")

1. **使用术语表：** 保持专业术语一致
2. **提供上下文：** 帮助模型理解背景
3. **指定风格：** 明确翻译风格要求
4. **分段翻译：** 长文档分段处理
5. **质量检查：** 重要内容人工复核
