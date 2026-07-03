---
{
  "title": "DeepSeek 模型",
  "source_url": "https://docs.weelinking.com/docs/wiki/models/deepseek-model",
  "description": "DeepSeek 模型介绍，可通过 weelinking 大模型API中转服务便捷调用",
  "fetched_at": "2026-07-02T06:35:13.822011+00:00"
}
---

# DeepSeek 模型

DeepSeek 是由中国深度求索公司开发的大语言模型，以极高的性价比和出色的代码能力在全球 AI 领域引起轰动。

## 发展历程[​](https://docs.weelinking.com/docs/wiki/models/deepseek-model#发展历程 "发展历程的直接链接")

| 版本 | 发布时间 | 主要特点 |
| --- | --- | --- |
| DeepSeek-Coder | 2023年11月 | 专注代码生成 |
| DeepSeek-V2 | 2024年5月 | MoE 架构，大幅降本 |
| DeepSeek-V2.5 | 2024年9月 | 通用与代码能力融合 |
| DeepSeek-V3 | 2024年12月 | 671B 参数，性能爆发 |
| DeepSeek-R1 | 2025年1月 | 推理能力超越 o1 |

## 核心特点[​](https://docs.weelinking.com/docs/wiki/models/deepseek-model#核心特点 "核心特点的直接链接")

### 1. 极致性价比[​](https://docs.weelinking.com/docs/wiki/models/deepseek-model#1-极致性价比 "1. 极致性价比的直接链接")

DeepSeek 的定价策略颠覆行业：

- API 价格仅为 GPT-4 的 1/10 甚至更低
- 开源模型权重，支持自主部署
- MoE 架构大幅降低推理成本

### 2. MoE（混合专家）架构[​](https://docs.weelinking.com/docs/wiki/models/deepseek-model#2-moe混合专家架构 "2. MoE（混合专家）架构的直接链接")

DeepSeek-V2+ 采用创新的 MoE 架构：

- 671B 总参数，37B 激活参数
- 每次推理只激活部分专家网络
- 更快的响应速度，更低的成本

### 3. 强大的代码能力[​](https://docs.weelinking.com/docs/wiki/models/deepseek-model#3-强大的代码能力 "3. 强大的代码能力的直接链接")

DeepSeek 在代码生成方面表现卓越：

- 多语言代码生成
- 代码补全和重构
- 代码解释和文档生成

## 当前主力模型[​](https://docs.weelinking.com/docs/wiki/models/deepseek-model#当前主力模型 "当前主力模型的直接链接")

### DeepSeek-R1[​](https://docs.weelinking.com/docs/wiki/models/deepseek-model#deepseek-r1 "DeepSeek-R1的直接链接")

- **模型 ID：** `deepseek-r1`
- **上下文窗口：** 128K tokens
- **特点：** 深度推理能力，超越 o1
- **适用场景：** 数学推理、复杂问题求解

### DeepSeek-V3[​](https://docs.weelinking.com/docs/wiki/models/deepseek-model#deepseek-v3 "DeepSeek-V3的直接链接")

- **模型 ID：** `deepseek-v3`
- **上下文窗口：** 128K tokens
- **特点：** 综合能力强，性价比极高
- **适用场景：** 通用对话、代码生成、内容创作

### DeepSeek-Coder-V2[​](https://docs.weelinking.com/docs/wiki/models/deepseek-model#deepseek-coder-v2 "DeepSeek-Coder-V2的直接链接")

- **模型 ID：** `deepseek-coder-v2`
- **上下文窗口：** 128K tokens
- **特点：** 代码专精，支持 300+ 编程语言
- **适用场景：** 编程开发、代码审查

## API 调用示例[​](https://docs.weelinking.com/docs/wiki/models/deepseek-model#api-调用示例 "API 调用示例的直接链接")

```
from openai import OpenAI  
  
client = OpenAI(  
    api_key="your-api-key",  
    base_url="https://api.weelinking.com/v1"  
)  
  
response = client.chat.completions.create(  
    model="deepseek-v3",  
    messages=[  
        {"role": "system", "content": "你是一个专业的程序员。"},  
        {"role": "user", "content": "用 Python 实现快速排序算法"}  
    ],  
    temperature=0  
)  
  
print(response.choices[0].message.content)
```

### 推理模型调用[​](https://docs.weelinking.com/docs/wiki/models/deepseek-model#推理模型调用 "推理模型调用的直接链接")

```
# DeepSeek-R1 推理模型  
response = client.chat.completions.create(  
    model="deepseek-r1",  
    messages=[  
        {"role": "user", "content": "证明 √2 是无理数"}  
    ],  
    temperature=0  
)
```

## DeepSeek 的独特能力[​](https://docs.weelinking.com/docs/wiki/models/deepseek-model#deepseek-的独特能力 "DeepSeek 的独特能力的直接链接")

### 1. 深度思考（R1）[​](https://docs.weelinking.com/docs/wiki/models/deepseek-model#1-深度思考r1 "1. 深度思考（R1）的直接链接")

DeepSeek-R1 具有类似 o1 的推理能力：

- 内置思维链推理
- 自我反思和验证
- 复杂数学和逻辑问题

### 2. 多语言代码支持[​](https://docs.weelinking.com/docs/wiki/models/deepseek-model#2-多语言代码支持 "2. 多语言代码支持的直接链接")

支持超过 300 种编程语言：

- 主流语言（Python、Java、C++、Go）
- 前端技术（JavaScript、TypeScript、React）
- 系统语言（Rust、Zig）
- 脚本语言（Shell、PowerShell）

### 3. 长上下文代码理解[​](https://docs.weelinking.com/docs/wiki/models/deepseek-model#3-长上下文代码理解 "3. 长上下文代码理解的直接链接")

- 分析大型代码库
- 跨文件代码理解
- 项目级代码重构

## 与其他模型对比[​](https://docs.weelinking.com/docs/wiki/models/deepseek-model#与其他模型对比 "与其他模型对比的直接链接")

| 特性 | DeepSeek-V3 | GPT-4o | Claude 3.5 |
| --- | --- | --- | --- |
| 价格 | 极低 | 中等 | 中等 |
| 代码能力 | 极强 | 极强 | 极强 |
| 推理能力 | 强 | 强 | 强 |
| 开源 | ✅ | ❌ | ❌ |
| 中文能力 | 极强 | 强 | 强 |

## 最佳实践[​](https://docs.weelinking.com/docs/wiki/models/deepseek-model#最佳实践 "最佳实践的直接链接")

1. **代码任务首选：** DeepSeek 在代码生成方面性价比最高
2. **复杂推理用 R1：** 数学、逻辑问题使用 DeepSeek-R1
3. **本地部署：** 开源权重支持企业私有化部署
4. **中文场景：** 中文理解和生成能力出色
