---
title: "Hugging Face"
description: "Hugging Face 开源AI平台介绍，可与 ArmNet 字元服务 大模型API中转服务搭配使用"
lastUpdated: true
---

# Hugging Face

Hugging Face 是全球最大的 AI 开源社区和模型托管平台，提供海量预训练模型、数据集和开发工具。

## 平台概述[​](/wiki/tools/hugging-face#平台概述 "平台概述的直接链接")

### 核心产品[​](/wiki/tools/hugging-face#核心产品 "核心产品的直接链接")

| 产品 | 说明 |
| --- | --- |
| Hub | 模型、数据集、Spaces 托管 |
| Transformers | 预训练模型库 |
| Datasets | 数据集库 |
| Tokenizers | 高性能分词器 |
| Accelerate | 分布式训练工具 |
| PEFT | 参数高效微调 |
| Spaces | 模型演示部署 |
| Inference API | 推理服务 |

### 为什么重要[​](/wiki/tools/hugging-face#为什么重要 "为什么重要的直接链接")

- **模型仓库：** 50万+ 开源模型
- **数据集：** 10万+ 开源数据集
- **社区：** 活跃的开源 AI 社区
- **工具链：** 完整的 ML 开发工具

## Transformers 库[​](/wiki/tools/hugging-face#transformers-库 "Transformers 库的直接链接")

### 安装[​](/wiki/tools/hugging-face#安装 "安装的直接链接")

```
pip install transformers torch
```

### 快速开始[​](/wiki/tools/hugging-face#快速开始 "快速开始的直接链接")

```
from transformers import pipeline  
  
# 文本生成  
generator = pipeline("text-generation", model="gpt2")  
result = generator("Hello, I'm a language model,", max_length=50)  
print(result[0]["generated_text"])  
  
# 情感分析  
classifier = pipeline("sentiment-analysis")  
result = classifier("I love this product!")  
print(result)  # [{'label': 'POSITIVE', 'score': 0.9998}]  
  
# 问答  
qa = pipeline("question-answering")  
result = qa(  
    question="What is the capital of France?",  
    context="France is a country in Europe. Paris is the capital of France."  
)  
print(result)  # {'answer': 'Paris', 'score': 0.9998}
```

### 加载模型[​](/wiki/tools/hugging-face#加载模型 "加载模型的直接链接")

```
from transformers import AutoTokenizer, AutoModelForCausalLM  
  
# 加载 tokenizer 和模型  
model_name = "meta-llama/Llama-2-7b-chat-hf"  
  
tokenizer = AutoTokenizer.from_pretrained(model_name)  
model = AutoModelForCausalLM.from_pretrained(  
    model_name,  
    torch_dtype="auto",  
    device_map="auto"  
)  
  
# 生成文本  
inputs = tokenizer("Hello, how are you?", return_tensors="pt")  
outputs = model.generate(**inputs, max_new_tokens=50)  
response = tokenizer.decode(outputs[0], skip_special_tokens=True)
```

### 常用 Pipeline[​](/wiki/tools/hugging-face#常用-pipeline "常用 Pipeline的直接链接")

```
# 文本分类  
classifier = pipeline("text-classification", model="bert-base-chinese")  
  
# 命名实体识别  
ner = pipeline("ner", model="bert-base-chinese")  
  
# 文本摘要  
summarizer = pipeline("summarization", model="facebook/bart-large-cnn")  
  
# 翻译  
translator = pipeline("translation_en_to_zh", model="Helsinki-NLP/opus-mt-en-zh")  
  
# 填空  
fill_mask = pipeline("fill-mask", model="bert-base-chinese")  
  
# 图像分类  
image_classifier = pipeline("image-classification", model="google/vit-base-patch16-224")  
  
# 语音识别  
asr = pipeline("automatic-speech-recognition", model="openai/whisper-base")
```

## Embeddings 模型[​](/wiki/tools/hugging-face#embeddings-模型 "Embeddings 模型的直接链接")

### 使用 Sentence Transformers[​](/wiki/tools/hugging-face#使用-sentence-transformers "使用 Sentence Transformers的直接链接")

```
from sentence_transformers import SentenceTransformer  
  
# 加载嵌入模型  
model = SentenceTransformer("BAAI/bge-m3")  
  
# 生成嵌入  
sentences = ["这是一个测试句子", "另一个句子"]  
embeddings = model.encode(sentences)  
  
# 计算相似度  
from sentence_transformers.util import cos_sim  
similarity = cos_sim(embeddings[0], embeddings[1])
```

### 常用嵌入模型[​](/wiki/tools/hugging-face#常用嵌入模型 "常用嵌入模型的直接链接")

| 模型 | 语言 | 维度 | 特点 |
| --- | --- | --- | --- |
| BAAI/bge-m3 | 多语言 | 1024 | 多功能、高质量 |
| BAAI/bge-large-zh-v1.5 | 中文 | 1024 | 中文优化 |
| sentence-transformers/all-MiniLM-L6-v2 | 英文 | 384 | 轻量快速 |
| intfloat/multilingual-e5-large | 多语言 | 1024 | 多语言效果好 |

## 数据集[​](/wiki/tools/hugging-face#数据集 "数据集的直接链接")

### 加载数据集[​](/wiki/tools/hugging-face#加载数据集 "加载数据集的直接链接")

```
from datasets import load_dataset  
  
# 加载公开数据集  
dataset = load_dataset("wikitext", "wikitext-2-raw-v1")  
print(dataset)  
  
# 加载中文数据集  
dataset = load_dataset("wangrui6/Zhihu-KOL")  
  
# 加载本地数据  
dataset = load_dataset("json", data_files="data.json")  
dataset = load_dataset("csv", data_files="data.csv")  
  
# 数据集操作  
train_dataset = dataset["train"]  
print(train_dataset[0])  # 第一条数据  
print(len(train_dataset))  # 数据量
```

### 数据处理[​](/wiki/tools/hugging-face#数据处理 "数据处理的直接链接")

```
# 映射函数  
def tokenize_function(examples):  
    return tokenizer(examples["text"], truncation=True, padding="max_length")  
  
tokenized_dataset = dataset.map(tokenize_function, batched=True)  
  
# 过滤  
filtered = dataset.filter(lambda x: len(x["text"]) > 100)  
  
# 选择列  
selected = dataset.select_columns(["text", "label"])  
  
# 打乱  
shuffled = dataset.shuffle(seed=42)  
  
# 分割  
split = dataset.train_test_split(test_size=0.1)
```

## 模型微调[​](/wiki/tools/hugging-face#模型微调 "模型微调的直接链接")

### 使用 Trainer[​](/wiki/tools/hugging-face#使用-trainer "使用 Trainer的直接链接")

```
from transformers import (  
    AutoModelForSequenceClassification,  
    AutoTokenizer,  
    TrainingArguments,  
    Trainer  
)  
  
# 加载模型和数据  
model = AutoModelForSequenceClassification.from_pretrained(  
    "bert-base-chinese",  
    num_labels=2  
)  
tokenizer = AutoTokenizer.from_pretrained("bert-base-chinese")  
  
# 训练参数  
training_args = TrainingArguments(  
    output_dir="./results",  
    num_train_epochs=3,  
    per_device_train_batch_size=16,  
    per_device_eval_batch_size=16,  
    warmup_steps=500,  
    weight_decay=0.01,  
    logging_dir="./logs",  
    logging_steps=10,  
    evaluation_strategy="epoch",  
    save_strategy="epoch",  
    load_best_model_at_end=True,  
)  
  
# 创建 Trainer  
trainer = Trainer(  
    model=model,  
    args=training_args,  
    train_dataset=train_dataset,  
    eval_dataset=eval_dataset,  
)  
  
# 开始训练  
trainer.train()  
  
# 保存模型  
trainer.save_model("./my_model")
```

### PEFT 微调[​](/wiki/tools/hugging-face#peft-微调 "PEFT 微调的直接链接")

```
from peft import LoraConfig, get_peft_model, TaskType  
  
# LoRA 配置  
lora_config = LoraConfig(  
    task_type=TaskType.CAUSAL_LM,  
    r=8,  
    lora_alpha=32,  
    lora_dropout=0.1,  
    target_modules=["q_proj", "v_proj"]  
)  
  
# 应用 LoRA  
model = get_peft_model(model, lora_config)  
model.print_trainable_parameters()  
# trainable params: 4,194,304 || all params: 6,742,609,920 || trainable%: 0.0622
```

## Inference API[​](/wiki/tools/hugging-face#inference-api "Inference API的直接链接")

### 使用 API[​](/wiki/tools/hugging-face#使用-api "使用 API的直接链接")

```
import requests  
  
API_URL = "https://api-inference.huggingface.co/models/gpt2"  
headers = {"Authorization": f"Bearer {HF_TOKEN}"}  
  
def query(payload):  
    response = requests.post(API_URL, headers=headers, json=payload)  
    return response.json()  
  
output = query({"inputs": "Hello, I'm a language model,"})
```

### 使用 huggingface\_hub[​](/wiki/tools/hugging-face#使用-huggingface_hub "使用 huggingface_hub的直接链接")

```
from huggingface_hub import InferenceClient  
  
client = InferenceClient(token="your-token")  
  
# 文本生成  
response = client.text_generation(  
    "Hello, how are you?",  
    model="meta-llama/Llama-2-7b-chat-hf",  
    max_new_tokens=100  
)  
  
# 对话  
response = client.chat_completion(  
    messages=[{"role": "user", "content": "Hello!"}],  
    model="meta-llama/Llama-2-7b-chat-hf"  
)
```

## Spaces 部署[​](/wiki/tools/hugging-face#spaces-部署 "Spaces 部署的直接链接")

### Gradio 示例[​](/wiki/tools/hugging-face#gradio-示例 "Gradio 示例的直接链接")

```
import gradio as gr  
from transformers import pipeline  
  
# 加载模型  
classifier = pipeline("sentiment-analysis")  
  
def predict(text):  
    result = classifier(text)[0]  
    return f"{result['label']}: {result['score']:.4f}"  
  
# 创建界面  
demo = gr.Interface(  
    fn=predict,  
    inputs=gr.Textbox(label="输入文本"),  
    outputs=gr.Textbox(label="情感分析结果"),  
    title="情感分析演示"  
)  
  
demo.launch()
```

## 本地部署[​](/wiki/tools/hugging-face#本地部署 "本地部署的直接链接")

### 使用 vLLM[​](/wiki/tools/hugging-face#使用-vllm "使用 vLLM的直接链接")

```
pip install vllm
```

```
from vllm import LLM, SamplingParams  
  
llm = LLM(model="meta-llama/Llama-2-7b-chat-hf")  
sampling_params = SamplingParams(temperature=0.7, max_tokens=256)  
  
prompts = ["Hello, my name is"]  
outputs = llm.generate(prompts, sampling_params)
```

### 使用 Text Generation Inference[​](/wiki/tools/hugging-face#使用-text-generation-inference "使用 Text Generation Inference的直接链接")

```
# Docker 部署  
docker run --gpus all --shm-size 1g -p 8080:80 \  
    ghcr.io/huggingface/text-generation-inference:latest \  
    --model-id meta-llama/Llama-2-7b-chat-hf
```

## 常用模型推荐[​](/wiki/tools/hugging-face#常用模型推荐 "常用模型推荐的直接链接")

### 文本生成[​](/wiki/tools/hugging-face#文本生成 "文本生成的直接链接")

| 模型 | 参数量 | 特点 |
| --- | --- | --- |
| meta-llama/Llama-2-7b-chat-hf | 7B | 开源对话模型 |
| Qwen/Qwen2.5-7B-Instruct | 7B | 中文优秀 |
| mistralai/Mistral-7B-Instruct-v0.2 | 7B | 高效推理 |
| deepseek-ai/deepseek-coder-6.7b-instruct | 6.7B | 代码专精 |

### 嵌入模型[​](/wiki/tools/hugging-face#嵌入模型 "嵌入模型的直接链接")

| 模型 | 特点 |
| --- | --- |
| BAAI/bge-m3 | 多语言、多功能 |
| BAAI/bge-large-zh-v1.5 | 中文最佳 |
| intfloat/e5-large-v2 | 英文高质量 |

### 图像模型[​](/wiki/tools/hugging-face#图像模型 "图像模型的直接链接")

| 模型 | 用途 |
| --- | --- |
| stabilityai/stable-diffusion-xl-base-1.0 | 图像生成 |
| google/vit-base-patch16-224 | 图像分类 |
| facebook/detr-resnet-50 | 目标检测 |

## 最佳实践[​](/wiki/tools/hugging-face#最佳实践 "最佳实践的直接链接")

1. **选择合适模型：** 根据任务和资源选择
2. **量化压缩：** 使用 4-bit/8-bit 量化减少显存
3. **缓存模型：** 设置 `HF_HOME` 缓存目录
4. **使用 Pipeline：** 快速实验和原型开发
5. **社区资源：** 利用 Discussions 和 Papers

## 相关资源[​](/wiki/tools/hugging-face#相关资源 "相关资源的直接链接")

- [Hugging Face Hub](https://huggingface.co/)
- [Transformers 文档](https://huggingface.co/docs/transformers)
- [模型排行榜](https://huggingface.co/spaces/HuggingFaceH4/open_llm_leaderboard)


---

> 本页内容来自文档知识库整理，已按 ArmNet 字元服务 服务命名统一更新。
