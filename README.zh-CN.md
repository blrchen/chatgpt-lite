# ChatGPT Lite

[English](./README.md) | 简体中文

## 演示

访问 [ChatGPT Lite 演示网站](https://bit.ly/chatgpt-lite)

![演示](./docs/images/demo.zh-CN.jpg)

## 功能介绍

ChatGPT Lite 是一个基于 Next.js 和 [OpenAI Chat API](https://platform.openai.com/docs/api-reference/chat) 的轻量级 ChatGPT 网页应用，支持 OpenAI 与 Azure OpenAI 账户。

- 可自定义部署的 ChatGPT 网页界面，支持 Markdown 渲染、提示词保存和多用户聊天。
- 搭建私有 ChatGPT聊天网站，方便朋友使用，无需暴露 API 密钥。
- 代码结构清晰且易于扩展，适合作为 Next.js AI 项目的起点。

如果你需要更适合初学者的 ChatGPT UI 代码库，建议查看 [ChatGPT Minimal](https://github.com/blrchen/chatgpt-minimal)。

## 前提条件

你需要一个 OpenAI 或 Azure OpenAI 账户。

## 部署方法

在部署前，请根据下文 [环境变量](#环境变量) ，配置所需环境变量。

### 部署到 Vercel

点击下方按钮即可一键部署：

[![使用Vercel部署](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fblrchen%2Fchatgpt-lite&project-name=chatgpt-lite&framework=nextjs&repository-name=chatgpt-lite)

### Docker 部署

OpenAI 账户用户：

```bash
docker run -d -p 3000:3000 \
   -e OPENAI_API_KEY=<你的_OPENAI_API_KEY> \
   blrchen/chatgpt-lite
```

Azure OpenAI 账户用户：

```bash
docker run -d -p 3000:3000 \
   -e AZURE_OPENAI_API_BASE_URL=<你的_AZURE_OPENAI_ENDPOINT> \
   -e AZURE_OPENAI_API_KEY=<你的_AZURE_OPENAI_API_KEY> \
   -e AZURE_OPENAI_DEPLOYMENT=<你的_AZURE_OPENAI_DEPLOYMENT_NAME> \
   blrchen/chatgpt-lite
```

## 本地开发

### 本地运行

1. 安装 NodeJS 20。
2. 克隆本仓库。
3. 运行 `npm install` 安装依赖。
4. 将 `.env.example` 复制为 `.env.local` 并根据需要修改环境变量。
5. 运行 `npm run dev` 启动应用。
6. 在浏览器访问 http://localhost:3000。

### 使用 Docker 本地运行

1. 克隆仓库并进入根目录。
2. 在 `docker-compose.yml` 中配置相关环境变量（如 OPENAI_API_KEY）。
3. 运行 `docker-compose build .` 构建镜像。
4. 运行 `docker-compose up -d` 启动服务。

## 环境变量

以下环境变量为必填项：

**OpenAI 账户：**

| 名称                | 说明                                                                             | 默认值                 |
| ------------------- | -------------------------------------------------------------------------------- | ---------------------- |
| OPENAI_API_BASE_URL | 如需为 `api.openai.com` 配置反向代理可设此变量。                                 | https://api.openai.com |
| OPENAI_API_KEY      | 从 [OpenAI API](https://platform.openai.com/account/api-keys) 获取的密钥字符串。 |                        |
| OPENAI_MODEL        | 使用的 GPT 模型                                                                  | gpt-3.5-turbo          |

**Azure OpenAI 账户：**

| 名称                      | 说明                                        |
| ------------------------- | ------------------------------------------- |
| AZURE_OPENAI_API_BASE_URL | 终端地址（如 https://xxx.openai.azure.com） |
| AZURE_OPENAI_API_KEY      | 密钥                                        |
| AZURE_OPENAI_DEPLOYMENT   | 模型部署名称                                |

## 贡献

欢迎提交各种规模的 PR。
