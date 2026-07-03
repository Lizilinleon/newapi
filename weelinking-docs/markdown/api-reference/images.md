---
{
  "title": "图像生成 API",
  "source_url": "https://docs.weelinking.com/docs/api-reference/images",
  "description": "weelinking Images API 参考文档，通过大模型API中转服务生成和编辑图像",
  "fetched_at": "2026-07-02T06:35:04.021852+00:00"
}
---

# 图像生成 API

Images API 用于生成和编辑图像，支持多种图像模型。

## 图像生成[​](https://docs.weelinking.com/docs/api-reference/images#图像生成 "图像生成的直接链接")

### 接口地址[​](https://docs.weelinking.com/docs/api-reference/images#接口地址 "接口地址的直接链接")

```
POST https://api.weelinking.com/v1/images/generations
```

### 请求参数[​](https://docs.weelinking.com/docs/api-reference/images#请求参数 "请求参数的直接链接")

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| model | string | 是 | 模型名称，如 `dall-e-3`、`gpt-image-1` |
| prompt | string | 是 | 图像描述提示词 |
| n | integer | 否 | 生成图像数量，默认 1 |
| size | string | 否 | 图像尺寸，如 `1024x1024` |
| quality | string | 否 | 图像质量，`standard` 或 `hd` |
| response\_format | string | 否 | 返回格式，`url` 或 `b64_json` |

### 请求示例[​](https://docs.weelinking.com/docs/api-reference/images#请求示例 "请求示例的直接链接")

#### Python[​](https://docs.weelinking.com/docs/api-reference/images#python "Python的直接链接")

```
import openai  
  
client = openai.OpenAI(  
    api_key="YOUR_API_KEY",  
    base_url="https://api.weelinking.com/v1"  
)  
  
response = client.images.generate(  
    model="dall-e-3",  
    prompt="一只可爱的橘猫在阳光下睡觉",  
    size="1024x1024",  
    quality="standard",  
    n=1  
)  
  
print(response.data[0].url)
```

#### cURL[​](https://docs.weelinking.com/docs/api-reference/images#curl "cURL的直接链接")

```
curl https://api.weelinking.com/v1/images/generations \  
  -H "Content-Type: application/json" \  
  -H "Authorization: Bearer YOUR_API_KEY" \  
  -d '{  
    "model": "dall-e-3",  
    "prompt": "一只可爱的橘猫在阳光下睡觉",  
    "size": "1024x1024",  
    "quality": "standard",  
    "n": 1  
  }'
```

### 响应示例[​](https://docs.weelinking.com/docs/api-reference/images#响应示例 "响应示例的直接链接")

```
{  
  "created": 1234567890,  
  "data": [  
    {  
      "url": "https://..."  
    }  
  ]  
}
```

## 图像编辑[​](https://docs.weelinking.com/docs/api-reference/images#图像编辑 "图像编辑的直接链接")

### 接口地址[​](https://docs.weelinking.com/docs/api-reference/images#接口地址-1 "接口地址的直接链接")

```
POST https://api.weelinking.com/v1/images/edits
```

### 请求参数[​](https://docs.weelinking.com/docs/api-reference/images#请求参数-1 "请求参数的直接链接")

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| model | string | 是 | 模型名称 |
| image | file | 是 | 原始图像文件 |
| prompt | string | 是 | 编辑指令 |
| mask | file | 否 | 遮罩图像，指定编辑区域 |
| n | integer | 否 | 生成数量 |
| size | string | 否 | 输出尺寸 |

### 请求示例[​](https://docs.weelinking.com/docs/api-reference/images#请求示例-1 "请求示例的直接链接")

```
response = client.images.edit(  
    model="dall-e-2",  
    image=open("original.png", "rb"),  
    mask=open("mask.png", "rb"),  
    prompt="在空白区域添加一朵向日葵",  
    n=1,  
    size="1024x1024"  
)  
  
print(response.data[0].url)
```

## 支持的模型[​](https://docs.weelinking.com/docs/api-reference/images#支持的模型 "支持的模型的直接链接")

### DALL·E 系列[​](https://docs.weelinking.com/docs/api-reference/images#dalle-系列 "DALL·E 系列的直接链接")

| 模型 | 说明 | 支持尺寸 |
| --- | --- | --- |
| dall-e-3 | 最新版本，质量最高 | 1024x1024, 1792x1024, 1024x1792 |
| dall-e-2 | 支持编辑和变体 | 256x256, 512x512, 1024x1024 |

### GPT-Image-1[​](https://docs.weelinking.com/docs/api-reference/images#gpt-image-1 "GPT-Image-1的直接链接")

| 模型 | 说明 | 支持尺寸 |
| --- | --- | --- |
| gpt-image-1 | OpenAI 最新图像模型 | 1024x1024, 1536x1024, 1024x1536 |

### Flux 系列[​](https://docs.weelinking.com/docs/api-reference/images#flux-系列 "Flux 系列的直接链接")

| 模型 | 说明 | 特点 |
| --- | --- | --- |
| flux-pro | 专业版 | 高质量，多种宽高比 |
| flux-dev | 开发版 | 快速生成 |

### Nano Banana Pro[​](https://docs.weelinking.com/docs/api-reference/images#nano-banana-pro "Nano Banana Pro的直接链接")

| 模型 | 说明 | 特点 |
| --- | --- | --- |
| gemini-3-pro-image-preview | 4K 高清 | 最佳文本渲染，支持局部编辑 |

## 最佳实践[​](https://docs.weelinking.com/docs/api-reference/images#最佳实践 "最佳实践的直接链接")

### 提示词技巧[​](https://docs.weelinking.com/docs/api-reference/images#提示词技巧 "提示词技巧的直接链接")

1. **详细描述**：包含主体、风格、光照、构图等信息
2. **使用修饰词**：如 "高清"、"专业摄影"、"艺术风格" 等
3. **指定风格**：如 "油画风格"、"3D 渲染"、"极简主义" 等

### 示例提示词[​](https://docs.weelinking.com/docs/api-reference/images#示例提示词 "示例提示词的直接链接")

```
一只金色的拉布拉多犬在海滩上奔跑，  
阳光照射下毛发闪闪发光，  
背景是蓝色的大海和天空，  
专业摄影，高清，浅景深
```

## 错误处理[​](https://docs.weelinking.com/docs/api-reference/images#错误处理 "错误处理的直接链接")

| 错误码 | 说明 | 解决方案 |
| --- | --- | --- |
| 400 | 请求参数错误 | 检查提示词和参数格式 |
| 401 | API Key 无效 | 检查认证信息 |
| 429 | 请求过于频繁 | 降低请求频率 |
| 500 | 生成失败 | 修改提示词后重试 |
