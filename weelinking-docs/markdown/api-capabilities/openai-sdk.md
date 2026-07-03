---
{
  "title": "OpenAI 官方库使用",
  "source_url": "https://docs.weelinking.com/docs/api-capabilities/openai-sdk",
  "description": "使用 OpenAI 官方 SDK 快速接入 weelinking 大模型API中转服务，零成本迁移",
  "fetched_at": "2026-07-02T06:34:33.264589+00:00"
}
---

# OpenAI 官方库使用

weelinking 完全兼容 OpenAI API 标准，您可以直接使用官方提供的 SDK 进行开发，只需修改 `base_url` 和 `api_key`。

## 安装 SDK[​](https://docs.weelinking.com/docs/api-capabilities/openai-sdk#安装-sdk "安装 SDK的直接链接")

### Python[​](https://docs.weelinking.com/docs/api-capabilities/openai-sdk#python "Python的直接链接")

```
pip install openai
```

### Node.js[​](https://docs.weelinking.com/docs/api-capabilities/openai-sdk#nodejs "Node.js的直接链接")

```
npm install openai
```

## 配置与调用[​](https://docs.weelinking.com/docs/api-capabilities/openai-sdk#配置与调用 "配置与调用的直接链接")

### Python 示例[​](https://docs.weelinking.com/docs/api-capabilities/openai-sdk#python-示例 "Python 示例的直接链接")

```
from openai import OpenAI  
  
client = OpenAI(  
    api_key="YOUR_API_KEY",  
    base_url="https://api.weelinking.com/v1"  
)  
  
response = client.chat.completions.create(  
    model="gpt-4o",  
    messages=[{"role": "user", "content": "Hello!"}]  
)  
print(response.choices[0].message.content)
```

### Node.js 示例[​](https://docs.weelinking.com/docs/api-capabilities/openai-sdk#nodejs-示例 "Node.js 示例的直接链接")

```
import OpenAI from "openai";  
  
const openai = new OpenAI({  
    apiKey: "YOUR_API_KEY",  
    baseURL: "https://api.weelinking.com/v1"  
});  
  
async function main() {  
    const completion = await openai.chat.completions.create({  
        messages: [{ role: "user", content: "Hello!" }],  
        model: "gpt-4o",  
    });  
    console.log(completion.choices[0].message.content);  
}  
main();
```

## 支持的高级特性[​](https://docs.weelinking.com/docs/api-capabilities/openai-sdk#支持的高级特性 "支持的高级特性的直接链接")

- **Function Calling**: 完全支持。
- **Image Input**: 支持 GPT-4o 等多模态模型。
- **Embeddings**: 支持文本向量化。
- **Streaming**: 支持流式输出。
