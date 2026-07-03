---
title: "Gemini CLI 接入指南"
description: "在 Gemini CLI 中接入 ArmNet 字元服务 大模型API中转服务，使用 Google AI 编程助手"
lastUpdated: true
---

# Gemini CLI 接入指南

Gemini CLI 是谷歌推出的命令行 AI 助手，可以在终端中与 Gemini 模型对话、分析文件、理解图片和视频。通过 ArmNet 字元服务 接入后即可使用。

## 安装[​](/scenarios/programming/gemini-cli#安装 "安装的直接链接")

- Windows
- macOS
- Linux

**步骤 1：安装 NVM（Node 版本管理器）**

NVM 是用来管理 Node.js 版本的工具，安装它之后才能安装 Node.js。

1. 打开浏览器，访问 <https://github.com/coreybutler/nvm-windows/releases>
2. 找到最新版本，下载 `nvm-setup.exe` 文件
3. 双击运行安装，一路点「下一步」即可完成

**步骤 2：安装 Node.js**

打开 PowerShell（在开始菜单搜索「PowerShell」，右键选择「以管理员身份运行」），依次输入以下命令：

```
# 安装最新 LTS 版本  
nvm install lts  
  
# 使用该版本  
nvm use lts  
  
# 验证安装，会显示版本号  
node --version  
npm --version
```

**步骤 3：安装 Gemini CLI**

继续在 PowerShell 中输入：

```
npm install -g @google/gemini-cli
```

**步骤 4：验证安装**

安装完成后，输入以下命令，如果显示版本号说明安装成功：

```
gemini --version
```

**步骤 1：安装 NVM**

打开终端，使用 curl 或 wget 安装 nvm：

```
# 使用 curl  
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash  
  
# 或使用 wget  
wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash
```

**步骤 2：加载 NVM**

```
# 添加到配置文件（根据你使用的 shell）  
# Bash  
echo 'export NVM_DIR="$HOME/.nvm"' >> ~/.bashrc  
echo '[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"' >> ~/.bashrc  
source ~/.bashrc  
  
# Zsh  
echo 'export NVM_DIR="$HOME/.nvm"' >> ~/.zshrc  
echo '[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"' >> ~/.zshrc  
source ~/.zshrc
```

**步骤 3：安装 Node.js**

```
# 安装最新 LTS 版本  
nvm install --lts  
  
# 使用该版本  
nvm use --lts  
  
# 验证安装  
node --version  
npm --version
```

**步骤 4：安装 Gemini CLI**

```
npm install -g @google/gemini-cli
```

**步骤 5：验证安装**

```
gemini --version
```

**步骤 1：安装 NVM**

打开终端，使用 curl 或 wget 安装 nvm：

```
# 使用 curl  
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash  
  
# 或使用 wget  
wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash
```

**步骤 2：加载 NVM**

```
# 添加到配置文件  
export NVM_DIR="$HOME/.nvm"  
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  
  
# 重新加载配置  
source ~/.bashrc  # 或 source ~/.zshrc
```

**步骤 3：安装 Node.js**

```
# 安装最新 LTS 版本  
nvm install --lts  
  
# 使用该版本  
nvm use --lts  
  
# 设置默认版本  
nvm alias default lts/*  
  
# 验证安装  
node --version  
npm --version
```

**步骤 4：安装 Gemini CLI**

```
npm install -g @google/gemini-cli
```

**步骤 5：验证安装**

```
gemini --version
```

## 配置 ArmNet 字元服务[​](/scenarios/programming/gemini-cli#配置-ArmNet 字元服务 "配置 ArmNet 字元服务的直接链接")

> 推荐新手使用**方式二（配置文件）**，按步骤创建文件即可，简单不易出错。

- Windows
- macOS
- Linux

**方式一：环境变量**

通过图形界面设置（永久生效，推荐）：

1. 右键点击「此电脑」→「属性」→「高级系统设置」→「环境变量」
2. 在「用户变量」中点击「新建」，分别添加以下三个变量：
   - 变量名：`GOOGLE_GEMINI_BASE_URL`，变量值：`http://122.51.35.238:5170`
   - 变量名：`GEMINI_API_KEY`，变量值：`YOUR_API_KEY`（替换为你的实际 API Key）
   - 变量名：`GEMINI_MODEL`，变量值：`gemini-3-pro-preview`
3. 点击「确定」保存，重新打开终端即可生效

或者通过 PowerShell 命令设置：

```
# 永久设置  
[System.Environment]::SetEnvironmentVariable('GOOGLE_GEMINI_BASE_URL', 'http://122.51.35.238:5170', 'User')  
[System.Environment]::SetEnvironmentVariable('GEMINI_API_KEY', 'YOUR_API_KEY', 'User')  
[System.Environment]::SetEnvironmentVariable('GEMINI_MODEL', 'gemini-3-pro-preview', 'User')
```

**方式二：配置文件**

1. 打开文件资源管理器，在地址栏输入 `%USERPROFILE%` 并回车，进入你的用户目录（一般是 `C:\Users\你的用户名\`）
2. 查看是否有 `.gemini` 文件夹，如果没有，新建一个文件夹并命名为 `.gemini`
3. 在 `.gemini` 文件夹内，需要创建以下两个文件：

**第一个文件：`.env`**

新建一个文本文件，将文件名改为 `.env.`（注意前后各一个点，Windows 会自动去掉末尾的点，最终文件名变为 `.env`），用记事本打开并粘贴以下内容：

```
GOOGLE_GEMINI_BASE_URL=http://122.51.35.238:5170  
GEMINI_API_KEY=YOUR_API_KEY  
GEMINI_MODEL=gemini-3-pro-preview
```

**第二个文件：`settings.json`**

新建一个文本文件，将文件名改为 `settings.json`（去掉 `.txt` 后缀），用记事本打开并粘贴以下内容：

```
{  
  "ide": {  
    "enabled": true  
  },  
  "security": {  
    "auth": {  
      "selectedType": "gemini-api-key"  
    }  
  }  
}
```

> 将 `YOUR_API_KEY` 替换为你的实际 API Key。配置完成后需要重启 Gemini CLI 才生效。

**方式一：环境变量**

打开终端，输入以下命令将配置写入系统。macOS 默认使用 Zsh，如果你不确定，直接用 Zsh 的命令即可：

```
# Zsh（macOS 默认）  
echo 'export GOOGLE_GEMINI_BASE_URL=http://122.51.35.238:5170' >> ~/.zshrc  
echo 'export GEMINI_API_KEY=YOUR_API_KEY' >> ~/.zshrc  
echo 'export GEMINI_MODEL=gemini-3-pro-preview' >> ~/.zshrc  
source ~/.zshrc
```

> 将 `YOUR_API_KEY` 替换为你的实际 API Key。如果你使用的是 Bash，将上面的 `.zshrc` 替换为 `.bashrc` 即可。

**方式二：配置文件**

1. 打开访达（Finder），按 `Cmd + Shift + G`，输入 `~` 并回车，进入你的用户主目录
2. 按 `Cmd + Shift + .` 显示隐藏文件，查看是否有 `.gemini` 文件夹，如果没有就新建一个
3. 在 `.gemini` 文件夹内，需要创建以下两个文件：

**第一个文件：`.env`**

新建一个文件并命名为 `.env`，用文本编辑器打开并粘贴以下内容：

```
GOOGLE_GEMINI_BASE_URL=http://122.51.35.238:5170  
GEMINI_API_KEY=YOUR_API_KEY  
GEMINI_MODEL=gemini-3-pro-preview
```

**第二个文件：`settings.json`**

新建一个文件并命名为 `settings.json`，用文本编辑器打开并粘贴以下内容：

```
{  
  "ide": {  
    "enabled": true  
  },  
  "security": {  
    "auth": {  
      "selectedType": "gemini-api-key"  
    }  
  }  
}
```

> 将 `YOUR_API_KEY` 替换为你的实际 API Key。配置完成后需要重启 Gemini CLI 才生效。

**方式一：环境变量**

打开终端，输入以下命令将配置写入系统。Linux 默认一般使用 Bash：

```
echo 'export GOOGLE_GEMINI_BASE_URL=http://122.51.35.238:5170' >> ~/.bashrc  
echo 'export GEMINI_API_KEY=YOUR_API_KEY' >> ~/.bashrc  
echo 'export GEMINI_MODEL=gemini-3-pro-preview' >> ~/.bashrc  
source ~/.bashrc
```

> 将 `YOUR_API_KEY` 替换为你的实际 API Key。如果你使用的是 Zsh，将上面的 `.bashrc` 替换为 `.zshrc` 即可。

**方式二：配置文件**

1. 打开文件管理器，按 `Ctrl + H` 显示隐藏文件，进入你的用户主目录（一般是 `/home/你的用户名/`）
2. 查看是否有 `.gemini` 文件夹（以点开头的是隐藏文件夹），如果没有就新建一个
3. 在 `.gemini` 文件夹内，需要创建以下两个文件：

**第一个文件：`.env`**

新建一个文件并命名为 `.env`，用文本编辑器打开并粘贴以下内容：

```
GOOGLE_GEMINI_BASE_URL=http://122.51.35.238:5170  
GEMINI_API_KEY=YOUR_API_KEY  
GEMINI_MODEL=gemini-3-pro-preview
```

**第二个文件：`settings.json`**

新建一个文件并命名为 `settings.json`，用文本编辑器打开并粘贴以下内容：

```
{  
  "ide": {  
    "enabled": true  
  },  
  "security": {  
    "auth": {  
      "selectedType": "gemini-api-key"  
    }  
  }  
}
```

> 将 `YOUR_API_KEY` 替换为你的实际 API Key。配置完成后需要重启 Gemini CLI 才生效。

## 可用模型[​](/scenarios/programming/gemini-cli#可用模型 "可用模型的直接链接")

| 模型 | 说明 | 上下文 |
| --- | --- | --- |
| gemini-3-pro-preview | LMArena 第一 | 1M |
| gemini-2.5-pro | 正式版 | 2M |
| gemini-2.5-flash | 快速响应 | 1M |

## 使用方法[​](/scenarios/programming/gemini-cli#使用方法 "使用方法的直接链接")

### 交互模式[​](/scenarios/programming/gemini-cli#交互模式 "交互模式的直接链接")

直接输入 `gemini` 进入对话模式，可以连续提问：

```
gemini
```

### 单次查询[​](/scenarios/programming/gemini-cli#单次查询 "单次查询的直接链接")

在 `gemini` 后面加上引号和你的问题，一次性获得结果：

```
gemini "解释量子计算的基本原理"
```

### 文件处理[​](/scenarios/programming/gemini-cli#文件处理 "文件处理的直接链接")

让 Gemini 帮你阅读和总结文档，将 `document.pdf` 替换为你实际的文件名：

```
gemini --file document.pdf "总结这份文档"
```

## 功能特色[​](/scenarios/programming/gemini-cli#功能特色 "功能特色的直接链接")

- **超长上下文**：一次可以处理超大量的文本内容（最高支持约 400 万字）
- **多模态**：不仅能处理文字，还能理解图片和视频
- **代码执行**：能生成代码并直接运行
- **文件处理**：支持 PDF、Word、代码文件等多种格式

## 多模态使用[​](/scenarios/programming/gemini-cli#多模态使用 "多模态使用的直接链接")

Gemini 除了文字对话，还能理解图片和视频内容。

### 图像分析[​](/scenarios/programming/gemini-cli#图像分析 "图像分析的直接链接")

让 Gemini 描述或分析一张图片，将 `photo.jpg` 替换为你实际的图片文件名：

```
gemini --image photo.jpg "描述这张图片"
```

### 视频理解[​](/scenarios/programming/gemini-cli#视频理解 "视频理解的直接链接")

让 Gemini 总结视频内容，将 `clip.mp4` 替换为你实际的视频文件名：

```
gemini --video clip.mp4 "总结视频内容"
```

## 常见问题[​](/scenarios/programming/gemini-cli#常见问题 "常见问题的直接链接")

### 命令找不到[​](/scenarios/programming/gemini-cli#命令找不到 "命令找不到的直接链接")

- Windows
- macOS
- Linux

输入 `gemini` 提示"不是内部或外部命令"时，说明系统找不到 Gemini CLI 的安装位置，需要手动添加：

1. 在 PowerShell 中输入 `npm config get prefix`，记下显示的路径
2. 右键点击「此电脑」→「属性」→「高级系统设置」→「环境变量」
3. 在「用户变量」中找到 `Path`，双击打开，点击「新建」
4. 将上面记下的路径粘贴进去，末尾加上 `\bin`（例如 `C:\Users\你的用户名\AppData\Roaming\npm`）
5. 点击「确定」保存，重新打开 PowerShell 再试

在终端中输入以下命令，将 npm 路径添加到系统中：

```
echo 'export PATH="$PATH:$(npm config get prefix)/bin"' >> ~/.zshrc  
source ~/.zshrc
```

在终端中输入以下命令，将 npm 路径添加到系统中：

```
echo 'export PATH="$PATH:$(npm config get prefix)/bin"' >> ~/.bashrc  
source ~/.bashrc
```

### API 连接失败[​](/scenarios/programming/gemini-cli#api-连接失败 "API 连接失败的直接链接")

1. 打开上面创建的 `.gemini` 文件夹，检查 `.env` 文件中的地址和 API Key 是否填写正确
2. 确认 API Key 是否有效（可以在 ArmNet 字元服务 控制台查看）
3. 确认网络连接正常

### 模型不可用[​](/scenarios/programming/gemini-cli#模型不可用 "模型不可用的直接链接")

确保使用 Gemini 系列模型名称，参考上方「可用模型」表格。

### Node.js 版本问题[​](/scenarios/programming/gemini-cli#nodejs-版本问题 "Node.js 版本问题的直接链接")

Gemini CLI 需要 Node.js 18 或更高版本。在终端中输入以下命令检查：

```
node --version
```

如果显示的版本号低于 18（例如 `v16.x.x`），需要升级：

```
nvm install --lts  
nvm use --lts
```


---

> 本页内容来自文档知识库整理，已按 ArmNet 字元服务 服务命名统一更新。
