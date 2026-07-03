---
title: "内容审核"
description: "通过 ArmNet 字元服务 大模型API中转服务使用AI进行内容安全审核与检测"
lastUpdated: true
---

# 内容审核

内容审核是指使用 AI 技术自动检测和过滤不当内容，确保用户生成内容（UGC）符合平台规范和法律法规。

## 审核类别[​](/wiki/applications/content-moderation#审核类别 "审核类别的直接链接")

### 常见违规类型[​](/wiki/applications/content-moderation#常见违规类型 "常见违规类型的直接链接")

| 类别 | 说明 | 示例 |
| --- | --- | --- |
| 色情内容 | 露骨的性内容 | 成人内容、软色情 |
| 暴力内容 | 血腥、暴力描述 | 伤害描述、虐待 |
| 仇恨言论 | 歧视、仇恨 | 种族歧视、性别歧视 |
| 骚扰 | 人身攻击 | 辱骂、威胁 |
| 自残 | 自我伤害内容 | 自杀引导 |
| 违法内容 | 违法行为 | 毒品、诈骗 |

## 实现方式[​](/wiki/applications/content-moderation#实现方式 "实现方式的直接链接")

### 1. 使用 OpenAI Moderation API[​](/wiki/applications/content-moderation#1-使用-openai-moderation-api "1. 使用 OpenAI Moderation API的直接链接")

OpenAI 提供免费的内容审核 API：

```
from openai import OpenAI  
  
client = OpenAI(api_key="your-api-key", base_url="http://122.51.35.238:5170/v1")  
  
def moderate_content(text):  
    response = client.moderations.create(  
        model="omni-moderation-latest",  
        input=text  
    )  
      
    result = response.results[0]  
      
    return {  
        "flagged": result.flagged,  
        "categories": {  
            k: v for k, v in result.categories.model_dump().items() if v  
        },  
        "scores": result.category_scores.model_dump()  
    }  
  
# 使用示例  
result = moderate_content("这是一段测试文本")  
if result["flagged"]:  
    print("内容违规:", result["categories"])  
else:  
    print("内容安全")
```

### 2. 使用 LLM 进行内容审核[​](/wiki/applications/content-moderation#2-使用-llm-进行内容审核 "2. 使用 LLM 进行内容审核的直接链接")

更灵活的审核方式：

```
def llm_moderate(content, rules):  
    response = client.chat.completions.create(  
        model="gpt-4o-mini",  
        messages=[  
            {  
                "role": "system",  
                "content": f"""你是一个内容审核专家。请根据以下规则审核内容：  
  
{rules}  
  
返回 JSON 格式：  
{{  
    "safe": true/false,  
    "violations": ["违规类型列表"],  
    "confidence": 0-1的置信度,  
    "reason": "判断理由"  
}}"""  
            },  
            {  
                "role": "user",  
                "content": f"请审核以下内容：\n{content}"  
            }  
        ],  
        response_format={"type": "json_object"}  
    )  
      
    return json.loads(response.choices[0].message.content)
```

### 3. 多层审核系统[​](/wiki/applications/content-moderation#3-多层审核系统 "3. 多层审核系统的直接链接")

```
class ContentModerator:  
    def __init__(self):  
        self.client = OpenAI(api_key="your-api-key", base_url="http://122.51.35.238:5170/v1")  
      
    def moderate(self, content):  
        # 第一层：快速关键词过滤  
        if self.keyword_filter(content):  
            return {"safe": False, "reason": "包含敏感关键词"}  
          
        # 第二层：Moderation API  
        mod_result = self.client.moderations.create(  
            model="omni-moderation-latest",  
            input=content  
        ).results[0]  
          
        if mod_result.flagged:  
            return {"safe": False, "reason": "Moderation API 检测到违规"}  
          
        # 第三层：LLM 深度审核（可选，用于边界情况）  
        if self.needs_deep_review(content):  
            return self.llm_deep_review(content)  
          
        return {"safe": True}  
      
    def keyword_filter(self, content):  
        # 敏感词列表（应该从配置或数据库加载）  
        sensitive_words = ["敏感词1", "敏感词2"]  
        return any(word in content for word in sensitive_words)  
      
    def needs_deep_review(self, content):  
        # 判断是否需要深度审核  
        # 例如：包含特定模式、长度较长等  
        return len(content) > 1000
```

## 图片内容审核[​](/wiki/applications/content-moderation#图片内容审核 "图片内容审核的直接链接")

### 使用多模态模型[​](/wiki/applications/content-moderation#使用多模态模型 "使用多模态模型的直接链接")

```
def moderate_image(image_url):  
    response = client.chat.completions.create(  
        model="gpt-4o",  
        messages=[  
            {  
                "role": "system",  
                "content": """你是一个图片内容审核专家。请检测图片是否包含：  
1. 色情或裸露内容  
2. 暴力或血腥内容  
3. 违法物品  
4. 仇恨符号  
5. 其他不当内容  
  
返回 JSON：{"safe": bool, "issues": []}"""  
            },  
            {  
                "role": "user",  
                "content": [  
                    {"type": "text", "text": "请审核这张图片"},  
                    {"type": "image_url", "image_url": {"url": image_url}}  
                ]  
            }  
        ],  
        response_format={"type": "json_object"}  
    )  
      
    return json.loads(response.choices[0].message.content)
```

## 审核策略[​](/wiki/applications/content-moderation#审核策略 "审核策略的直接链接")

### 1. 分级处理[​](/wiki/applications/content-moderation#1-分级处理 "1. 分级处理的直接链接")

```
def handle_moderation_result(result, content_id):  
    if result["confidence"] > 0.95:  
        # 高置信度违规：直接删除  
        delete_content(content_id)  
        notify_user(content_id, "内容已被删除")  
      
    elif result["confidence"] > 0.7:  
        # 中等置信度：隐藏待人工审核  
        hide_content(content_id)  
        add_to_review_queue(content_id)  
      
    elif result["confidence"] > 0.3:  
        # 低置信度：标记但不处理  
        flag_content(content_id)  
      
    else:  
        # 安全内容  
        pass
```

### 2. 上下文审核[​](/wiki/applications/content-moderation#2-上下文审核 "2. 上下文审核的直接链接")

考虑对话上下文：

```
def moderate_with_context(new_message, conversation_history):  
    full_context = conversation_history + [new_message]  
      
    response = client.chat.completions.create(  
        model="gpt-4o-mini",  
        messages=[  
            {  
                "role": "system",  
                "content": "审核最后一条消息，考虑对话上下文..."  
            },  
            {  
                "role": "user",  
                "content": f"对话历史：\n{format_history(full_context)}"  
            }  
        ]  
    )  
      
    return response.choices[0].message.content
```

## 最佳实践[​](/wiki/applications/content-moderation#最佳实践 "最佳实践的直接链接")

### 1. 多模型组合[​](/wiki/applications/content-moderation#1-多模型组合 "1. 多模型组合的直接链接")

- 快速模型做初筛
- 精确模型做复审
- 人工审核做最终判断

### 2. 持续更新[​](/wiki/applications/content-moderation#2-持续更新 "2. 持续更新的直接链接")

- 收集误判案例
- 定期更新规则
- 监控新型违规内容

### 3. 用户反馈[​](/wiki/applications/content-moderation#3-用户反馈 "3. 用户反馈的直接链接")

- 提供申诉渠道
- 快速响应误判
- 改进审核模型

### 4. 合规考虑[​](/wiki/applications/content-moderation#4-合规考虑 "4. 合规考虑的直接链接")

- 遵守当地法律法规
- 记录审核日志
- 保护用户隐私

## 注意事项[​](/wiki/applications/content-moderation#注意事项 "注意事项的直接链接")

1. **误判处理：** 建立申诉机制
2. **性能优化：** 高并发场景需要缓存和队列
3. **隐私保护：** 审核数据安全存储
4. **持续监控：** 监控审核准确率和延迟


---

> 本页内容来自文档知识库整理，已按 ArmNet 字元服务 服务命名统一更新。
