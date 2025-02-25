const defaultConfig = require('@wordpress/scripts/config/webpack.config');
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
    ...defaultConfig,
    output: {
        path: path.resolve(__dirname, 'build'),
        filename: '[name].js', // Add a content hash for caching
        publicPath: '/wp-content/plugins/mailerpress/build/',// Adjust this to match your plugin's directory structure
    },
    externals: {
        react: 'React',
        'react-dom': 'ReactDOM',
        '@wordpress/data': 'wp.data',
        '@wordpress/components': 'wp.components',
        '@wordpress/block-editor': 'wp.blockEditor',
        '@wordpress/dom-ready': 'wp.domReady',
        '@wordpress/apiFetch': 'wp.apiFetch',
        '@wordpress/url': 'wp.url',
        'lodash': 'lodash',
        '@wordpress/keyboard-shortcuts': 'wp.keyboardShortcuts',
    },
    entry: {
        './dist/js/mail-editor': './assets/js/mail-editor/index.jsx',
        './dist/css/mail-editor': './packages/editor/index.scss',
    },
    optimization: {
        splitChunks: {
            chunks: 'all', // This ensures both vendor and app code are split
            cacheGroups: {
                // Split third-party libraries into separate chunks
                vendor: {
                    test: /[\\/]node_modules[\\/]/,
                    name: 'vendors',
                    chunks: 'all',
                    enforce: true,
                },
            },
        },
    },
    plugins: [
        ...defaultConfig.plugins,
        new MiniCssExtractPlugin({
            filename: '[name].[contenthash].css', // Add a content hash for caching CSS
            chunkFilename: '[id].[contenthash].css',
        }),
    ],
};
