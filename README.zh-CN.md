# ChatGPT Lite

[English](./README.md) | 简体中文

## 演示

访问 [ChatGPT Lite 演示网站](https://gptlite.vercel.app)

![浅色主题](./docs/images/demo.jpg)
![深色主题](./docs/images/demo-dark.jpg)

## 功能介绍

ChatGPT Lite 是一个基于 Next.js 16 和 [OpenAI Chat API](https://platform.openai.com/docs/api-reference/chat) 的轻量级 ChatGPT 网页应用，支持 OpenAI 与 Azure OpenAI 账户。

**核心功能：**

- **实时流式响应** - 通过 Edge Runtime 和 Server-Sent Events 实现逐字输出
- **丰富的 Markdown 渲染** - 完整支持 Markdown 语法、代码高亮及 KaTeX 数学公式
- **角色系统** - 创建并切换不同的 AI 人设，自定义系统提示词
- **持久化聊天记录** - 所有对话本地保存，无需数据库
- **双平台支持** - 同时兼容 OpenAI 和 Azure OpenAI API

**用户体验：**

- **响应式设计** - 移动优先的界面设计，可折叠侧边栏，适配各种屏幕尺寸
- **40+ 内置主题** - 丰富的主题库，涵盖浅色、深色及多彩风格
- **多会话管理** - 轻松组织和切换多个聊天会话
- **隐私保护** - 自托管实例，终端用户无需接触 API 密钥

**开发体验：**

- 基于 **Next.js 16 App Router**、**React 19**、**TypeScript** 和 **Tailwind CSS v4** 构建
- 采用 **Shadcn/ui** 组件库，架构清晰易扩展
- 支持一键部署到 Vercel、Docker 或任意 Node.js 环境

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

## 环境变量

以下环境变量为必填项：

**OpenAI 账户：**

| 名称                | 说明                                                                             | 默认值                 |
| ------------------- | -------------------------------------------------------------------------------- | ---------------------- |
| OPENAI_API_BASE_URL | （可选）如需为 `api.openai.com` 配置反向代理可设此变量。                             | https://api.openai.com |
| OPENAI_API_KEY      | 从 [OpenAI API](https://platform.openai.com/account/api-keys) 获取的密钥字符串。 |                        |
| OPENAI_MODEL        | （可选）使用的 GPT 模型                                                          | gpt-3.5-turbo          |

**Azure OpenAI 账户：**

| 名称                      | 说明                                        |
| ------------------------- | ------------------------------------------- |
| AZURE_OPENAI_API_BASE_URL | 终端地址（如 https://xxx.openai.azure.com） |
| AZURE_OPENAI_API_KEY      | 密钥                                        |
| AZURE_OPENAI_DEPLOYMENT   | 模型部署名称                                |

## 致谢

- 主题配置来自 [tweakcn](https://github.com/jnsahaj/tweakcn)

## 贡献

欢迎提交各种规模的 PR。
