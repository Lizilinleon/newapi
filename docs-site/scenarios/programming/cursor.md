---
title: "Cursor 接入指南"
description: "在 Cursor 编辑器中接入 ArmNet 字元服务 大模型API中转服务，解锁AI编程能力"
lastUpdated: true
---

# Cursor 接入指南

Cursor 是一款 AI 驱动的代码编辑器，基于 VS Code 构建，深度集成 AI 能力。

## 下载安装[​](/scenarios/programming/cursor#下载安装 "下载安装的直接链接")

访问 [Cursor 官网](https://cursor.sh/) 下载适合您系统的版本。

## 配置 ArmNet 字元服务[​](/scenarios/programming/cursor#配置-ArmNet 字元服务 "配置 ArmNet 字元服务的直接链接")

### 步骤 1：打开设置[​](/scenarios/programming/cursor#步骤-1打开设置 "步骤 1：打开设置的直接链接")

按 `Cmd/Ctrl + Shift + J` 打开 Cursor Settings。

### 步骤 2：配置 OpenAI API[​](/scenarios/programming/cursor#步骤-2配置-openai-api "步骤 2：配置 OpenAI API的直接链接")

1. 找到 **Models** 部分
2. 点击 **OpenAI API Key**
3. 输入您的 ArmNet 字元服务 密钥

### 步骤 3：配置 API Base[​](/scenarios/programming/cursor#步骤-3配置-api-base "步骤 3：配置 API Base的直接链接")

在设置中找到 **Override OpenAI Base URL**，填入：

```
http://122.51.35.238:5170/v1
```

### 步骤 4：选择模型[​](/scenarios/programming/cursor#步骤-4选择模型 "步骤 4：选择模型的直接链接")

在模型选择器中选择：

- gpt-4o
- gpt-4-turbo
- claude-3-opus-20240229

## 功能使用[​](/scenarios/programming/cursor#功能使用 "功能使用的直接链接")

### Chat（对话）[​](/scenarios/programming/cursor#chat对话 "Chat（对话）的直接链接")

按 `Cmd/Ctrl + L` 打开聊天面板：

- 询问代码问题
- 生成代码片段
- 解释代码逻辑

### Composer（编写器）[​](/scenarios/programming/cursor#composer编写器 "Composer（编写器）的直接链接")

按 `Cmd/Ctrl + I` 使用编写器：

- 生成完整文件
- 重构现有代码
- 多文件编辑

### 内联编辑[​](/scenarios/programming/cursor#内联编辑 "内联编辑的直接链接")

选中代码后按 `Cmd/Ctrl + K`：

- 修改选中代码
- 添加注释
- 优化实现

## 推荐配置[​](/scenarios/programming/cursor#推荐配置 "推荐配置的直接链接")

### 代码生成[​](/scenarios/programming/cursor#代码生成 "代码生成的直接链接")

```
模型：gpt-4o 或 claude-sonnet-4-5  
温度：0.3
```

### 代码解释[​](/scenarios/programming/cursor#代码解释 "代码解释的直接链接")

```
模型：gpt-4-turbo  
温度：0.5
```

## 快捷键[​](/scenarios/programming/cursor#快捷键 "快捷键的直接链接")

| 功能 | 快捷键 |
| --- | --- |
| 打开 Chat | `Cmd/Ctrl + L` |
| 打开 Composer | `Cmd/Ctrl + I` |
| 内联编辑 | `Cmd/Ctrl + K` |
| 接受建议 | `Tab` |
| 拒绝建议 | `Esc` |

## 常见问题[​](/scenarios/programming/cursor#常见问题 "常见问题的直接链接")

### API 调用失败[​](/scenarios/programming/cursor#api-调用失败 "API 调用失败的直接链接")

1. 检查 API Base URL 是否正确
2. 确认 API Key 有效
3. 检查网络连接

### 模型响应慢[​](/scenarios/programming/cursor#模型响应慢 "模型响应慢的直接链接")

尝试使用更快的模型（如 gpt-4o-mini）。


---

> 本页内容来自文档知识库整理，已按 ArmNet 字元服务 服务命名统一更新。
