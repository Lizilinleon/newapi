---
title: "Nano Banana 图像编辑"
description: "通过 ArmNet 字元服务 大模型API中转服务调用 Nano Banana Pro 进行高级图像编辑"
lastUpdated: true
---

# Nano Banana 图像编辑

Nano Banana Pro 提供强大的图像编辑能力，支持局部编辑、角度调整、焦点控制、色彩调整等高级功能。

## 功能特点[​](/api-capabilities/nano-banana-image-edit#功能特点 "功能特点的直接链接")

- **局部编辑**：精确控制编辑区域
- **角度调整**：改变图像视角和角度
- **焦点控制**：调整景深和焦点位置
- **色彩调整**：修改色调、饱和度、亮度
- **光照调整**：改变光源方向和强度

## 接口地址[​](/api-capabilities/nano-banana-image-edit#接口地址 "接口地址的直接链接")

```
POST http://122.51.35.238:5170/v1/images/edits
```

## 请求参数[​](/api-capabilities/nano-banana-image-edit#请求参数 "请求参数的直接链接")

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| model | string | 是 | `gemini-3-pro-image-preview` |
| image | string/file | 是 | 原始图像（URL 或 base64） |
| prompt | string | 是 | 编辑指令 |
| mask | string/file | 否 | 遮罩图像 |

## 使用示例[​](/api-capabilities/nano-banana-image-edit#使用示例 "使用示例的直接链接")

### Python[​](/api-capabilities/nano-banana-image-edit#python "Python的直接链接")

```
import openai  
import base64  
  
client = openai.OpenAI(  
    api_key="YOUR_API_KEY",  
    base_url="http://122.51.35.238:5170/v1"  
)  
  
# 读取图像并转为 base64  
with open("original.png", "rb") as f:  
    image_data = base64.b64encode(f.read()).decode()  
  
response = client.images.edit(  
    model="gemini-3-pro-image-preview",  
    image=f"data:image/png;base64,{image_data}",  
    prompt="将背景改为海滩场景，保持人物不变"  
)  
  
print(response.data[0].url)
```

## 编辑类型[​](/api-capabilities/nano-banana-image-edit#编辑类型 "编辑类型的直接链接")

### 局部编辑[​](/api-capabilities/nano-banana-image-edit#局部编辑 "局部编辑的直接链接")

```
prompt: "将人物的衣服颜色改为红色"  
prompt: "给人物添加一顶帽子"
```

### 风格转换[​](/api-capabilities/nano-banana-image-edit#风格转换 "风格转换的直接链接")

```
prompt: "转换为水彩画风格"  
prompt: "添加复古滤镜效果"
```

### 场景修改[​](/api-capabilities/nano-banana-image-edit#场景修改 "场景修改的直接链接")

```
prompt: "将白天场景改为夜晚"  
prompt: "添加下雪效果"
```

## 最佳实践[​](/api-capabilities/nano-banana-image-edit#最佳实践 "最佳实践的直接链接")

1. **清晰的指令**：明确描述期望的编辑结果
2. **合适的图像**：使用高质量的原始图像
3. **精确的遮罩**：需要局部编辑时使用遮罩
4. **分步操作**：复杂编辑拆分为多个步骤


---

> 本页内容来自文档知识库整理，已按 ArmNet 字元服务 服务命名统一更新。
