# ChatGPT Lite

English | [简体中文](./README.zh-CN.md)

ChatGPT Lite is a feature-rich, self-hostable ChatGPT app. Built with Next.js. Ready to deploy and use.

## Demo

Try the [ChatGPT Lite Demo Site](https://gptlite.vercel.app).

| Light Theme | Dark Theme |
|:-----------:|:----------:|
| ![ChatGPT Lite Light Theme](./docs/images/demo.jpg) | ![ChatGPT Lite Dark Theme](./docs/images/demo-dark.jpg) |

## Features

**Features:**

- **Real-time Streaming Responses** - Instant token-by-token output via Server-Sent Events
- **Rich Markdown Rendering** - Full markdown support with syntax highlighting
- **Persona System** - Create and switch between custom AI personalities with different system prompts
- **Multi-conversation Management** - Organize and switch between multiple chat threads
- **Persistent Chat History** - All conversations saved locally with no server-side database required
- **File Attachments** - Upload images, PDFs, spreadsheets (XLSX/CSV), and text files directly in chat
- **Voice Input** - Dictate messages using Web Speech API
- **Web Search Integration** - Models can search the web when needed, with source citations
- **Supports OpenAI, Azure OpenAI, and OpenAI-compatible providers**
- **40+ UI Themes**
- **Responsive Design** - Desktop and mobile friendly with collapsible sidebar

This project is built on top of [ChatGPT Minimal](https://github.com/blrchen/chatgpt-minimal), extending it with themes, personas, file attachments, voice input, and more. Want something lighter? Check out ChatGPT Minimal. Small codebase, easy to understand, hack, and extend.

## Deployment

For required environment variables, see [Environment Variables](#environment-variables).

### Deploy to Vercel

Deploy instantly by clicking the button below:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fblrchen%2Fchatgpt-lite&project-name=chatgpt-lite&framework=nextjs&repository-name=chatgpt-lite)

### Deploy with Docker

For OpenAI account users:

```bash
docker run -d -p 3000:3000 \
   -e OPENAI_API_KEY="<YOUR_OPENAI_API_KEY>" \
   blrchen/chatgpt-lite
```

For Azure OpenAI account users:

```bash
docker run -d -p 3000:3000 \
   -e AZURE_OPENAI_RESOURCE_NAME="<YOUR_AZURE_RESOURCE_NAME>" \
   -e AZURE_OPENAI_API_KEY="<YOUR_AZURE_OPENAI_API_KEY>" \
   -e AZURE_OPENAI_DEPLOYMENT="<YOUR_AZURE_OPENAI_DEPLOYMENT_NAME>" \
   blrchen/chatgpt-lite
```

## Development

### Run Locally

1. Install Node.js 22+.
2. Clone this repository.
3. Install dependencies using `npm install`.
4. Copy `.env.example` to `.env.local` and update environment variables.
5. Start the application with `npm run dev`.
6. Open `http://localhost:3000` in your browser.

## Environment Variables

The following environment variables are required:

For OpenAI account:

| Name                | Description                                                                                      | Default Value            |
| ------------------- | ------------------------------------------------------------------------------------------------ | ------------------------ |
| OPENAI_API_BASE_URL | (Optional) Use this if you plan to use a reverse proxy for `api.openai.com`.                     | `https://api.openai.com` |
| OPENAI_API_KEY      | Secret key obtained from the [OpenAI API website](https://platform.openai.com/account/api-keys). |                          |
| OPENAI_MODEL        | (Optional) GPT model to use                                                                      | `gpt-4o-mini`          |

For Azure OpenAI account:

| Name                       | Description                                    |
| -------------------------- | ---------------------------------------------- |
| AZURE_OPENAI_RESOURCE_NAME | Azure resource name (e.g., "my-openai-resource"). |
| AZURE_OPENAI_API_KEY       | API Key.                                       |
| AZURE_OPENAI_DEPLOYMENT    | Model deployment name (not the model name). |

## Acknowledgments

- Theme code from [tweakcn](https://github.com/jnsahaj/tweakcn)

## Contribution

PRs of all sizes are welcome.
