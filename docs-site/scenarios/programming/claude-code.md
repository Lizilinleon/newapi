---
title: "Claude Code 接入指南"
description: "在 Claude Code 中接入 ArmNet 字元服务 大模型API中转服务，使用终端AI编程助手"
lastUpdated: true
---

# Claude Code 接入指南

Claude Code 是 Anthropic 官方推出的 AI 编程助手，通过命令行界面提供强大的代码生成、调试和重构能力。

## 安装[​](/scenarios/programming/claude-code#安装 "安装的直接链接")

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

**步骤 3：安装 Claude Code**

继续在 PowerShell 中输入：

```
npm install -g @anthropic-ai/claude-code
```

**步骤 4：验证安装**

安装完成后，输入以下命令，如果显示版本号说明安装成功：

```
claude --version
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

**步骤 4：安装 Claude Code**

```
npm install -g @anthropic-ai/claude-code
```

或使用 Homebrew：

```
brew install claude
```

**步骤 5：验证安装**

```
claude --version
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

**步骤 4：安装 Claude Code**

```
npm install -g @anthropic-ai/claude-code
```

**步骤 5：验证安装**

```
claude --version
```

## 配置 ArmNet 字元服务[​](/scenarios/programming/claude-code#配置-ArmNet 字元服务 "配置 ArmNet 字元服务的直接链接")

> 推荐新手使用**方式二（配置文件）**，只需创建一个文件即可，简单不易出错。

- Windows
- macOS
- Linux

**方式一：环境变量**

通过图形界面设置（永久生效，推荐）：

1. 右键点击「此电脑」→「属性」→「高级系统设置」→「环境变量」
2. 在「用户变量」中点击「新建」，分别添加以下两个变量：
   - 变量名：`ANTHROPIC_BASE_URL`，变量值：`http://122.51.35.238:5170`
   - 变量名：`ANTHROPIC_AUTH_TOKEN`，变量值：`YOUR_API_KEY`（替换为你的实际 API Key）
3. 点击「确定」保存，重新打开终端即可生效

或者通过 PowerShell 命令设置：

```
# 永久设置  
[System.Environment]::SetEnvironmentVariable('ANTHROPIC_BASE_URL', 'http://122.51.35.238:5170', 'User')  
[System.Environment]::SetEnvironmentVariable('ANTHROPIC_AUTH_TOKEN', 'YOUR_API_KEY', 'User')
```

**方式二：配置文件**

1. 打开文件资源管理器，在地址栏输入 `%USERPROFILE%` 并回车，进入你的用户目录（一般是 `C:\Users\你的用户名\`）
2. 查看是否有 `.claude` 文件夹，如果没有，新建一个文件夹并命名为 `.claude`
3. 在 `.claude` 文件夹内，新建一个文本文件，将文件名改为 `settings.json`（注意去掉 `.txt` 后缀）
4. 用记事本或其他编辑器打开 `settings.json`，粘贴以下内容并保存：

```
{  
  "env": {  
    "ANTHROPIC_AUTH_TOKEN": "YOUR_API_KEY",  
    "ANTHROPIC_BASE_URL": "http://122.51.35.238:5170"  
  }  
}
```

> 将 `YOUR_API_KEY` 替换为你的实际 API Key。

**方式三：启动时临时指定**

在当前会话中设置环境变量后启动 Claude Code（关闭窗口后失效）：

```
$env:ANTHROPIC_BASE_URL="http://122.51.35.238:5170"; $env:ANTHROPIC_AUTH_TOKEN="YOUR_API_KEY"; claude
```

**方式一：环境变量**

打开终端，输入以下命令将配置写入系统。macOS 默认使用 Zsh，如果你不确定，直接用 Zsh 的命令即可：

```
# Zsh（macOS 默认）  
echo 'export ANTHROPIC_BASE_URL=http://122.51.35.238:5170' >> ~/.zshrc  
echo 'export ANTHROPIC_AUTH_TOKEN=YOUR_API_KEY' >> ~/.zshrc  
source ~/.zshrc
```

> 将 `YOUR_API_KEY` 替换为你的实际 API Key。如果你使用的是 Bash，将上面的 `.zshrc` 替换为 `.bashrc` 即可。

**方式二：配置文件**

1. 打开访达（Finder），按 `Cmd + Shift + G`，输入 `~` 并回车，进入你的用户主目录
2. 按 `Cmd + Shift + .` 显示隐藏文件，查看是否有 `.claude` 文件夹，如果没有就新建一个
3. 在 `.claude` 文件夹内，新建一个文件并命名为 `settings.json`
4. 用文本编辑器打开 `settings.json`，粘贴以下内容并保存：

```
{  
  "env": {  
    "ANTHROPIC_AUTH_TOKEN": "YOUR_API_KEY",  
    "ANTHROPIC_BASE_URL": "http://122.51.35.238:5170"  
  }  
}
```

> 将 `YOUR_API_KEY` 替换为你的实际 API Key。

**方式三：启动时临时指定**

在终端中设置环境变量后启动 Claude Code（关闭终端后失效）：

```
ANTHROPIC_BASE_URL=http://122.51.35.238:5170 ANTHROPIC_AUTH_TOKEN=YOUR_API_KEY claude
```

**方式一：环境变量**

打开终端，输入以下命令将配置写入系统。Linux 默认一般使用 Bash：

```
echo 'export ANTHROPIC_BASE_URL=http://122.51.35.238:5170' >> ~/.bashrc  
echo 'export ANTHROPIC_AUTH_TOKEN=YOUR_API_KEY' >> ~/.bashrc  
source ~/.bashrc
```

> 将 `YOUR_API_KEY` 替换为你的实际 API Key。如果你使用的是 Zsh，将上面的 `.bashrc` 替换为 `.zshrc` 即可。

**方式二：配置文件**

1. 打开文件管理器，按 `Ctrl + H` 显示隐藏文件，进入你的用户主目录（一般是 `/home/你的用户名/`）
2. 查看是否有 `.claude` 文件夹（以点开头的是隐藏文件夹），如果没有就新建一个
3. 在 `.claude` 文件夹内，新建一个文件并命名为 `settings.json`
4. 用文本编辑器打开 `settings.json`，粘贴以下内容并保存：

```
{  
  "env": {  
    "ANTHROPIC_AUTH_TOKEN": "YOUR_API_KEY",  
    "ANTHROPIC_BASE_URL": "http://122.51.35.238:5170"  
  }  
}
```

> 将 `YOUR_API_KEY` 替换为你的实际 API Key。

**方式三：启动时临时指定**

在终端中设置环境变量后启动 Claude Code（关闭终端后失效）：

```
ANTHROPIC_BASE_URL=http://122.51.35.238:5170 ANTHROPIC_AUTH_TOKEN=YOUR_API_KEY claude
```

## 推荐模型[​](/scenarios/programming/claude-code#推荐模型 "推荐模型的直接链接")

| 模型 | 特点 | 适用场景 |
| --- | --- | --- |
| claude-opus-4-6 | 最强推理与编码能力 | 架构设计、复杂代码生成 |
| claude-sonnet-4-6 | 均衡性能，速度快 | 日常编程、代码重构 |
| claude-haiku-4-5-20251001 | 高性价比，响应极快 | 轻量任务、快速问答 |

## 使用示例[​](/scenarios/programming/claude-code#使用示例 "使用示例的直接链接")

### 启动交互模式[​](/scenarios/programming/claude-code#启动交互模式 "启动交互模式的直接链接")

直接输入 `claude` 进入对话模式，可以连续提问：

```
claude
```

### 直接执行任务[​](/scenarios/programming/claude-code#直接执行任务 "直接执行任务的直接链接")

在 `claude` 后面加上引号和你的需求，一次性获得结果：

```
claude "创建一个 Express.js REST API"
```

### 在项目中使用[​](/scenarios/programming/claude-code#在项目中使用 "在项目中使用的直接链接")

先用终端进入你的项目文件夹，再启动 Claude Code，它会自动读取项目代码：

```
cd your-project  
claude "重构这个项目的数据库访问层"
```

> 将 `your-project` 替换为你实际的项目文件夹路径。

## 功能特色[​](/scenarios/programming/claude-code#功能特色 "功能特色的直接链接")

- **代码生成**：用自然语言描述需求，自动生成完整代码
- **代码解释**：看不懂的代码丢给它，帮你逐行解释
- **代码重构**：自动优化现有代码结构，提升可读性
- **Bug 修复**：描述问题现象，帮你定位原因并修复
- **文档生成**：自动为代码添加注释和文档

## 常见问题[​](/scenarios/programming/claude-code#常见问题 "常见问题的直接链接")

### 命令找不到[​](/scenarios/programming/claude-code#命令找不到 "命令找不到的直接链接")

- Windows
- macOS
- Linux

输入 `claude` 提示"不是内部或外部命令"时，说明系统找不到 Claude Code 的安装位置，需要手动添加：

1. 在 PowerShell 中输入 `npm config get prefix`，记下显示的路径
2. 右键点击「此电脑」→「属性」→「高级系统设置」→「环境变量」
3. 在「用户变量」中找到 `Path`，双击打开，点击「新建」
4. 将上面记下的路径粘贴进去，末尾加上 `\bin`（例如 `C:\Users\你的用户名\AppData\Roaming\npm`）
5. 点击「确定」保存，重新打开 PowerShell 再试

确保 npm 全局安装路径在 PATH 中：

```
# 查看 npm 全局路径  
npm config get prefix  
  
# 添加到 PATH（如果还没有）  
echo 'export PATH="$PATH:$(npm config get prefix)/bin"' >> ~/.zshrc  
source ~/.zshrc
```

确保 npm 全局安装路径在 PATH 中：

```
# 查看 npm 全局路径  
npm config get prefix  
  
# 添加到 PATH（如果还没有）  
echo 'export PATH="$PATH:$(npm config get prefix)/bin"' >> ~/.bashrc  
source ~/.bashrc
```

### API 连接失败[​](/scenarios/programming/claude-code#api-连接失败 "API 连接失败的直接链接")

1. 确认 API 地址正确（不需要 `/v1` 后缀）
2. 检查 API Key 是否有效
3. 验证网络连接

### 模型不可用[​](/scenarios/programming/claude-code#模型不可用 "模型不可用的直接链接")

确保使用 Claude 系列模型名称，参考上方「推荐模型」表格。

### Node.js 版本问题[​](/scenarios/programming/claude-code#nodejs-版本问题 "Node.js 版本问题的直接链接")

Claude Code 需要 Node.js 18 或更高版本。在终端中输入以下命令检查：

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
