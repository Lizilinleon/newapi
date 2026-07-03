---
title: "多模态交互"
description: "通过 ArmNet 字元服务 大模型API中转服务处理图像、音频、视频等多模态内容"
lastUpdated: true
---

# 多模态交互

多模态交互是指在与 LLM 交互时，不仅使用文本，还可以输入和输出图像、音频、视频等多种形式的内容。

## 支持的模态[​](/wiki/practices/multimodal-interaction#支持的模态 "支持的模态的直接链接")

### 输入模态[​](/wiki/practices/multimodal-interaction#输入模态 "输入模态的直接链接")

| 模态 | 支持模型 | 常见用途 |
| --- | --- | --- |
| 文本 | 所有模型 | 对话、生成 |
| 图像 | GPT-4o, Claude 3, Gemini | 图像理解、OCR |
| 音频 | GPT-4o, Gemini | 语音识别 |
| 视频 | Gemini | 视频理解 |
| 文件 | Claude, Gemini | 文档分析 |

### 输出模态[​](/wiki/practices/multimodal-interaction#输出模态 "输出模态的直接链接")

| 模态 | 支持模型 | 常见用途 |
| --- | --- | --- |
| 文本 | 所有模型 | 回答、生成 |
| 图像 | DALL-E, FLUX, Midjourney | 图像生成 |
| 音频 | OpenAI TTS | 语音合成 |

## 图像理解[​](/wiki/practices/multimodal-interaction#图像理解 "图像理解的直接链接")

### 基本用法[​](/wiki/practices/multimodal-interaction#基本用法 "基本用法的直接链接")

```
from openai import OpenAI  
  
client = OpenAI(api_key="your-api-key", base_url="http://122.51.35.238:5170/v1")  
  
def analyze_image(image_url, question="请描述这张图片"):  
    response = client.chat.completions.create(  
        model="gpt-4o",  
        messages=[  
            {  
                "role": "user",  
                "content": [  
                    {"type": "text", "text": question},  
                    {  
                        "type": "image_url",  
                        "image_url": {"url": image_url}  
                    }  
                ]  
            }  
        ]  
    )  
    return response.choices[0].message.content  
  
# 使用网络图片  
result = analyze_image("https://example.com/image.jpg", "这张图片里有什么？")
```

### Base64 图片[​](/wiki/practices/multimodal-interaction#base64-图片 "Base64 图片的直接链接")

```
import base64  
  
def encode_image(image_path):  
    with open(image_path, "rb") as f:  
        return base64.standard_b64encode(f.read()).decode("utf-8")  
  
def analyze_local_image(image_path, question):  
    base64_image = encode_image(image_path)  
      
    # 根据文件类型确定 MIME 类型  
    if image_path.endswith(".png"):  
        mime_type = "image/png"  
    elif image_path.endswith(".gif"):  
        mime_type = "image/gif"  
    else:  
        mime_type = "image/jpeg"  
      
    response = client.chat.completions.create(  
        model="gpt-4o",  
        messages=[  
            {  
                "role": "user",  
                "content": [  
                    {"type": "text", "text": question},  
                    {  
                        "type": "image_url",  
                        "image_url": {  
                            "url": f"data:{mime_type};base64,{base64_image}"  
                        }  
                    }  
                ]  
            }  
        ]  
    )  
    return response.choices[0].message.content
```

### 多图分析[​](/wiki/practices/multimodal-interaction#多图分析 "多图分析的直接链接")

```
def compare_images(image_urls, question):  
    content = [{"type": "text", "text": question}]  
      
    for url in image_urls:  
        content.append({  
            "type": "image_url",  
            "image_url": {"url": url}  
        })  
      
    response = client.chat.completions.create(  
        model="gpt-4o",  
        messages=[{"role": "user", "content": content}]  
    )  
    return response.choices[0].message.content  
  
# 比较两张图片  
result = compare_images(  
    ["https://example.com/before.jpg", "https://example.com/after.jpg"],  
    "请对比这两张图片的差异"  
)
```

## 图像理解应用场景[​](/wiki/practices/multimodal-interaction#图像理解应用场景 "图像理解应用场景的直接链接")

### 1. OCR 文字识别[​](/wiki/practices/multimodal-interaction#1-ocr-文字识别 "1. OCR 文字识别的直接链接")

```
def ocr_image(image_url):  
    return analyze_image(  
        image_url,  
        "请识别图片中的所有文字，按原始格式输出"  
    )
```

### 2. 文档/表格分析[​](/wiki/practices/multimodal-interaction#2-文档表格分析 "2. 文档/表格分析的直接链接")

```
def analyze_document(image_url):  
    return analyze_image(  
        image_url,  
        """分析这份文档：  
        1. 文档类型  
        2. 主要内容摘要  
        3. 如果有表格，提取表格数据  
        4. 关键数据和结论"""  
    )
```

### 3. 图表解读[​](/wiki/practices/multimodal-interaction#3-图表解读 "3. 图表解读的直接链接")

```
def interpret_chart(image_url):  
    return analyze_image(  
        image_url,  
        """请解读这个图表：  
        1. 图表类型  
        2. 横纵轴含义  
        3. 数据趋势  
        4. 关键洞察"""  
    )
```

### 4. 代码截图分析[​](/wiki/practices/multimodal-interaction#4-代码截图分析 "4. 代码截图分析的直接链接")

```
def analyze_code_screenshot(image_url):  
    return analyze_image(  
        image_url,  
        """请分析这段代码：  
        1. 识别编程语言  
        2. 解释代码功能  
        3. 指出潜在问题  
        4. 提供改进建议"""  
    )
```

### 5. 产品设计评审[​](/wiki/practices/multimodal-interaction#5-产品设计评审 "5. 产品设计评审的直接链接")

```
def review_ui_design(image_url):  
    return analyze_image(  
        image_url,  
        """作为 UI/UX 专家，请评审这个设计：  
        1. 整体视觉效果  
        2. 用户体验分析  
        3. 可用性问题  
        4. 改进建议"""  
    )
```

## 图像生成[​](/wiki/practices/multimodal-interaction#图像生成 "图像生成的直接链接")

### 使用 DALL-E[​](/wiki/practices/multimodal-interaction#使用-dall-e "使用 DALL-E的直接链接")

```
def generate_image(prompt, size="1024x1024", quality="standard"):  
    response = client.images.generate(  
        model="dall-e-3",  
        prompt=prompt,  
        size=size,  
        quality=quality,  
        n=1  
    )  
    return response.data[0].url  
  
# 生成图片  
image_url = generate_image(  
    "一只可爱的橘猫在阳光下打盹，水彩画风格",  
    size="1024x1024",  
    quality="hd"  
)
```

### 图像编辑[​](/wiki/practices/multimodal-interaction#图像编辑 "图像编辑的直接链接")

```
def edit_image(original_image, mask_image, prompt):  
    with open(original_image, "rb") as img, open(mask_image, "rb") as mask:  
        response = client.images.edit(  
            model="dall-e-2",  
            image=img,  
            mask=mask,  
            prompt=prompt,  
            size="1024x1024"  
        )  
    return response.data[0].url
```

## 音频处理[​](/wiki/practices/multimodal-interaction#音频处理 "音频处理的直接链接")

### 语音转文字（STT）[​](/wiki/practices/multimodal-interaction#语音转文字stt "语音转文字（STT）的直接链接")

```
def transcribe_audio(audio_file):  
    with open(audio_file, "rb") as f:  
        response = client.audio.transcriptions.create(  
            model="whisper-1",  
            file=f,  
            language="zh"  
        )  
    return response.text
```

### 文字转语音（TTS）[​](/wiki/practices/multimodal-interaction#文字转语音tts "文字转语音（TTS）的直接链接")

```
def text_to_speech(text, voice="alloy", output_file="output.mp3"):  
    response = client.audio.speech.create(  
        model="tts-1",  
        voice=voice,  # alloy, echo, fable, onyx, nova, shimmer  
        input=text  
    )  
      
    with open(output_file, "wb") as f:  
        f.write(response.content)  
      
    return output_file
```

## 视频理解[​](/wiki/practices/multimodal-interaction#视频理解 "视频理解的直接链接")

### Gemini 视频分析[​](/wiki/practices/multimodal-interaction#gemini-视频分析 "Gemini 视频分析的直接链接")

```
def analyze_video(video_url, question):  
    # Gemini 支持视频 URL  
    response = client.chat.completions.create(  
        model="gemini-2.5-flash",  
        messages=[  
            {  
                "role": "user",  
                "content": [  
                    {"type": "text", "text": question},  
                    {  
                        "type": "video_url",  
                        "video_url": {"url": video_url}  
                    }  
                ]  
            }  
        ]  
    )  
    return response.choices[0].message.content
```

## 多模态对话[​](/wiki/practices/multimodal-interaction#多模态对话 "多模态对话的直接链接")

### 连续多模态交互[​](/wiki/practices/multimodal-interaction#连续多模态交互 "连续多模态交互的直接链接")

```
class MultimodalChat:  
    def __init__(self):  
        self.messages = []  
      
    def add_text(self, text, role="user"):  
        self.messages.append({  
            "role": role,  
            "content": text  
        })  
      
    def add_image(self, image_url, text=""):  
        content = []  
        if text:  
            content.append({"type": "text", "text": text})  
        content.append({  
            "type": "image_url",  
            "image_url": {"url": image_url}  
        })  
        self.messages.append({  
            "role": "user",  
            "content": content  
        })  
      
    def chat(self, user_input):  
        if isinstance(user_input, str):  
            self.add_text(user_input)  
          
        response = client.chat.completions.create(  
            model="gpt-4o",  
            messages=self.messages  
        )  
          
        assistant_message = response.choices[0].message.content  
        self.add_text(assistant_message, role="assistant")  
          
        return assistant_message  
  
# 使用  
chat = MultimodalChat()  
chat.add_image("https://example.com/chart.png", "这是销售数据图表")  
response = chat.chat("分析这个图表的趋势")  
follow_up = chat.chat("预测下个季度的销售额")
```

## 最佳实践[​](/wiki/practices/multimodal-interaction#最佳实践 "最佳实践的直接链接")

### 1. 图片质量[​](/wiki/practices/multimodal-interaction#1-图片质量 "1. 图片质量的直接链接")

```
# 控制图片细节级别  
{  
    "type": "image_url",  
    "image_url": {  
        "url": image_url,  
        "detail": "high"  # low, high, auto  
    }  
}
```

### 2. 图片压缩[​](/wiki/practices/multimodal-interaction#2-图片压缩 "2. 图片压缩的直接链接")

```
from PIL import Image  
import io  
  
def compress_image(image_path, max_size=1024):  
    img = Image.open(image_path)  
      
    # 调整大小  
    ratio = min(max_size / img.width, max_size / img.height)  
    if ratio < 1:  
        new_size = (int(img.width * ratio), int(img.height * ratio))  
        img = img.resize(new_size)  
      
    # 压缩为 JPEG  
    buffer = io.BytesIO()  
    img.save(buffer, format="JPEG", quality=85)  
      
    return base64.b64encode(buffer.getvalue()).decode()
```

### 3. 成本控制[​](/wiki/practices/multimodal-interaction#3-成本控制 "3. 成本控制的直接链接")

- 使用 `detail: low` 降低 token 消耗
- 压缩图片减少数据量
- 只发送必要的图片区域

### 4. 错误处理[​](/wiki/practices/multimodal-interaction#4-错误处理 "4. 错误处理的直接链接")

```
def safe_analyze_image(image_url, question):  
    try:  
        return analyze_image(image_url, question)  
    except Exception as e:  
        if "invalid_image" in str(e):  
            return "无法处理该图片格式"  
        elif "image_too_large" in str(e):  
            return "图片太大，请压缩后重试"  
        raise
```

## 注意事项[​](/wiki/practices/multimodal-interaction#注意事项 "注意事项的直接链接")

1. **隐私安全：** 不要发送包含敏感信息的图片
2. **版权问题：** 注意图片版权
3. **内容审核：** 某些图片可能被拒绝处理
4. **成本意识：** 图片分析比纯文本更贵


---

> 本页内容来自文档知识库整理，已按 ArmNet 字元服务 服务命名统一更新。
