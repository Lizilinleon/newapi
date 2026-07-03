---
{
  "title": "GPT-Image-1 图像编辑",
  "source_url": "https://docs.weelinking.com/docs/api-capabilities/image-edit",
  "description": "通过 weelinking 大模型API中转服务调用 GPT-Image-1 进行智能图像编辑",
  "fetched_at": "2026-07-02T06:35:10.055525+00:00"
}
---

# GPT-Image-1 图像编辑

GPT-Image-1 支持对现有图像进行编辑和修改，可以实现局部修改、风格转换等功能。

## 接口地址[​](https://docs.weelinking.com/docs/api-capabilities/image-edit#接口地址 "接口地址的直接链接")

```
POST https://api.weelinking.com/v1/images/edits
```

## 请求参数[​](https://docs.weelinking.com/docs/api-capabilities/image-edit#请求参数 "请求参数的直接链接")

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| model | string | 是 | 固定为 `gpt-image-1` |
| image | file | 是 | 原始图像文件（PNG 格式） |
| prompt | string | 是 | 编辑指令描述 |
| mask | file | 否 | 遮罩图像，指定编辑区域 |
| n | integer | 否 | 生成数量，默认 1 |
| size | string | 否 | 输出尺寸 |

## 使用示例[​](https://docs.weelinking.com/docs/api-capabilities/image-edit#使用示例 "使用示例的直接链接")

### Python[​](https://docs.weelinking.com/docs/api-capabilities/image-edit#python "Python的直接链接")

```
import openai  
  
client = openai.OpenAI(  
    api_key="YOUR_API_KEY",  
    base_url="https://api.weelinking.com/v1"  
)  
  
response = client.images.edit(  
    model="gpt-image-1",  
    image=open("original.png", "rb"),  
    mask=open("mask.png", "rb"),  
    prompt="在空白区域添加一只小猫",  
    n=1,  
    size="1024x1024"  
)  
  
print(response.data[0].url)
```

### cURL[​](https://docs.weelinking.com/docs/api-capabilities/image-edit#curl "cURL的直接链接")

```
curl https://api.weelinking.com/v1/images/edits \  
  -H "Authorization: Bearer YOUR_API_KEY" \  
  -F model="gpt-image-1" \  
  -F image="@original.png" \  
  -F mask="@mask.png" \  
  -F prompt="在空白区域添加一只小猫" \  
  -F n=1 \  
  -F size="1024x1024"
```

## 遮罩图像说明[​](https://docs.weelinking.com/docs/api-capabilities/image-edit#遮罩图像说明 "遮罩图像说明的直接链接")

遮罩图像用于指定要编辑的区域：

- **透明区域**：将被编辑/替换
- **不透明区域**：保持原样

### 创建遮罩[​](https://docs.weelinking.com/docs/api-capabilities/image-edit#创建遮罩 "创建遮罩的直接链接")

```
from PIL import Image  
  
# 创建遮罩图像  
mask = Image.new("RGBA", (1024, 1024), (0, 0, 0, 255))  
  
# 将要编辑的区域设为透明  
pixels = mask.load()  
for x in range(412, 612):  
    for y in range(412, 612):  
        pixels[x, y] = (0, 0, 0, 0)  
  
mask.save("mask.png")
```

## 编辑场景[​](https://docs.weelinking.com/docs/api-capabilities/image-edit#编辑场景 "编辑场景的直接链接")

### 添加元素[​](https://docs.weelinking.com/docs/api-capabilities/image-edit#添加元素 "添加元素的直接链接")

```
prompt: "在桌子上添加一杯咖啡"
```

### 替换元素[​](https://docs.weelinking.com/docs/api-capabilities/image-edit#替换元素 "替换元素的直接链接")

```
prompt: "将红色汽车替换为蓝色汽车"
```

### 移除元素[​](https://docs.weelinking.com/docs/api-capabilities/image-edit#移除元素 "移除元素的直接链接")

```
prompt: "移除背景中的人物，用自然背景填充"
```

## 注意事项[​](https://docs.weelinking.com/docs/api-capabilities/image-edit#注意事项 "注意事项的直接链接")

1. 图像必须是 PNG 格式
2. 遮罩图像尺寸必须与原图相同
3. 提示词应清晰描述期望的编辑结果
