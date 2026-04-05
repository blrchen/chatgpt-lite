# ChatGPT Lite

[English](./README.md) | 简体中文

ChatGPT Lite 是一个功能完整、支持私有化部署的 ChatGPT 应用。基于 Next.js，开箱即用。

## 演示

访问 [ChatGPT Lite 演示网站](https://gptlite.vercel.app)

| 浅色主题 | 深色主题 |
|:--------:|:-------:|
| ![浅色主题](./docs/images/demo.jpg) | ![深色主题](./docs/images/demo-dark.jpg) |

## 功能介绍

**功能：**

- **实时流式响应** - 通过 Server-Sent Events 实现逐字输出
- **丰富的 Markdown 渲染** - 完整支持 Markdown 语法及代码高亮
- **角色系统** - 创建并切换不同的 AI 人设，自定义系统提示词
- **多会话管理** - 轻松组织和切换多个聊天会话
- **持久化聊天记录** - 所有对话本地保存，无需服务端数据库
- **文件附件** - 支持直接上传图片、PDF、电子表格（XLSX/CSV）及文本文件
- **语音输入** - 通过 Web Speech API 语音识别
- **联网搜索** - 模型支持时可搜索网络，并显示来源引用
- **支持 OpenAI、Azure OpenAI 及 OpenAI 兼容 API 提供商**
- **40+ UI 主题**
- **响应式设计** - 适配桌面与移动端，可折叠侧边栏

本项目基于 [ChatGPT Minimal](https://github.com/blrchen/chatgpt-minimal) 扩展开发，在其基础上增加了主题系统、角色系统、文件附件、语音输入等功能。如果只需要核心聊天功能，可以直接使用 ChatGPT Minimal，代码量小，代码清晰，易于扩展。

## 部署

部署所需的环境变量请参考[环境变量](#环境变量)章节。

### 部署到 Vercel

点击下方按钮即可一键部署：

[![使用Vercel部署](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fblrchen%2Fchatgpt-lite&project-name=chatgpt-lite&framework=nextjs&repository-name=chatgpt-lite)

### 使用 Docker 部署

OpenAI 账户：

```bash
docker run -d -p 3000:3000 \
   -e OPENAI_API_KEY="<你的_OPENAI_API_KEY>" \
   blrchen/chatgpt-lite
```

Azure OpenAI 账户：

```bash
docker run -d -p 3000:3000 \
   -e AZURE_OPENAI_RESOURCE_NAME="<你的_AZURE_RESOURCE_NAME>" \
   -e AZURE_OPENAI_API_KEY="<你的_AZURE_OPENAI_API_KEY>" \
   -e AZURE_OPENAI_DEPLOYMENT="<你的_AZURE_OPENAI_DEPLOYMENT_NAME>" \
   blrchen/chatgpt-lite
```

## 本地开发

### 本地运行

1. 安装 Node.js 22+。
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
| OPENAI_MODEL        | （可选）使用的 GPT 模型                                                          | gpt-4o-mini          |

**Azure OpenAI 账户：**

| 名称                       | 说明                                          |
| -------------------------- | --------------------------------------------- |
| AZURE_OPENAI_RESOURCE_NAME | Azure 资源名称（如 "my-openai-resource"）     |
| AZURE_OPENAI_API_KEY       | 密钥                                          |
| AZURE_OPENAI_DEPLOYMENT    | 模型部署名称（不是模型名）                    |

## 致谢

- 主题代码来自 [tweakcn](https://github.com/jnsahaj/tweakcn)

## 贡献

欢迎提交各种规模的 PR。
