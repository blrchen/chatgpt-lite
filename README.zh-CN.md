# ChatGPT-API 演示

[English](./README.md) | 简体中文

GPT Lite 是一个基于 Next.js 和 AntD 的第三方 ChatGPT UI 页面，支持 Open AI 和 Azure Open AI 账户。

以下是 GPT Lite 的一些用途：
- 作为官方网站的替代品，避免免费版频繁断开连接和刷新问题，同时节省 Plus 订阅费用。
- 部署定制化 ChatGPT 程序以探索 OpenAI's ChatGPT、completion API 及 prompt 提示词等。
- 创建便于家人朋友共享使用的 ChatGPT 程序，无需共享 API 密钥。
- 学习如何使用 OpenAI API 开发 Web 应用程序。

[在线演示](https://gptlite.vercel.app)
![demo](./docs/images/demo.jpg)

## 使用要求

必须拥有 OpenAI 或 Azure OpenAI帐户才能使用 GPT Lite。

## 本地运行方法

1. 安装 NodeJS 18。
2. 克隆代码到命令行窗口。
3. 运行 `npm install` 安装依赖项。
4. 设置 `OPENAI_API_KEY` 环境变量。
5. 运行 `npm run dev` 启动应用程序。
6. 在浏览器中打开 `http://localhost:3000`。

## 使用 Docker 部署方法

1. 克隆代码到命令行窗口
2. 更新 `docker-compose.yml` 文件中的 `OPENAI_API_KEY` 环境变量
3. 执行构建：运行 `docker-compose build`
4. 启动服务：运行 `docker-compose up -d`

## Vercel 一键部署方法

点击下面的 Deploy 按钮即可一键部署至 Vercel:
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fblrchen%2Fgptlite&env=OPENAI_API_KEY&project-name=gptlite&framework=nextjs&repository-name=gptlite)

## 环境变量说明：

OpenAI 相关环境变量：

| 名称                 | 描述                                                                  | 默认值                  |
|---------------------|---------------------------------------------------------------------|----------------------|
| OPENAI_API_BASE_URL | api.openai.com的反向代理地址                                               | https://api.openai.com |
| OPENAI_API_KEY      | 获取自 [OpenAI API](https://platform.openai.com/account/api-keys) 的密钥。 |

Azure Open AI 相关环境变量：

| Name                        | Description                                    |
| --------------------------- |------------------------------------------------|
| AZURE_OPENAI_API_BASE_URL   | 类似格式：https://xxx.openai.azure.com         |
| AZURE_OPENAPIKEY            | 密钥                                             |
| AZURE_OPENDEPLOYMENT        | Model 部署名称                                     |

## 贡献代码方式:

欢迎提交各种PR。

# 免责声明:

此代码仅供演示和测试目的。