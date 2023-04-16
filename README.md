# GPT Lite

English | [简体中文](./README.zh-CN.md)

GPT Lite is a web application offering a fast ChatGPT user interface. Built with Next.js and AntD, it supports both OpenAI and Azure OpenAI accounts.

Example use cases for GPT Lite include:

- A cost-effective alternative to the free version of ChatGPT or the Plus subscription ($20/month) by deploying a customized webchat UI with API integration.
- Deploying a custom ChatGPT web app to explore OpenAI's ChatGPT completion API and prompting.
- Creating a private web-based ChatGPT for exclusive use among friends without sharing an API key.
- Learning to develop web applications using OpenAI's API.

[Live Demo](https://gptlite.vercel.app)
![demo](./docs/images/demo.jpg)

## Prerequisites

To use GPT Lite, you need either an OpenAI account or an Azure Account.

## Running Locally

1. Ensure NodeJS 18 is installed on your system.
2. Clone the repository in your terminal.
3. Install dependencies with `npm install`.
4. Set the `OPENAI_API_KEY` environment variable correctly.
5. Start the application using `npm run dev`.
6. Visit [http://localhost:3000](http://localhost:3000) in your browser.

## Deploy with Docker

1. Clone the repository and navigate to the `app` subdirectory in your terminal.
2. Update the `OPENAI_API_KEY` environment variables in the `docker-compose.yml` file.
3. Build the application using `docker-compose build .`
4. Start it by running `docker-compose up -d`.

## One-click Deploy on Vercel

Click below to deploy GPT Lite to Vercel:
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fblrchen%2Fgptlite&project-name=gptlite&framework=nextjs&repository-name=gptlite)

## Environment Variables

For OpenAI-specific environments:

| Name                | Description                                                                                                                      | Default Value         |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------- | --------------------- |
| OPENAI_API_BASE_URL | Use only if you intend to use a reserved proxy for `api.openai.com`.                                                            | `https://api.openai.com` |
| OPENAI_API_KEY      | Obtain secret key string from [Open AI API website](https://platform.openai.com/account/api-keys).                              |

For Azure Open AI-specific environments:

| Name                       | Description                                    |
|----------------------------|------------------------------------------------|
| AZURE_OPENAI_API_BASE_URL  | Endpoint (e.g., https://xxx.openai.azure.com). |
| AZURE_OPENAI_API_KEY       | Key                                            |
| AZURE_OPENAI_DEPLOYMENT    | Model deployment name                          |

## Contribution
We welcome PRs of any size.

# Disclaimers
This code is intended solely for demonstration and testing purposes