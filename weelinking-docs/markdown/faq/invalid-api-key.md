---
{
  "title": "为什么提示 API Key 无效？",
  "source_url": "https://docs.weelinking.com/docs/faq/invalid-api-key",
  "description": "weelinking 大模型API中转服务中 API Key 无效的常见原因和解决方法",
  "fetched_at": "2026-07-02T06:34:29.563200+00:00"
}
---

# 为什么提示 API Key 无效？

当您在使用 API 时遇到 "Invalid API Key" 或 "Authentication failed" 错误，通常不是 key 本身的问题，而是 Base URL 配置不匹配。

## 常见原因[​](https://docs.weelinking.com/docs/faq/invalid-api-key#常见原因 "常见原因的直接链接")

### 1. Base URL 未配置或配置错误[​](https://docs.weelinking.com/docs/faq/invalid-api-key#1-base-url-未配置或配置错误 "1. Base URL 未配置或配置错误的直接链接")

这是最常见的原因。如果您使用了 weelinking 的 API Key，必须配合 weelinking 的 Base URL 使用。

**错误示例：**
使用了 weelinking 的 Key (`sk-...`)，但请求发往了 OpenAI 官方地址 (`https://api.openai.com/v1`)。

**正确配置：**

- **Base URL:** `https://api.weelinking.com/v1`

### 2. 客户端默认设置[​](https://docs.weelinking.com/docs/faq/invalid-api-key#2-客户端默认设置 "2. 客户端默认设置的直接链接")

很多开源软件（如 LangChain, OpenAI Python SDK）默认连接官方服务器。您需要显式指定 `base_url` 参数。

## 解决方法[​](https://docs.weelinking.com/docs/faq/invalid-api-key#解决方法 "解决方法的直接链接")

### 代码中修改[​](https://docs.weelinking.com/docs/faq/invalid-api-key#代码中修改 "代码中修改的直接链接")

**Python (OpenAI SDK):**

```
from openai import OpenAI  
  
client = OpenAI(  
    api_key="your-weelinking-key",  
    base_url="https://api.weelinking.com/v1"  # 必须指定  
)
```

**Node.js:**

```
const OpenAI = require('openai');  
  
const client = new OpenAI({  
  apiKey: 'your-weelinking-key',  
  baseURL: 'https://api.weelinking.com/v1' // 必须指定  
});
```

### 环境变量修改[​](https://docs.weelinking.com/docs/faq/invalid-api-key#环境变量修改 "环境变量修改的直接链接")

如果您无法修改代码，可以设置环境变量：

```
export OPENAI_API_BASE="https://api.weelinking.com/v1"
```

### 快速测试[​](https://docs.weelinking.com/docs/faq/invalid-api-key#快速测试 "快速测试的直接链接")

使用 curl 命令测试您的 key 是否有效：

```
curl https://api.weelinking.com/v1/models \  
  -H "Authorization: Bearer sk-your-key-here"
```

如果此命令返回模型列表，说明 key 是有效的，问题在于您的软件配置。
