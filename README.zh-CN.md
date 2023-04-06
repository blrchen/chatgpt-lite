# ChatGPT-API Demo

[English](./README.md) | 简体中文

GPT Lite是一个ChatGPT UI的第三方页面，使用Next.js和AntD实现，支持Open AI和Azure Open AI账户。

下面是一些GPT Lite的用途：
- 虽然ChatGPT有官方网站，但是免费版非常容易断开连接并需要连续刷新，20美元/月的Plus订阅又很不划算，部署集成API的第三方UI程序是更经济的选择。
- 部署一个定制化ChatGPT程序以探索OpenAI's ChatGPT来研究ChatGPT的completion API，prompt提示词等。
- 部署一个方便家人朋友一起使用的ChatGPT程序，无须共享API密钥。
- 学习使用OpenAI API开发Web应用程序

![demo](./docs/images/demo.jpg)

## 使用要求

要使用GPT Lite，必须拥有OpenAI帐户或Azure帐户。

## 在本地运行

1. 确保安装了NodeJS 18。
2. 打开命令行窗口里克隆代码。
3. 运行`npm install`来安装依赖项。
4. 确保设置了`OPENAI_API_KEY`环境变量。
5. 运行`npm run dev`启动应用程序。
6. 在Web浏览器中打开`http://localhost:3000`。

## 使用Docker部署

1. 打开命令行窗口里克隆代码。
2. 更新`docker-compose.yml`文件中里的`OPENAI_API_KEY`环境变量。
3. 运行`docker-compose build`构建。
4. 运行`docker-compose up -d`启动。

## Vercel一键部署

点击下列Deploy按钮即可一键部署至Vercel
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fblrchen%2Fgptlite&env=OPENAI_API_KEY&project-name=gptlite&framework=nextjs&repository-name=gptlite)

## 环境变量说明

以下是OpenAI相关的环境变量

| 名称                  | 描述                                                                            | 默认值                  |
|---------------------|-------------------------------------------------------------------------------|----------------------|
| OPENAI_API_BASE_URL | 反向代理 `api.openai.com`                                                         | `https://api.openai.com` |
| OPENAI_API_KEY      | OpenAI key，可以从[OpenAI API](https://platform.openai.com/account/api-keys)网站获取. |                      |

以下是Azure OpenAI相关的环境变量

| Name                        | Description                                    |
| --------------------------- |------------------------------------------------|
| AZURE_OPENAI_API_BASE_URL   | 格式类似`https://xxx.openai.azure.com` |
| AZURE_OPENAI_API_KEY        | 密钥                                             |
| AZURE_OPENAI_API_DEPLOYMENT | Model部署的名称                                     |


## 贡献代码

欢迎各种PR，大小不限。Issue列表里所有带`Good First Issue`的issue都可以认领。

# 免责说明

此代码仅用于演示和测试目的。