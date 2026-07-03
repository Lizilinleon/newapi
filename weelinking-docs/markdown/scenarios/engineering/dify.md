---
{
  "title": "Dify 接入指南",
  "source_url": "https://docs.weelinking.com/docs/scenarios/engineering/dify",
  "description": "在 Dify 中接入 weelinking 大模型API中转服务，快速构建AI应用工作流",
  "fetched_at": "2026-07-02T06:34:43.418434+00:00"
}
---

# Dify 接入指南

Dify 是一个可视化的 AI 应用开发平台，支持快速构建 AI 应用和工作流。

## 部署方式[​](https://docs.weelinking.com/docs/scenarios/engineering/dify#部署方式 "部署方式的直接链接")

### Docker Compose 部署[​](https://docs.weelinking.com/docs/scenarios/engineering/dify#docker-compose-部署 "Docker Compose 部署的直接链接")

```
git clone https://github.com/langgenius/dify.git  
cd dify/docker  
cp .env.example .env  
docker compose up -d
```

### 访问界面[​](https://docs.weelinking.com/docs/scenarios/engineering/dify#访问界面 "访问界面的直接链接")

部署完成后访问 `http://localhost:3000`

## 配置 weelinking[​](https://docs.weelinking.com/docs/scenarios/engineering/dify#配置-weelinking "配置 weelinking的直接链接")

### 步骤 1：进入设置[​](https://docs.weelinking.com/docs/scenarios/engineering/dify#步骤-1进入设置 "步骤 1：进入设置的直接链接")

登录 Dify 后，点击右上角头像，选择 **设置**。

### 步骤 2：添加模型提供商[​](https://docs.weelinking.com/docs/scenarios/engineering/dify#步骤-2添加模型提供商 "步骤 2：添加模型提供商的直接链接")

1. 选择 **模型提供商**
2. 点击 **添加模型提供商**
3. 选择 **OpenAI-API-compatible**

### 步骤 3：配置连接信息[​](https://docs.weelinking.com/docs/scenarios/engineering/dify#步骤-3配置连接信息 "步骤 3：配置连接信息的直接链接")

| 配置项 | 值 |
| --- | --- |
| 提供商名称 | weelinking |
| API Base URL | `https://api.weelinking.com/v1` |
| API Key | 您的 weelinking 密钥 |

### 步骤 4：添加模型[​](https://docs.weelinking.com/docs/scenarios/engineering/dify#步骤-4添加模型 "步骤 4：添加模型的直接链接")

点击 **添加模型**，填入模型信息：

```
模型名称：gpt-4o  
模型类型：LLM  
上下文长度：128000  
最大输出：4096
```

可添加的模型：

- gpt-4o
- gpt-4-turbo
- claude-3-opus-20240229
- claude-3-sonnet-20240229
- gemini-2.5-pro

## 创建应用[​](https://docs.weelinking.com/docs/scenarios/engineering/dify#创建应用 "创建应用的直接链接")

### 聊天助手[​](https://docs.weelinking.com/docs/scenarios/engineering/dify#聊天助手 "聊天助手的直接链接")

1. 点击 **创建应用**
2. 选择 **聊天助手**
3. 配置模型和参数
4. 编写系统提示词
5. 发布应用

### 工作流[​](https://docs.weelinking.com/docs/scenarios/engineering/dify#工作流 "工作流的直接链接")

1. 点击 **创建应用**
2. 选择 **工作流**
3. 拖拽节点构建流程
4. 配置各节点参数
5. 测试并发布

## 功能特色[​](https://docs.weelinking.com/docs/scenarios/engineering/dify#功能特色 "功能特色的直接链接")

### 可视化构建[​](https://docs.weelinking.com/docs/scenarios/engineering/dify#可视化构建 "可视化构建的直接链接")

- 拖拽式界面
- 丰富的节点类型
- 实时预览

### 知识库[​](https://docs.weelinking.com/docs/scenarios/engineering/dify#知识库 "知识库的直接链接")

- 上传文档
- 自动分割和向量化
- RAG 问答

### 应用发布[​](https://docs.weelinking.com/docs/scenarios/engineering/dify#应用发布 "应用发布的直接链接")

- 网页应用
- API 接口
- 嵌入代码

## 高级配置[​](https://docs.weelinking.com/docs/scenarios/engineering/dify#高级配置 "高级配置的直接链接")

### Embedding 模型[​](https://docs.weelinking.com/docs/scenarios/engineering/dify#embedding-模型 "Embedding 模型的直接链接")

添加 Embedding 模型用于知识库：

```
模型名称：text-embedding-3-small  
模型类型：Text Embedding
```

### 语音模型[​](https://docs.weelinking.com/docs/scenarios/engineering/dify#语音模型 "语音模型的直接链接")

添加语音模型（如需要）：

```
模型名称：whisper-1  
模型类型：Speech to Text
```

## 常见问题[​](https://docs.weelinking.com/docs/scenarios/engineering/dify#常见问题 "常见问题的直接链接")

### 模型测试失败[​](https://docs.weelinking.com/docs/scenarios/engineering/dify#模型测试失败 "模型测试失败的直接链接")

1. 检查 API Base URL 格式
2. 确认 API Key 有效
3. 验证模型名称正确

### 知识库无法使用[​](https://docs.weelinking.com/docs/scenarios/engineering/dify#知识库无法使用 "知识库无法使用的直接链接")

确保已配置 Embedding 模型。
