---
title: "代码生成"
description: "通过 ArmNet 字元服务 大模型API中转服务使用AI自动生成和优化代码"
lastUpdated: true
---

# 代码生成

代码生成是大语言模型最成功的应用之一，现代 LLM 可以根据自然语言描述生成各种编程语言的代码。

## 核心能力[​](/wiki/applications/code-generation#核心能力 "核心能力的直接链接")

### LLM 可以做什么[​](/wiki/applications/code-generation#llm-可以做什么 "LLM 可以做什么的直接链接")

- **代码生成：** 根据需求描述生成代码
- **代码补全：** 续写未完成的代码
- **代码解释：** 解释代码功能和逻辑
- **代码重构：** 优化代码结构和性能
- **Bug 修复：** 发现并修复代码问题
- **单元测试：** 生成测试用例
- **代码翻译：** 不同语言间转换

## 代码生成技巧[​](/wiki/applications/code-generation#代码生成技巧 "代码生成技巧的直接链接")

### 1. 清晰的需求描述[​](/wiki/applications/code-generation#1-清晰的需求描述 "1. 清晰的需求描述的直接链接")

**不好的描述：**

```
写一个排序函数
```

**好的描述：**

```
用 Python 写一个快速排序函数：  
- 输入：整数列表  
- 输出：升序排列的新列表  
- 要求：原地排序，不使用额外空间  
- 处理边界情况：空列表、单元素列表
```

### 2. 提供上下文[​](/wiki/applications/code-generation#2-提供上下文 "2. 提供上下文的直接链接")

```
# 现有代码  
class UserService:  
    def __init__(self, db):  
        self.db = db  
      
    def get_user(self, user_id):  
        return self.db.query(User).filter_by(id=user_id).first()  
  
# 请求：为这个类添加一个批量获取用户的方法，  
# 使用 IN 查询优化性能，返回字典格式 {user_id: user}
```

### 3. 指定技术栈[​](/wiki/applications/code-generation#3-指定技术栈 "3. 指定技术栈的直接链接")

```
使用 Spring Boot 2.7 + MyBatis Plus 实现用户登录接口：  
- 接收 JSON 格式的用户名和密码  
- 验证密码（使用 BCrypt）  
- 生成 JWT Token  
- 返回统一的 Response 格式
```

## 代码示例[​](/wiki/applications/code-generation#代码示例 "代码示例的直接链接")

### 基础代码生成[​](/wiki/applications/code-generation#基础代码生成 "基础代码生成的直接链接")

```
from openai import OpenAI  
  
client = OpenAI(api_key="your-api-key", base_url="http://122.51.35.238:5170/v1")  
  
def generate_code(requirement, language="python"):  
    response = client.chat.completions.create(  
        model="gpt-4o",  
        messages=[  
            {  
                "role": "system",  
                "content": f"你是一个专业的 {language} 程序员。生成简洁、高效、符合最佳实践的代码。"  
            },  
            {  
                "role": "user",  
                "content": requirement  
            }  
        ],  
        temperature=0  # 代码生成使用低温度  
    )  
    return response.choices[0].message.content  
  
# 使用示例  
code = generate_code("""  
实现一个 LRU 缓存类：  
- 支持 get(key) 和 put(key, value) 操作  
- 容量限制为初始化时指定  
- get 和 put 都应该是 O(1) 时间复杂度  
""")  
print(code)
```

### 代码审查[​](/wiki/applications/code-generation#代码审查 "代码审查的直接链接")

```
def review_code(code):  
    response = client.chat.completions.create(  
        model="gpt-4o",  
        messages=[  
            {  
                "role": "system",  
                "content": """你是一个资深的代码审查专家。请审查代码并指出：  
1. 潜在的 Bug  
2. 性能问题  
3. 代码风格问题  
4. 安全漏洞  
5. 改进建议"""  
            },  
            {  
                "role": "user",  
                "content": f"请审查以下代码：\n```\n{code}\n```"  
            }  
        ]  
    )  
    return response.choices[0].message.content
```

### 单元测试生成[​](/wiki/applications/code-generation#单元测试生成 "单元测试生成的直接链接")

```
def generate_tests(code, framework="pytest"):  
    response = client.chat.completions.create(  
        model="gpt-4o",  
        messages=[  
            {  
                "role": "system",  
                "content": f"你是一个测试专家，使用 {framework} 编写全面的单元测试。"  
            },  
            {  
                "role": "user",  
                "content": f"""为以下代码生成单元测试：  
```python  
{code}
```

要求：

- 覆盖正常情况
- 覆盖边界情况
- 覆盖异常情况
- 使用参数化测试减少重复"""
  }
  ],
  temperature=0
  )
  return response.choices[0].message.content

```
## 最佳实践  
  
### 1. 使用合适的模型  
  
| 场景 | 推荐模型 |  
|------|----------|  
| 复杂算法 | GPT-4o, Claude 3.5 Sonnet |  
| 日常编码 | GPT-4o-mini, DeepSeek-Coder |  
| 代码补全 | Codestral, Qwen-Coder |  
  
### 2. 温度设置  
  
```python  
# 代码生成：低温度，保证一致性  
temperature = 0  
  
# 创意方案：稍高温度  
temperature = 0.3
```

### 3. 迭代优化[​](/wiki/applications/code-generation#3-迭代优化 "3. 迭代优化的直接链接")

```
def iterative_code_generation(requirement, max_iterations=3):  
    code = None  
    for i in range(max_iterations):  
        if code is None:  
            code = generate_code(requirement)  
        else:  
            # 请求优化  
            code = optimize_code(code, "请优化这段代码的性能和可读性")  
          
        # 验证代码  
        issues = review_code(code)  
        if "没有发现问题" in issues:  
            break  
          
        # 根据问题修复  
        code = fix_issues(code, issues)  
      
    return code
```

### 4. 结构化输出[​](/wiki/applications/code-generation#4-结构化输出 "4. 结构化输出的直接链接")

请求特定格式的输出：

```
response = client.chat.completions.create(  
    model="gpt-4o",  
    messages=[  
        {  
            "role": "user",  
            "content": """生成一个 REST API 端点，返回格式：  
{  
    "code": "完整代码",  
    "explanation": "代码解释",  
    "dependencies": ["依赖列表"],  
    "usage_example": "使用示例"  
}"""  
        }  
    ],  
    response_format={"type": "json_object"}  
)
```

## 代码生成的局限[​](/wiki/applications/code-generation#代码生成的局限 "代码生成的局限的直接链接")

### 需要注意[​](/wiki/applications/code-generation#需要注意 "需要注意的直接链接")

1. **验证输出：** 生成的代码可能有 Bug
2. **安全审查：** 检查安全漏洞
3. **版权问题：** 可能生成类似已有代码
4. **依赖管理：** 确认依赖版本兼容

### 不适合的场景[​](/wiki/applications/code-generation#不适合的场景 "不适合的场景的直接链接")

- 极其复杂的系统架构
- 需要深度领域知识的代码
- 安全关键型应用（未经审查）

## 工具推荐[​](/wiki/applications/code-generation#工具推荐 "工具推荐的直接链接")

- **Cursor：** AI 驱动的代码编辑器
- **GitHub Copilot：** 代码补全工具
- **Cline/Roo Code：** VS Code 插件
- **Claude Code：** 终端 AI 编程助手


---

> 本页内容来自文档知识库整理，已按 ArmNet 字元服务 服务命名统一更新。
