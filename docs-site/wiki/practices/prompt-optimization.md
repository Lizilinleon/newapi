---
title: "提示词优化"
description: "提升大模型输出质量的 Prompt 优化技巧，适用于 ArmNet 字元服务 大模型API中转服务所有模型"
lastUpdated: true
---

# 提示词优化

提示词（Prompt）是与大语言模型交互的关键，优化提示词可以显著提升输出质量、减少 token 消耗、获得更精准的结果。

## 基础原则[​](/wiki/practices/prompt-optimization#基础原则 "基础原则的直接链接")

### 1. 清晰明确[​](/wiki/practices/prompt-optimization#1-清晰明确 "1. 清晰明确的直接链接")

**模糊的提示：**

```
帮我写点东西
```

**清晰的提示：**

```
请写一篇关于人工智能在医疗领域应用的文章，  
字数 800 字左右，面向普通读者，  
语言通俗易懂，包含 3 个具体应用案例。
```

### 2. 提供上下文[​](/wiki/practices/prompt-optimization#2-提供上下文 "2. 提供上下文的直接链接")

```
# 背景信息  
我是一名 Python 后端开发者，正在开发一个电商系统。  
  
# 当前问题  
用户下单后支付失败，但库存已经被扣减了。  
  
# 期望结果  
请提供解决方案，确保库存扣减和支付是原子操作。
```

### 3. 指定输出格式[​](/wiki/practices/prompt-optimization#3-指定输出格式 "3. 指定输出格式的直接链接")

```
请分析以下文本的情感倾向，返回 JSON 格式：  
{  
    "sentiment": "positive/negative/neutral",  
    "confidence": 0.0-1.0,  
    "keywords": ["关键词列表"]  
}
```

## 提示词结构[​](/wiki/practices/prompt-optimization#提示词结构 "提示词结构的直接链接")

### 标准模板[​](/wiki/practices/prompt-optimization#标准模板 "标准模板的直接链接")

```
## 角色  
你是一位 [角色描述]。  
  
## 任务  
[具体任务说明]  
  
## 输入  
[用户提供的内容]  
  
## 输出要求  
- [格式要求]  
- [长度要求]  
- [风格要求]  
  
## 示例（可选）  
输入：[示例输入]  
输出：[示例输出]  
  
## 注意事项  
- [约束条件]  
- [禁止事项]
```

### 实际示例[​](/wiki/practices/prompt-optimization#实际示例 "实际示例的直接链接")

```
system_prompt = """  
## 角色  
你是一位资深的技术文档工程师，擅长将复杂技术概念解释清楚。  
  
## 任务  
根据用户提供的代码，生成清晰的 API 文档。  
  
## 输出要求  
- 使用 Markdown 格式  
- 包含：函数说明、参数列表、返回值、使用示例  
- 语言简洁专业  
  
## 注意事项  
- 不要遗漏任何参数  
- 示例代码必须可运行  
"""
```

## 高级技巧[​](/wiki/practices/prompt-optimization#高级技巧 "高级技巧的直接链接")

### 1. Few-Shot Learning（少样本学习）[​](/wiki/practices/prompt-optimization#1-few-shot-learning少样本学习 "1. Few-Shot Learning（少样本学习）的直接链接")

提供几个示例让模型学习模式：

```
请将产品描述转换为营销文案。  
  
示例 1：  
产品：蓝牙耳机，续航 30 小时，主动降噪  
文案：告别嘈杂，沉浸音乐世界。30 小时超长续航，让美妙音符时刻相伴。  
  
示例 2：  
产品：保温杯，500ml，12 小时保温  
文案：一杯温暖，从晨曦到星夜。500ml 大容量，12 小时锁住温度。  
  
现在请转换：  
产品：机械键盘，青轴，RGB 背光，全键无冲
```

### 2. Chain-of-Thought（思维链）[​](/wiki/practices/prompt-optimization#2-chain-of-thought思维链 "2. Chain-of-Thought（思维链）的直接链接")

让模型展示推理过程：

```
请解决这个问题，展示你的思考步骤：  
  
问题：小明有 15 个苹果，他给了小红 1/3，又吃掉了剩余的 1/5，  
请问他还剩多少个苹果？  
  
请按以下格式回答：  
1. 分析问题  
2. 分步计算  
3. 得出答案
```

### 3. Role Prompting（角色提示）[​](/wiki/practices/prompt-optimization#3-role-prompting角色提示 "3. Role Prompting（角色提示）的直接链接")

赋予模型特定角色：

```
你是一位拥有 20 年经验的首席技术官，  
你正在评估一个技术方案的可行性。  
请从技术可行性、成本效益、风险控制三个角度进行分析。
```

### 4. 分解复杂任务[​](/wiki/practices/prompt-optimization#4-分解复杂任务 "4. 分解复杂任务的直接链接")

将大任务拆分为小步骤：

```
def complex_analysis(document):  
    # 步骤 1：提取关键信息  
    key_info = call_llm(f"从以下文档中提取关键信息：\n{document}")  
      
    # 步骤 2：分析主题  
    themes = call_llm(f"基于以下信息，分析主要主题：\n{key_info}")  
      
    # 步骤 3：生成摘要  
    summary = call_llm(f"基于以下主题，生成 200 字摘要：\n{themes}")  
      
    return summary
```

### 5. 自我验证[​](/wiki/practices/prompt-optimization#5-自我验证 "5. 自我验证的直接链接")

让模型检查自己的输出：

```
请完成以下任务，然后验证你的答案：  
  
任务：[任务描述]  
  
完成后，请：  
1. 检查是否满足所有要求  
2. 如果发现错误，修正后重新输出  
3. 确认最终答案
```

## 针对不同场景的优化[​](/wiki/practices/prompt-optimization#针对不同场景的优化 "针对不同场景的优化的直接链接")

### 代码生成[​](/wiki/practices/prompt-optimization#代码生成 "代码生成的直接链接")

```
使用 Python 3.10+ 编写一个函数，要求：  
  
功能：计算两个日期之间的工作日数量  
输入：start_date (date), end_date (date)  
输出：int (工作日天数)  
  
要求：  
- 排除周末（周六、周日）  
- 使用类型注解  
- 添加 docstring  
- 处理边界情况（开始日期晚于结束日期）
```

### 内容创作[​](/wiki/practices/prompt-optimization#内容创作 "内容创作的直接链接")

```
撰写一篇产品介绍文章：  
  
产品信息：  
- 名称：智能手表 Pro  
- 核心功能：健康监测、运动记录、消息通知  
- 目标用户：25-40 岁的都市白领  
  
写作要求：  
- 标题吸引人  
- 开头引人入胜  
- 使用具体数据和场景  
- 结尾有行动号召  
- 字数 500-800 字
```

### 数据提取[​](/wiki/practices/prompt-optimization#数据提取 "数据提取的直接链接")

```
从以下文本中提取结构化信息：  
  
文本：  
"张三，男，1990 年 3 月 15 日出生，现居北京市朝阳区，  
联系电话 138-1234-5678，邮箱 zhangsan@example.com"  
  
返回 JSON 格式：  
{  
    "name": "",  
    "gender": "",  
    "birthday": "YYYY-MM-DD",  
    "address": "",  
    "phone": "",  
    "email": ""  
}
```

## 避免常见问题[​](/wiki/practices/prompt-optimization#避免常见问题 "避免常见问题的直接链接")

### 1. 避免歧义[​](/wiki/practices/prompt-optimization#1-避免歧义 "1. 避免歧义的直接链接")

```
# 不好  
告诉我关于苹果的信息  
  
# 好  
告诉我关于苹果公司（Apple Inc.）的信息  
# 或  
告诉我关于苹果这种水果的营养信息
```

### 2. 避免过于开放[​](/wiki/practices/prompt-optimization#2-避免过于开放 "2. 避免过于开放的直接链接")

```
# 不好  
写一个故事  
  
# 好  
写一个 500 字的科幻短篇故事，  
主角是一个机器人，  
主题是关于人类与 AI 的共存。
```

### 3. 避免否定指令[​](/wiki/practices/prompt-optimization#3-避免否定指令 "3. 避免否定指令的直接链接")

```
# 不好  
不要写太长  
  
# 好  
请控制在 300 字以内
```

## 提示词模板库[​](/wiki/practices/prompt-optimization#提示词模板库 "提示词模板库的直接链接")

### 翻译[​](/wiki/practices/prompt-optimization#翻译 "翻译的直接链接")

```
你是专业翻译，将 {source_lang} 翻译成 {target_lang}。  
保持原文风格和语气。只输出翻译结果。  
  
原文：{text}
```

### 摘要[​](/wiki/practices/prompt-optimization#摘要 "摘要的直接链接")

```
请为以下内容生成摘要：  
- 长度：{length} 字  
- 风格：{style}  
- 重点：{focus}  
  
内容：{content}
```

### 代码解释[​](/wiki/practices/prompt-optimization#代码解释 "代码解释的直接链接")

```
请解释以下代码的功能：  
- 目标读者：{audience}  
- 解释深度：{depth}  
  
代码：  
```{language}  
{code}
```

```
## 评估与迭代  
  
### A/B 测试  
  
```python  
def test_prompts(prompts, test_cases):  
    results = []  
    for prompt in prompts:  
        scores = []  
        for test in test_cases:  
            output = call_llm(prompt.format(**test["input"]))  
            score = evaluate(output, test["expected"])  
            scores.append(score)  
        results.append({  
            "prompt": prompt,  
            "avg_score": sum(scores) / len(scores)  
        })  
    return sorted(results, key=lambda x: x["avg_score"], reverse=True)
```

### 持续优化[​](/wiki/practices/prompt-optimization#持续优化 "持续优化的直接链接")

1. 收集失败案例
2. 分析失败原因
3. 调整提示词
4. 重新测试
5. 循环迭代

## 最佳实践总结[​](/wiki/practices/prompt-optimization#最佳实践总结 "最佳实践总结的直接链接")

1. **明确目标：** 清楚地说明你想要什么
2. **提供上下文：** 给模型足够的背景信息
3. **使用示例：** Few-shot 可以大幅提升效果
4. **指定格式：** 明确输出格式避免后处理
5. **分解任务：** 复杂任务分步完成
6. **迭代优化：** 根据结果持续改进


---

> 本页内容来自文档知识库整理，已按 ArmNet 字元服务 服务命名统一更新。
