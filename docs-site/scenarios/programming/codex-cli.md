---
title: "Codex CLI 接入指南"
description: "在 Codex CLI 中接入 ArmNet 字元服务 大模型API中转服务，OpenAI 编程工具配置指南"
lastUpdated: true
---

# Codex CLI 接入指南

Codex CLI 是 OpenAI 推出的命令行 AI 编程助手，可以在终端中帮你生成代码、解释代码、回答编程问题。

## 安装[​](/scenarios/programming/codex-cli#安装 "安装的直接链接")

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

**步骤 3：安装 Codex CLI**

继续在 PowerShell 中输入：

```
npm install -g @openai/codex@latest
```

**步骤 4：验证安装**

安装完成后，输入以下命令，如果显示版本号说明安装成功：

```
codex --version
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

**步骤 4：安装 Codex CLI**

```
npm install -g @openai/codex@latest
```

**步骤 5：验证安装**

```
codex --version
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

**步骤 4：安装 Codex CLI**

```
npm install -g @openai/codex@latest
```

**步骤 5：验证安装**

```
codex --version
```

## 配置 ArmNet 字元服务[​](/scenarios/programming/codex-cli#配置-ArmNet 字元服务 "配置 ArmNet 字元服务的直接链接")

需要在用户目录下创建一个 `.codex` 文件夹，并在里面放两个配置文件。请根据你的操作系统，按照以下步骤操作：

- Windows
- macOS
- Linux

**步骤 1：创建配置文件夹**

1. 打开文件资源管理器，在地址栏输入 `%USERPROFILE%` 并回车，进入你的用户目录（一般是 `C:\Users\你的用户名\`）
2. 新建一个文件夹，命名为 `.codex`

**步骤 2：创建 config.toml 文件**

1. 在 `.codex` 文件夹内，新建一个文本文件，将文件名改为 `config.toml`（注意去掉 `.txt` 后缀）
2. 用记事本打开 `config.toml`，粘贴以下内容并保存：

```
model_provider = "ArmNet 字元服务"  
model = "gpt-5.3-codex"  
model_reasoning_effort = "xhigh"  
network_access = "enabled"  
disable_response_storage = true  
  
[model_providers.ArmNet 字元服务]  
name = "ArmNet 字元服务"  
base_url = "http://122.51.35.238:5170/v1"  
wire_api = "responses"  
requires_openai_auth = true
```

**步骤 3：创建 auth.json 文件**

1. 在同一个 `.codex` 文件夹内，再新建一个文本文件，将文件名改为 `auth.json`（注意去掉 `.txt` 后缀）
2. 用记事本打开 `auth.json`，粘贴以下内容并保存：

```
{  
  "OPENAI_API_KEY": "YOUR_API_KEY"  
}
```

> 将 `YOUR_API_KEY` 替换为你的实际 API Key。

**步骤 1：创建配置文件夹**

1. 打开访达（Finder），按 `Cmd + Shift + G`，输入 `~` 并回车，进入你的用户主目录
2. 按 `Cmd + Shift + .` 显示隐藏文件，查看是否有 `.codex` 文件夹，如果没有就新建一个

**步骤 2：创建 config.toml 文件**

1. 在 `.codex` 文件夹内，新建一个文件并命名为 `config.toml`
2. 用文本编辑器打开 `config.toml`，粘贴以下内容并保存：

```
model_provider = "ArmNet 字元服务"  
model = "gpt-5.3-codex"  
model_reasoning_effort = "xhigh"  
network_access = "enabled"  
disable_response_storage = true  
  
[model_providers.ArmNet 字元服务]  
name = "ArmNet 字元服务"  
base_url = "http://122.51.35.238:5170/v1"  
wire_api = "responses"  
requires_openai_auth = true
```

**步骤 3：创建 auth.json 文件**

1. 在同一个 `.codex` 文件夹内，再新建一个文件并命名为 `auth.json`
2. 用文本编辑器打开 `auth.json`，粘贴以下内容并保存：

```
{  
  "OPENAI_API_KEY": "YOUR_API_KEY"  
}
```

> 将 `YOUR_API_KEY` 替换为你的实际 API Key。

**步骤 1：创建配置文件夹**

1. 打开文件管理器，按 `Ctrl + H` 显示隐藏文件，进入你的用户主目录（一般是 `/home/你的用户名/`）
2. 查看是否有 `.codex` 文件夹（以点开头的是隐藏文件夹），如果没有就新建一个

**步骤 2：创建 config.toml 文件**

1. 在 `.codex` 文件夹内，新建一个文件并命名为 `config.toml`
2. 用文本编辑器打开 `config.toml`，粘贴以下内容并保存：

```
model_provider = "ArmNet 字元服务"  
model = "gpt-5.3-codex"  
model_reasoning_effort = "xhigh"  
network_access = "enabled"  
disable_response_storage = true  
  
[model_providers.ArmNet 字元服务]  
name = "ArmNet 字元服务"  
base_url = "http://122.51.35.238:5170/v1"  
wire_api = "responses"  
requires_openai_auth = true
```

**步骤 3：创建 auth.json 文件**

1. 在同一个 `.codex` 文件夹内，再新建一个文件并命名为 `auth.json`
2. 用文本编辑器打开 `auth.json`，粘贴以下内容并保存：

```
{  
  "OPENAI_API_KEY": "YOUR_API_KEY"  
}
```

> 将 `YOUR_API_KEY` 替换为你的实际 API Key。

## 使用方法[​](/scenarios/programming/codex-cli#使用方法 "使用方法的直接链接")

### 交互模式[​](/scenarios/programming/codex-cli#交互模式 "交互模式的直接链接")

直接输入 `codex` 进入对话模式，可以连续提问：

```
codex
```

### 直接执行[​](/scenarios/programming/codex-cli#直接执行 "直接执行的直接链接")

在 `codex` 后面加上引号和你的需求，一次性获得结果：

```
codex "写一个 Python 快速排序算法"
```

### 让 Codex 读取文件内容[​](/scenarios/programming/codex-cli#让-codex-读取文件内容 "让 Codex 读取文件内容的直接链接")

你可以把文件内容传给 Codex，让它帮你分析或解释代码：

- Windows
- macOS
- Linux

```
Get-Content code.py | codex "解释这段代码"
```

```
cat code.py | codex "解释这段代码"
```

```
cat code.py | codex "解释这段代码"
```

> 其中 `code.py` 替换为你实际的文件名。`|` 是管道符号，意思是把前面命令的输出传给后面的 Codex。

## 功能特色[​](/scenarios/programming/codex-cli#功能特色 "功能特色的直接链接")

- **代码生成**：用自然语言描述需求，自动生成代码
- **代码解释**：看不懂的代码丢给它，帮你逐行解释
- **命令行集成**：直接在终端中使用，无需切换窗口
- **多语言支持**：Python、JavaScript、Go、Java 等主流语言都支持

## 推荐模型[​](/scenarios/programming/codex-cli#推荐模型 "推荐模型的直接链接")

| 场景 | 模型 |
| --- | --- |
| 代码生成 | gpt-5.3-codex |
| 快速问答 | gpt-4o-mini |
| 复杂任务 | gpt-5.4 |

## 常见问题[​](/scenarios/programming/codex-cli#常见问题 "常见问题的直接链接")

### 命令找不到[​](/scenarios/programming/codex-cli#命令找不到 "命令找不到的直接链接")

- Windows
- macOS
- Linux

输入 `codex` 提示"不是内部或外部命令"时，说明系统找不到 Codex 的安装位置，需要手动添加：

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

### API 连接失败[​](/scenarios/programming/codex-cli#api-连接失败 "API 连接失败的直接链接")

1. 打开上面创建的 `.codex` 文件夹，检查 `config.toml` 中的地址是否填写正确
2. 检查 `auth.json` 中的 API Key 是否有效
3. 确认网络连接正常

### Node.js 版本问题[​](/scenarios/programming/codex-cli#nodejs-版本问题 "Node.js 版本问题的直接链接")

Codex CLI 需要 Node.js 18 或更高版本。在终端中输入以下命令检查：

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
