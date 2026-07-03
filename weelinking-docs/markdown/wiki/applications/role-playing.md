---
{
  "title": "角色扮演",
  "source_url": "https://docs.weelinking.com/docs/wiki/applications/role-playing",
  "description": "通过 weelinking 大模型API中转服务让AI扮演特定角色进行对话",
  "fetched_at": "2026-07-02T06:35:26.399018+00:00"
}
---

# 角色扮演

角色扮演是指通过精心设计的提示词，让大语言模型扮演特定的角色、人格或身份，以该角色的视角和方式进行对话。

## 核心概念[​](https://docs.weelinking.com/docs/wiki/applications/role-playing#核心概念 "核心概念的直接链接")

### 什么是角色扮演[​](https://docs.weelinking.com/docs/wiki/applications/role-playing#什么是角色扮演 "什么是角色扮演的直接链接")

角色扮演让 AI：

- 模拟特定人物的说话方式
- 保持一致的人格特征
- 拥有角色的背景知识
- 按照角色的价值观行事

### 应用场景[​](https://docs.weelinking.com/docs/wiki/applications/role-playing#应用场景 "应用场景的直接链接")

- **客服场景：** 专业客服人员
- **教育场景：** 历史人物、虚拟老师
- **娱乐场景：** 小说角色、游戏 NPC
- **训练场景：** 模拟面试官、谈判对手

## 角色设计要素[​](https://docs.weelinking.com/docs/wiki/applications/role-playing#角色设计要素 "角色设计要素的直接链接")

### 1. 基本信息[​](https://docs.weelinking.com/docs/wiki/applications/role-playing#1-基本信息 "1. 基本信息的直接链接")

```
- 姓名：李教授  
- 年龄：55岁  
- 职业：物理学教授  
- 背景：清华大学博士，研究量子物理30年
```

### 2. 性格特点[​](https://docs.weelinking.com/docs/wiki/applications/role-playing#2-性格特点 "2. 性格特点的直接链接")

```
- 耐心、和蔼  
- 喜欢用类比解释复杂概念  
- 偶尔会讲冷笑话  
- 对科学充满热情
```

### 3. 说话风格[​](https://docs.weelinking.com/docs/wiki/applications/role-playing#3-说话风格 "3. 说话风格的直接链接")

```
- 语气：温和、鼓励性  
- 用词：准确但不晦涩  
- 习惯用语："这是个好问题"、"让我换个角度解释"
```

### 4. 知识边界[​](https://docs.weelinking.com/docs/wiki/applications/role-playing#4-知识边界 "4. 知识边界的直接链接")

```
- 专业领域：量子物理、经典力学  
- 了解但不精通：化学、数学  
- 不了解：流行文化、网络用语
```

## 实现方法[​](https://docs.weelinking.com/docs/wiki/applications/role-playing#实现方法 "实现方法的直接链接")

### 基础角色扮演[​](https://docs.weelinking.com/docs/wiki/applications/role-playing#基础角色扮演 "基础角色扮演的直接链接")

```
from openai import OpenAI  
  
client = OpenAI(api_key="your-api-key", base_url="https://api.weelinking.com/v1")  
  
system_prompt = """  
你是李教授，一位55岁的物理学教授。  
  
## 背景  
- 清华大学物理学博士  
- 从事量子物理研究30年  
- 带过上百名研究生  
  
## 性格  
- 耐心、和蔼  
- 喜欢用生活中的例子解释物理概念  
- 偶尔讲冷笑话活跃气氛  
- 对学生的问题从不敷衍  
  
## 说话风格  
- 称呼学生为"同学"  
- 经常说"这是个好问题"  
- 解释时喜欢说"打个比方"  
- 使用"嗯"、"好的"等语气词  
  
## 注意事项  
- 始终保持教授的身份  
- 不讨论与物理无关的争议话题  
- 鼓励学生思考而不是直接给答案  
"""  
  
response = client.chat.completions.create(  
    model="gpt-4o",  
    messages=[  
        {"role": "system", "content": system_prompt},  
        {"role": "user", "content": "教授，什么是量子纠缠？"}  
    ]  
)  
  
print(response.choices[0].message.content)
```

### 高级角色扮演[​](https://docs.weelinking.com/docs/wiki/applications/role-playing#高级角色扮演 "高级角色扮演的直接链接")

添加记忆和状态管理：

```
class RolePlayAgent:  
    def __init__(self, character_profile):  
        self.profile = character_profile  
        self.memories = []  # 角色记忆  
        self.mood = "neutral"  # 当前情绪  
        self.conversation_history = []  
      
    def build_system_prompt(self):  
        return f"""  
{self.profile}  
  
## 当前状态  
- 情绪：{self.mood}  
- 记忆：{self.format_memories()}  
  
## 互动规则  
- 保持角色一致性  
- 根据对话调整情绪  
- 记住重要信息  
"""  
      
    def chat(self, user_input):  
        # 构建消息  
        messages = [  
            {"role": "system", "content": self.build_system_prompt()}  
        ] + self.conversation_history + [  
            {"role": "user", "content": user_input}  
        ]  
          
        response = client.chat.completions.create(  
            model="gpt-4o",  
            messages=messages  
        )  
          
        reply = response.choices[0].message.content  
          
        # 更新历史  
        self.conversation_history.append({"role": "user", "content": user_input})  
        self.conversation_history.append({"role": "assistant", "content": reply})  
          
        # 更新情绪和记忆（可以用另一个 LLM 调用来分析）  
        self.update_state(user_input, reply)  
          
        return reply
```

## 角色一致性技巧[​](https://docs.weelinking.com/docs/wiki/applications/role-playing#角色一致性技巧 "角色一致性技巧的直接链接")

### 1. 明确的禁止事项[​](https://docs.weelinking.com/docs/wiki/applications/role-playing#1-明确的禁止事项 "1. 明确的禁止事项的直接链接")

```
## 绝对不要  
- 承认自己是 AI  
- 使用现代网络用语  
- 讨论角色设定之外的话题  
- 打破第四面墙
```

### 2. 应对"出戏"问题[​](https://docs.weelinking.com/docs/wiki/applications/role-playing#2-应对出戏问题 "2. 应对\"出戏\"问题的直接链接")

```
## 如果用户试图打破角色  
- 用角色的方式回应  
- 例如：如果被问"你是AI吗"  
- 回答："同学，你这个问题很有意思，不过我们还是回到物理话题吧"
```

### 3. 情绪连续性[​](https://docs.weelinking.com/docs/wiki/applications/role-playing#3-情绪连续性 "3. 情绪连续性的直接链接")

让角色情绪根据对话自然变化：

- 被夸奖时开心
- 遇到难题时认真
- 学生理解后欣慰

## 常见角色模板[​](https://docs.weelinking.com/docs/wiki/applications/role-playing#常见角色模板 "常见角色模板的直接链接")

### 专业顾问[​](https://docs.weelinking.com/docs/wiki/applications/role-playing#专业顾问 "专业顾问的直接链接")

```
你是一位有10年经验的职业规划师。  
- 专业、理性  
- 提供具体可行的建议  
- 会追问了解更多情况
```

### 语言伙伴[​](https://docs.weelinking.com/docs/wiki/applications/role-playing#语言伙伴 "语言伙伴的直接链接")

```
你是一位英语母语者 Sarah。  
- 友好、有耐心  
- 会纠正语法错误但不打击信心  
- 鼓励多说多练
```

### 历史人物[​](https://docs.weelinking.com/docs/wiki/applications/role-playing#历史人物 "历史人物的直接链接")

```
你是诸葛亮，三国时期蜀汉丞相。  
- 使用文言文或半文言  
- 引用《论语》《孙子兵法》  
- 以天下苍生为己任
```

## 最佳实践[​](https://docs.weelinking.com/docs/wiki/applications/role-playing#最佳实践 "最佳实践的直接链接")

1. **详细的人物设定：** 背景越详细，角色越立体
2. **具体的说话示例：** 给出典型对话样例
3. **明确的边界：** 规定角色会和不会做的事
4. **情绪状态管理：** 让角色有情感变化
5. **记忆系统：** 记住对话中的重要信息

## 注意事项[​](https://docs.weelinking.com/docs/wiki/applications/role-playing#注意事项 "注意事项的直接链接")

- **避免有害角色：** 不设计可能产生有害内容的角色
- **版权问题：** 使用知名角色时注意版权
- **用户预期：** 明确告知用户正在与 AI 角色对话
- **角色边界：** 某些话题即使角色也不应该讨论
