---
title: "快速开始"
description: "只需简单三步，即可开始使用 ArmNet 字元服务 大模型API中转服务访问各种AI模型"
lastUpdated: true
---

# 快速开始

## 第一步：账户准备[​](/getting-started#第一步账户准备 "第一步：账户准备的直接链接")

### 1.1 注册账号[​](/getting-started#11-注册账号 "1.1 注册账号的直接链接")

1. 访问 [ArmNet 字元服务官网](http://122.51.35.238:5170)。
2. **注册账号**：使用微信或github注册登录。
3. 登录个人中心。

### 1.2 账户充值[​](/getting-started#12-账户充值 "1.2 账户充值的直接链接")

在个人中心进行充值：

1. 点击”充值”菜单。
2. 选择充值金额（最低1 元起）。
3. 完成支付（支持支付宝、微信）。
4. 新用户首次充值可获得额外赠送，充值后余额立即到账。

## 第二步：创建API 密钥[​](/getting-started#第二步创建api-密钥 "第二步：创建API 密钥的直接链接")

### 2.1 生成密钥[​](/getting-started#21-生成密钥 "2.1 生成密钥的直接链接")

1. 在后台导航点击”秘钥管理”栏目。
2. 点击【创建密钥】，注意要查看选择的模型分组，不同分组支持的模型会有差异。
3. 复制秘钥，待下一步使用。

## 第三步：开始调用[​](/getting-started#第三步开始调用 "第三步：开始调用的直接链接")

### 3.1 获取接入信息[​](/getting-started#31-获取接入信息 "3.1 获取接入信息的直接链接")

- **API 地址 (Base\_Url)**: `http://122.51.35.238:5170`
- **API 密钥**: 您刚创建的密钥
- **请求格式**: 完全兼容OpenAI API，兼容OpenAI 格式调用。

### 3.2 测试调用[​](/getting-started#32-测试调用 "3.2 测试调用的直接链接")

使用 `curl` 快速测试：

```
curl http://122.51.35.238:5170/v1/chat/completions \  
  -H "Content-Type: application/json" \  
  -H "Authorization: Bearer YOUR_API_KEY" \  
  -d '{  
    "model": "gpt-4.1-mini",  
    "messages": [{"role": "user", "content": "Hello!"}]  
  }'
```

### 3.3 代码示例[​](/getting-started#33-代码示例 "3.3 代码示例的直接链接")

#### Python[​](/getting-started#python "Python的直接链接")

```
from openai import OpenAI  
  
client = OpenAI(  
    api_key="YOUR_API_KEY",  
    base_url="http://122.51.35.238:5170/v1"  
)  
  
response = client.chat.completions.create(  
    model="gpt-4.1-mini",  
    messages=[  
        {"role": "user", "content": "Hello!"}  
    ]  
)  
  
print(response.choices[0].message.content)
```

## 下一步[​](/getting-started#下一步 "下一步的直接链接")

恭喜！您已经成功完成了ArmNet 字元服务的接入。接下来您可以：

- **查看API 文档**：了解完整的API 接口说明
- **探索模型列表**：查看所有支持的AI 模型
- **集成到应用**：将ArmNet 字元服务集成到各种工具
- **查看使用统计**：在个人中心监控使用情况

## 常见问题[​](/getting-started#常见问题 "常见问题的直接链接")

### 如何切换模型？[​](/getting-started#如何切换模型 "如何切换模型？的直接链接")

只需修改请求中的 `model` 参数：

```
# 使用 GPT-4.1  
curl http://122.51.35.238:5170/v1/chat/completions \  
  -H "Authorization: Bearer YOUR_API_KEY" \  
  -d '{"model": "gpt-4.1", "messages": [{"role": "user", "content": "Hello"}]}'  
  
# 使用 Claude 4 Sonnet  
curl http://122.51.35.238:5170/v1/chat/completions \  
  -H "Authorization: Bearer YOUR_API_KEY" \  
  -d '{"model": "claude-sonnet-4-20250514", "messages": [{"role": "user", "content": "Hello"}]}'  
  
# 使用 Gemini 2.5 Pro  
curl http://122.51.35.238:5170/v1/chat/completions \  
  -H "Authorization: Bearer YOUR_API_KEY" \  
  -d '{"model": "gemini-2.5-pro", "messages": [{"role": "user", "content": "Hello"}]}'
```

### 支持哪些编程语言？[​](/getting-started#支持哪些编程语言 "支持哪些编程语言？的直接链接")

ArmNet 字元服务兼容OpenAI API 标准，支持所有OpenAI SDK 支持的语言：

- Python
- JavaScript/TypeScript
- Java
- C#/.NET
- Go
- Ruby
- PHP
- 更多…

### 如何查看余额？[​](/getting-started#如何查看余额 "如何查看余额？的直接链接")

登录个人中心即可查看：

- 账户余额
- 使用记录
- 消费统计

### 遇到问题怎么办？[​](/getting-started#遇到问题怎么办 "遇到问题怎么办？的直接链接")

- 查看API 文档
- 检查常见错误
- 联系客服：[kefu001@jiafengnet.cn](mailto:kefu001@jiafengnet.cn)

> **提示**：保存好您的API 密钥，并定期在控制台查看使用日志，每笔请求都有消息历史，合理优化成本。


---

> 本页内容来自文档知识库整理，已按 ArmNet 字元服务 服务命名统一更新。
