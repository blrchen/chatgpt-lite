const path = require('path')

const { loaderByName } = require('@craco/craco')
const CracoLessPlugin = require('craco-less')
const webpack = require('webpack')
const WebpackBar = require('webpackbar')

const { version } = require('./package.json')

const resolve = (dir) => path.resolve(__dirname, dir)

const currentTime = new Date()

let API_PATH = 'https://input-your-api-endpoint'

module.exports = {
  env: {},
  eslint: {
    enable: true,
    mode: 'file'
  },
  babel: {
    plugins: [
      [
        'import',
        {
          libraryName: 'antd',
          libraryDirectory: 'es',
          style: true
        }
      ]
    ]
  },
  webpack: {
    alias: {
      '@': resolve('src')
    },
    plugins: {
      add: [
        new WebpackBar(),
        new webpack.DefinePlugin({
          'process.env.API_PATH': JSON.stringify(API_PATH),
          'process.env.VERSION': JSON.stringify(version),
          'process.env.GENERATED_TIME': JSON.stringify(currentTime.toISOString())
        })
      ]
    },
    configure: (webpackConfig, { env, paths }) => {
      webpackConfig.output.globalObject = 'window'

      webpackConfig.optimization.splitChunks = {
        ...webpackConfig.optimization.splitChunks,
        cacheGroups: {
          commons: {
            chunks: 'all',
            minChunks: 2,
            name: 'commons',
            priority: 80
          }
        }
      }
      return webpackConfig
    }
  },
  plugins: [
    {
      plugin: CracoLessPlugin,
      options: {
        lessLoaderOptions: {
          lessOptions: {
            modifyVars: {},
            javascriptEnabled: true
          }
        },
        modifyLessModuleRule(lessModuleRule, context) {
          // Configure the file suffix
          lessModuleRule.test = /\.module\.less$/

          // Configure the generated local ident name.
          const cssLoader = lessModuleRule.use.find(loaderByName('css-loader'))
          cssLoader.options.modules = {
            localIdentName: '[local]_[hash:base64:5]'
          }

          return lessModuleRule
        }
      }
    }
  ]
}
