# GPT Lite

English | [简体中文](./README.zh-CN.md)

GPT Lite is a web application that provides a fast ChatGPT user interface. It is built on top of Next.js and AntD. The app supports both Open AI and Azure Open AI accounts.

Some example use cases for GPT Lite include:

- The free version ChatGPT site The web version is prone to disconnecting and requires refreshing. The Plus subscription at 20 USD/month may not be cost-effective for some users, deploy a customized webchat UI with API integration is a more economical option.
- Deploy a customized chatgpt web app to exploring OpenAI's ChatGPT completion API.
- Create a private web chatbot using ChatGPT for exclusive use among friends without sharing api key.
- Learn developing web applications using OpenAI's API

![demo](./docs/images/demo.jpg)

## Prerequisites

To use GPT Lite, you must have either an OpenAI account or an Azure Account 

## Running locally

1. Ensure that NodeJS 18 is installed on your system.
2. Clone the repository in your terminal.
3. Install dependencies by running `npm install`.
4. Verify that you have set the `OPENAI_API_KEY` environment variable correctly.
5. Start the application with `npm run dev`.
6. Open [http://localhost:3000](http://localhost:3000) in your web browser.

## Deploy with Docker

1. Clone the repository and go to the `app` subdirectory in your terminal.
2. Update the `OPENAI_API_KEY` environment variables to the `docker-compose.yml` file.
3. Build the application using `docker-compose build .`
4. Start the application by running `docker-compose up -d`.

## One click deploy on Vercel

To easily connect GPT Lite to Vercel, simply click the button below.
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fblrchen%2Fgptlite&env=OPENAI_API_KEY&project-name=gptlite&framework=nextjs&repository-name=gptlite)

## Environment Variables

The following environments are specific to OpenAI.

| Name                | Description                                                                                                                      | Default Value         |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------- | --------------------- |
| OPENAI_API_BASE_URL | Use this only if you intend to use a reserved proxy for `api.openai.com`                                                         | `https://api.openai.com` |
| OPENAI_API_KEY      | To obtain the secret key string for OpenAI, please visit the [OpenAI API](https://platform.openai.com/account/api-keys) website. |                       |

The following environments are specific to Azure OpenAI.

| Name                        | Description                                              |
| --------------------------- | -------------------------------------------------------- |
| AZURE_OPENAI_API_BASE_URL   | Endpoint, example format:`https://xxx.openai.azure.com` |
| AZURE_OPENAI_API_KEY        | Key                                                      |
| AZURE_OPENAI_API_DEPLOYMENT | Model deployment name                                    |

## Contribution

Welcome PRs of any size.

# Disclaimers

This code is intended solely for demonstration and testing purposes.
