import * as path from 'path';
import * as webpack from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import StatoscopePlugin from '@statoscope/webpack-plugin';
import ModuleLogger from './plugins/moduleLogger';


const config: webpack.Configuration = {
    mode: 'production',
    entry: {
        root: './src/pages/root.tsx',
        root2: './src/pages/root2.tsx',
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].[contenthash].js',
    },
    optimization: {
        minimize: true,
        moduleIds: 'deterministic',
        innerGraph: true,
        concatenateModules: true,
        splitChunks: {
          chunks: 'all',
          minChunks: 2,
          minSize: 2000,    
        },
    },
    plugins: [
        new HtmlWebpackPlugin(),
        new ModuleLogger({
            directories: ['./node_modules']
        }),
        new StatoscopePlugin({
            saveStatsTo: 'stats.json',
            saveOnlyStats: false,
            open: false,
        }),
    ],
    resolve: {
        extensions: ['.js', '.json', '.ts', '.tsx'],
        fallback: {
            "buffer": require.resolve("buffer"),
            "stream": false,
        },
        alias: {
            'bn.js': false,
            'browserify-crypto': false,
        }
    },
    externals: {
        'crypto-browserify': 'crypto'
    },
    module: {
        rules: [
            {
                test: /\.(tsx|ts)$/i,
                loader: 'ts-loader'
            },
            {
                test: /\.m?js$/,
                exclude: /(node_modules)/,
                use: {
                  loader: 'babel-loader',
                  options: {
                    presets: ['@babel/preset-env']
                  }
                }
              }
        ]
    },
    cache: {
        type: 'filesystem',
        buildDependencies: {
            config: [__filename],
        },
    }
};

export default config;
