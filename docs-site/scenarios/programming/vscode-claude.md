---
title: "VS Code Claude 插件接入指南"
description: "在 VS Code 中手动安装 Claude 官方插件并接入 ArmNet 字元服务 大模型API中转服务"
lastUpdated: true
---

# VS Code Claude 插件接入指南

Claude for VS Code 是 Anthropic 官方推出的 VS Code 扩展，将 Claude 的强大能力直接集成到编辑器中，支持对话、代码生成、内联编辑等功能。无需离开编辑器，就能和 AI 协作编程。

> 📖 推荐阅读：我们还准备了一篇[图文详解版教程](https://mp.weixin.qq.com/s/45hjxmI1N74D5Q_y430AAw)，配有完整截图，更加直观易懂。

## 前置准备[​](/scenarios/programming/vscode-claude#前置准备 "前置准备的直接链接")

在开始之前，请确保您已完成以下准备：

1. **安装 VS Code**：如果还没有安装，请前往 [VS Code 官网](https://code.visualstudio.com/) 下载并安装
2. **获取 API Key**：登录 [ArmNet 字元服务 平台](http://122.51.35.238:5170)，在控制台中创建并复制您的 API Key（一串以 `sk-` 开头的密钥）

## 安装扩展[​](/scenarios/programming/vscode-claude#安装扩展 "安装扩展的直接链接")

由于网络原因，部分用户可能无法直接从 VS Code 扩展市场搜索安装 Claude 插件。推荐使用手动下载 `.vsix` 文件的方式进行安装。

**第 1 步：下载 .vsix 安装包**

点击以下链接下载 Claude 插件的 `.vsix` 安装包：

[下载 Claude for VS Code v2.1.90](https://marketplace.visualstudio.com/_apis/public/gallery/publishers/anthropic/vsextensions/claude-code/2.1.90/vspackage)

下载完成后，你会得到一个 `.vsix` 文件（如果浏览器将其保存为 `.gz` 后缀，请手动将后缀改为 `.vsix`）。

**第 2 步：在 VS Code 中安装 .vsix 文件**

有两种方式可以安装：

**方式一：通过命令面板安装（推荐）**

1. 打开 VS Code
2. 按 `Ctrl + Shift + P`（macOS 为 `Cmd + Shift + P`）打开命令面板
3. 输入 **"Install from VSIX"**，选择 **"Extensions: Install from VSIX..."**
4. 在弹出的文件选择对话框中，找到并选中刚才下载的 `.vsix` 文件
5. 点击 **安装**，等待安装完成

**方式二：通过扩展面板安装**

1. 打开 VS Code，点击左侧边栏的 **扩展图标**（四个小方块的图标），或使用快捷键 `Ctrl + Shift + X`（macOS 为 `Cmd + Shift + X`）
2. 点击扩展面板右上角的 **`···`**（更多操作）按钮
3. 选择 **"Install from VSIX..."**
4. 选中下载的 `.vsix` 文件并确认安装

**第 3 步：确认安装成功**

安装完成后，您会在 VS Code 左侧边栏看到一个新的 **Claude 图标**（Anthropic 的标志）。点击它即可打开 Claude 面板。

> 提示：如果左侧看不到图标，可以右键点击侧边栏空白处，勾选 **Claude** 来显示它。
> 安装完成后建议重启 VS Code，确保插件正常加载。

## 配置 ArmNet 字元服务[​](/scenarios/programming/vscode-claude#配置-ArmNet 字元服务 "配置 ArmNet 字元服务的直接链接")

安装完成后，需要将 Claude 插件的 API 指向 ArmNet 字元服务 服务，这样才能正常使用。

### 通过插件设置页配置（推荐新手使用）[​](/scenarios/programming/vscode-claude#通过插件设置页配置推荐新手使用 "通过插件设置页配置（推荐新手使用）的直接链接")

**第 1 步：打开 Claude 设置**

1. 按 `Ctrl + Shift + P`（macOS 为 `Cmd + Shift + P`）打开命令面板
2. 输入 **"Claude"**，在出现的列表中选择 **"Claude: Open Settings"**
3. 回车打开设置页面

> 什么是命令面板？它是 VS Code 顶部弹出的一个搜索框，可以用来快速查找并执行各种操作。

**第 2 步：配置 API 提供商**

在设置页面中，找到 **API Provider**（API 提供商）选项，选择 **Anthropic**。

**第 3 步：填写连接信息**

在对应的输入框中填入以下内容：

| 配置项 | 填写内容 | 说明 |
| --- | --- | --- |
| API Key | 您的 ArmNet 字元服务 密钥 | 以 `sk-` 开头的那串密钥 |
| Base URL | `http://122.51.35.238:5170` | 注意：不需要加 `/v1` 后缀 |

**第 4 步：选择模型**

在模型选择器中输入或选择模型名称。新手推荐使用：

- **`claude-sonnet-4-6`** — 速度快、效果好，日常编程首选

**第 5 步：验证配置是否成功**

1. 点击左侧的 Claude 图标，打开对话面板
2. 在输入框中输入一句简单的话，例如：`你好，请做个自我介绍`
3. 如果 Claude 正常回复，说明配置成功

> 如果出现错误提示，请参考下方「常见问题」排查。

### 通过 settings.json 配置（进阶方式）[​](/scenarios/programming/vscode-claude#通过-settingsjson-配置进阶方式 "通过 settings.json 配置（进阶方式）的直接链接")

如果你熟悉 VS Code 配置文件，也可以直接编辑 JSON：

1. 按 `Ctrl + Shift + P`（macOS 为 `Cmd + Shift + P`）打开命令面板
2. 输入 **"Preferences: Open User Settings (JSON)"** 并回车
3. 在打开的 JSON 文件中，添加以下内容：

```
{  
  "claude.apiBaseUrl": "http://122.51.35.238:5170"  
}
```

> API Key 建议通过设置页面填写，避免明文存储在配置文件中。

## 推荐模型[​](/scenarios/programming/vscode-claude#推荐模型 "推荐模型的直接链接")

| 模型 | 特点 | 适用场景 |
| --- | --- | --- |
| claude-opus-4-6 | 最强推理与编码能力 | 架构设计、复杂代码生成 |
| claude-sonnet-4-6 | 均衡性能，速度快 | 日常编程、代码重构（推荐） |
| claude-haiku-4-5-20251001 | 高性价比，响应极快 | 轻量任务、快速问答 |

## 功能使用[​](/scenarios/programming/vscode-claude#功能使用 "功能使用的直接链接")

### 对话面板[​](/scenarios/programming/vscode-claude#对话面板 "对话面板的直接链接")

点击左侧边栏的 **Claude 图标** 即可打开对话面板。你可以像聊天一样和 Claude 交流：

- 直接用中文描述你的需求
- Claude 会自动读取你当前打开的文件作为参考
- 支持连续多轮对话，可以不断追问和修改

**示例：**

```
帮我写一个函数，输入一个日期字符串，返回距离今天有多少天
```

### 引用文件[​](/scenarios/programming/vscode-claude#引用文件 "引用文件的直接链接")

在对话框中输入 **`@`** 符号，会弹出文件列表，选择你想引用的文件。这样 Claude 就能看到那个文���的内容，给出更精准的回答。

例如：输入 `@utils.ts 这个文件里的 formatDate 函数有 bug，帮我修复`

### 内联编辑[​](/scenarios/programming/vscode-claude#内联编辑 "内联编辑的直接链接")

在编辑器中选中一段代码，然后右键选择 **"Claude: Edit"**：

1. 用自然语言描述你想怎么修改（例如 "把这个函数改成 async 的"）
2. Claude 会直接在编辑器中显示修改建议，以绿色（新增）和红色（删除）高亮
3. 你可以选择 **Accept（接受）** 或 **Reject（拒绝）** 这些修改

### 代码解释[​](/scenarios/programming/vscode-claude#代码解释 "代码解释的直接链接")

看不懂一段代码？选中它，右键选择 **"Claude: Explain"**，Claude 会在对话面板中逐行为你解释。

### 终端集成[​](/scenarios/programming/vscode-claude#终端集成 "终端集成的直接链接")

Claude 可以帮你在终端中运行命令，比如：

```
帮我运行一下测试，看看哪些用例失败了
```

Claude 会生成命令并在终端中执行，你可以在对话中看到执行结果。

## 使用技巧[​](/scenarios/programming/vscode-claude#使用技巧 "使用技巧的直接链接")

### 技巧 1：先打开相关文件[​](/scenarios/programming/vscode-claude#技巧-1先打开相关文件 "技巧 1：先打开相关文件的直接链接")

Claude 插件会自动读取你当前打开的文件。在提问之前，先打开与问题相关的文件，Claude 就能更好地理解你的项目。

### 技巧 2��需求描述越具体越好[​](/scenarios/programming/vscode-claude#技巧-2需求描述越具体越好 "技巧 2��需求描述越具体越好的直接链接")

不太好的描述：

```
帮我优化代码
```

更好的描述：

```
帮我优化 getUserList 函数的数据库查询，现在查询太慢了，用户表有 10 万条数据
```

### 技巧 3：复杂任务分步完成[​](/scenarios/programming/vscode-claude#技巧-3复杂任务分步完成 "技巧 3：复杂任务分步完成的直接链接")

不要一次让 Claude 做太多事情，把大任务拆成几个小步骤：

```
第一步：先帮我创建用户数据模型
```

```
第二步：基于这个模型，创建增删改查的 API 路由
```

## 常见问题[​](/scenarios/programming/vscode-claude#常见问题 "常见问题的直接链接")

### 安装 .vsix 失败[​](/scenarios/programming/vscode-claude#安装-vsix-失败 "安装 .vsix 失败的直接链接")

1. 确保 VS Code 版本为最新（点击菜单 **Help → Check for Updates**）
2. 如果下载的文件后缀是 `.gz`，请手动将后缀改为 `.vsix` 后再安装
3. 如果提示不兼容，请更新 VS Code 到最新版本后重试

### 连接失败 / API 报错[​](/scenarios/programming/vscode-claude#连接失败--api-报错 "连接失败 / API 报错的直接链接")

1. 确认 Base URL 填写的是 `http://122.51.35.238:5170`，**不要**加 `/v1` 后缀
2. 检查 API Key 是否正确复制（以 `sk-` 开头，注意前后不要有空格）
3. 验证网络连接正常，可以在浏览器中访问 `http://122.51.35.238:5170` 测试

### 模型不可用[​](/scenarios/programming/vscode-claude#模型不可用 "模型不可用的直接链接")

确保使用的是 Claude 系列模型名称，直接复制上方「推荐模型」表格中的模型名即可。

### 插件没有反应[​](/scenarios/programming/vscode-claude#插件没有反应 "插件没有反应的直接链接")

1. 关闭 VS Code，重新打开
2. 检查 VS Code 是否为最新版本
3. 如需更新插件，请重新下载最新版本的 `.vsix` 文件并重新安装

### 回复是英文的[​](/scenarios/programming/vscode-claude#回复是英文的 "回复是英文的的直接链接")

在对话中直接用中文提问，Claude 通常会用中文回复。如果仍然回复英文，可以在消息开头加上：`请用中文回答。`


---

> 本页内容来自文档知识库整理，已按 ArmNet 字元服务 服务命名统一更新。
