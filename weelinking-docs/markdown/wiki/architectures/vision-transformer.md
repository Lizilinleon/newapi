---
{
  "title": "视觉 Transformer (ViT)",
  "source_url": "https://docs.weelinking.com/docs/wiki/architectures/vision-transformer",
  "description": "Vision Transformer 架构详解，weelinking 大模型API中转平台支持多种视觉模型",
  "fetched_at": "2026-07-02T06:35:22.493722+00:00"
}
---

# 视觉 Transformer (ViT)

视觉 Transformer（Vision Transformer，简称 ViT）是将 Transformer 架构应用于图像处理的开创性工作，打破了卷积神经网络（CNN）在视觉领域的垄断。

## 核心原理[​](https://docs.weelinking.com/docs/wiki/architectures/vision-transformer#核心原理 "核心原理的直接链接")

### 传统方法的局限[​](https://docs.weelinking.com/docs/wiki/architectures/vision-transformer#传统方法的局限 "传统方法的局限的直接链接")

在 ViT 之前，计算机视觉主要依赖 CNN：

- 局部感受野
- 难以捕捉全局关系
- 需要大量卷积层堆叠

### ViT 的创新[​](https://docs.weelinking.com/docs/wiki/architectures/vision-transformer#vit-的创新 "ViT 的创新的直接链接")

ViT 将图像视为"Token 序列"：

1. **图像切块（Patch Embedding）：**

   - 将图像分割成固定大小的块（如 16×16）
   - 每个块展平为向量
   - 通过线性投影转换为嵌入
2. **位置编码：**

   - 添加可学习的位置嵌入
   - 保留空间位置信息
3. **Transformer 编码器：**

   - 标准的多头自注意力
   - 全局信息交互

```
图像 → 切块 → 线性投影 → 添加位置编码 → Transformer → 分类头
```

## 模型结构[​](https://docs.weelinking.com/docs/wiki/architectures/vision-transformer#模型结构 "模型结构的直接链接")

### 输入处理[​](https://docs.weelinking.com/docs/wiki/architectures/vision-transformer#输入处理 "输入处理的直接链接")

假设图像大小为 H×W×C，块大小为 P×P：

- 块数量 N = (H×W) / (P×P)
- 每个块维度：P×P×C
- 投影后维度：D（隐藏维度）

### 特殊 Token[​](https://docs.weelinking.com/docs/wiki/architectures/vision-transformer#特殊-token "特殊 Token的直接链接")

- **[CLS] Token：** 用于分类任务的特殊标记
- 位于序列开头
- 最终输出用于分类

### 架构变体[​](https://docs.weelinking.com/docs/wiki/architectures/vision-transformer#架构变体 "架构变体的直接链接")

| 变体 | 层数 | 隐藏维度 | 头数 | 参数量 |
| --- | --- | --- | --- | --- |
| ViT-Base | 12 | 768 | 12 | 86M |
| ViT-Large | 24 | 1024 | 16 | 307M |
| ViT-Huge | 32 | 1280 | 16 | 632M |

## ViT 的优势[​](https://docs.weelinking.com/docs/wiki/architectures/vision-transformer#vit-的优势 "ViT 的优势的直接链接")

### 1. 全局注意力[​](https://docs.weelinking.com/docs/wiki/architectures/vision-transformer#1-全局注意力 "1. 全局注意力的直接链接")

- 每个 Patch 都能关注所有其他 Patch
- 更好地捕捉长距离依赖
- 适合需要全局理解的任务

### 2. 扩展性[​](https://docs.weelinking.com/docs/wiki/architectures/vision-transformer#2-扩展性 "2. 扩展性的直接链接")

- 随着数据和模型规模增加，性能持续提升
- 比 CNN 有更好的 scaling law

### 3. 统一架构[​](https://docs.weelinking.com/docs/wiki/architectures/vision-transformer#3-统一架构 "3. 统一架构的直接链接")

- 视觉和语言使用相同的 Transformer 架构
- 便于多模态模型的构建

## ViT 的挑战[​](https://docs.weelinking.com/docs/wiki/architectures/vision-transformer#vit-的挑战 "ViT 的挑战的直接链接")

### 1. 数据饥渴[​](https://docs.weelinking.com/docs/wiki/architectures/vision-transformer#1-数据饥渴 "1. 数据饥渴的直接链接")

- 需要大规模数据（JFT-300M 级别）
- 在小数据集上表现不如 CNN

### 2. 计算复杂度[​](https://docs.weelinking.com/docs/wiki/architectures/vision-transformer#2-计算复杂度 "2. 计算复杂度的直接链接")

- 自注意力复杂度 O(N²)
- 高分辨率图像计算成本高

### 3. 缺乏归纳偏置[​](https://docs.weelinking.com/docs/wiki/architectures/vision-transformer#3-缺乏归纳偏置 "3. 缺乏归纳偏置的直接链接")

- 没有 CNN 的局部性和平移不变性
- 需要更多数据来学习这些特性

## 重要变体[​](https://docs.weelinking.com/docs/wiki/architectures/vision-transformer#重要变体 "重要变体的直接链接")

### DeiT（Data-efficient Image Transformers）[​](https://docs.weelinking.com/docs/wiki/architectures/vision-transformer#deitdata-efficient-image-transformers "DeiT（Data-efficient Image Transformers）的直接链接")

- 引入知识蒸馏
- 可以在 ImageNet 上从头训练
- 不需要超大数据集

### Swin Transformer[​](https://docs.weelinking.com/docs/wiki/architectures/vision-transformer#swin-transformer "Swin Transformer的直接链接")

- 层次化设计
- 滑动窗口注意力
- 线性复杂度
- 适合下游任务（检测、分割）

### BEiT（BERT 预训练用于图像）[​](https://docs.weelinking.com/docs/wiki/architectures/vision-transformer#beitbert-预训练用于图像 "BEiT（BERT 预训练用于图像）的直接链接")

- 借鉴 BERT 的掩码预训练
- 自监督学习
- 更好的特征表示

### MAE（Masked Autoencoder）[​](https://docs.weelinking.com/docs/wiki/architectures/vision-transformer#maemasked-autoencoder "MAE（Masked Autoencoder）的直接链接")

- 随机掩码 75% 的图像块
- 重建被掩码的部分
- 高效的自监督预训练

## 在多模态中的应用[​](https://docs.weelinking.com/docs/wiki/architectures/vision-transformer#在多模态中的应用 "在多模态中的应用的直接链接")

ViT 是现代多模态模型的基础：

### CLIP[​](https://docs.weelinking.com/docs/wiki/architectures/vision-transformer#clip "CLIP的直接链接")

- 图像编码器使用 ViT
- 对比学习图文对
- 强大的零样本能力

### GPT-4V / GPT-4o[​](https://docs.weelinking.com/docs/wiki/architectures/vision-transformer#gpt-4v--gpt-4o "GPT-4V / GPT-4o的直接链接")

- 视觉编码器基于 ViT
- 与语言模型深度融合

### LLaVA[​](https://docs.weelinking.com/docs/wiki/architectures/vision-transformer#llava "LLaVA的直接链接")

- ViT 提取视觉特征
- 映射到语言模型空间

## 代码示例[​](https://docs.weelinking.com/docs/wiki/architectures/vision-transformer#代码示例 "代码示例的直接链接")

使用 Hugging Face Transformers：

```
from transformers import ViTImageProcessor, ViTForImageClassification  
from PIL import Image  
  
# 加载模型和处理器  
processor = ViTImageProcessor.from_pretrained('google/vit-base-patch16-224')  
model = ViTForImageClassification.from_pretrained('google/vit-base-patch16-224')  
  
# 处理图像  
image = Image.open('image.jpg')  
inputs = processor(images=image, return_tensors="pt")  
  
# 推理  
outputs = model(**inputs)  
predicted_class = outputs.logits.argmax(-1).item()
```

## 发展趋势[​](https://docs.weelinking.com/docs/wiki/architectures/vision-transformer#发展趋势 "发展趋势的直接链接")

1. **高效注意力：** 减少计算复杂度
2. **多尺度设计：** 更好地处理不同分辨率
3. **与 CNN 融合：** 结合两者优点
4. **视频理解：** 扩展到时序数据
