# ChatGPT Lite

English | [简体中文](./README.zh-CN.md)

## Demo

Try the [ChatGPT Lite Demo Site](https://bit.ly/chatgpt-lite).

![ChatGPT Lite Screenshot](./docs/images/demo.jpg)

## Features

ChatGPT Lite is a lightweight ChatGPT web application built with Next.js and the [OpenAI Chat API](https://platform.openai.com/docs/api-reference/chat). It supports both OpenAI and Azure OpenAI accounts.

- Deploy a custom ChatGPT web interface with markdown support, prompt storage, and multi-user chat functionality.
- Set up a secure, private, web-based ChatGPT for your friends without exposing your API key.
- Clean and extensible codebase, making it a great starting point for your next AI project with Next.js.

If you’re looking for a more beginner-friendly ChatGPT UI codebase, check out [ChatGPT Minimal](https://github.com/blrchen/chatgpt-minimal).

## Prerequisites

You need an OpenAI or Azure OpenAI account.

## Deployment

Refer to the [Environment Variables](#environment-variables) section below for required configurations.

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

```
docker run -d -p 3000:3000 \
   -e AZURE_OPENAI_API_BASE_URL="<YOUR_AZURE_OPENAI_ENDPOINT>" \
   -e AZURE_OPENAI_API_KEY="<YOUR_AZURE_OPENAI_API_KEY>" \
   -e AZURE_OPENAI_DEPLOYMENT="<YOUR_AZURE_OPENAI_DEPLOYMENT_NAME>" \
   blrchen/chatgpt-lite
```

## Development

### Running Locally

1. Install Node.js 20.
2. Clone this repository.
3. Install dependencies using `npm install`.
4. Copy `.env.example` to `.env.local` and update environment variables.
5. Start the application with `npm run dev`.
6. Open `http://localhost:3000` in your browser.

### Running Locally with Docker

1. Clone the repository and navigate to the root directory.
2. Set the `OPENAI_API_KEY` environment variable in the `docker-compose.yml` file.
3. Build the application using `docker-compose build .`.
4. Start the application using `docker-compose up -d`.

## Environment Variables

The following environment variables are required:

For OpenAI account:

| Name                | Description                                                                                      | Default Value            |
| ------------------- | ------------------------------------------------------------------------------------------------ | ------------------------ |
| OPENAI_API_BASE_URL | Use this if you plan to use a reverse proxy for `api.openai.com`.                                | `https://api.openai.com` |
| OPENAI_API_KEY      | Secret key obtained from the [OpenAI API website](https://platform.openai.com/account/api-keys). |                          |
| OPENAI_MODEL        | GPT model to use                                                                                 | `gpt-3.5-turbo`          |

For Azure OpenAI account:

| Name                      | Description                                      |
| ------------------------- | ------------------------------------------------ |
| AZURE_OPENAI_API_BASE_URL | Endpoint (e.g., <https://xxx.openai.azure.com>). |
| AZURE_OPENAI_API_KEY      | API Key.                                         |
| AZURE_OPENAI_DEPLOYMENT   | Model deployment name.                           |

## Contribution

PRs of all sizes are welcome.
