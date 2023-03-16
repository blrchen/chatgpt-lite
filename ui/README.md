# GPTLite

## Development Getting Started

### Prerequisites

1. Install the latest version (v18.x) of [Node](https://nodejs.org/en/). To verify that Node is installed, run `node --version`.
2. If you're using Visual Studio Code, we recommend installing two extensions to enable auto code linting and formatting support:
    - [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
    - [Prettier - Code formatter](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

### Build and run locally

To launch the application, follow these steps:

1. Open the terminal and navigate to the root of this repository.
2. Run the following commands:
    ```bash
    cd ui
    npm install
    npm start
    ```
3. This will open [http://localhost:3000](http://localhost:3000) on your web browser.
4. The page will automatically reload when you make changes to the code and save them.

### Code Linting and Formatting

#### Linting

If you have installed the ESLint plugin, Visual Studio Code will automatically pick up the configuration from [.eslintrc](.eslintrc) and lint your code on save. To lint the entire code base, simply run:

```bash
npm run lint-eslint
```
