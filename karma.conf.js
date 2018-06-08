// https://raw.githubusercontent.com/zyml/es6-karma-jasmine-webpack-boilerplate/master/karma.config.js

import path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import webpack from 'webpack';
import { SRC, NODE_MODULES } from './webpack/constants';

const extractLess = new ExtractTextPlugin({
    filename: './[name].css'
});

module.exports = function(config) {
    config.set({

        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: '',

        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: ['jasmine'],

        // plugins: ['karma-webpack', 'karma-jasmine', 'karma-chrome-launcher', 'karma-babel-preprocessor'],

        // list of files / patterns to load in the browser


        // preprocess matching files before serving them to the browser
        // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
        preprocessors: {
            './src/__tests__/core/*.test.js': ['webpack'],
        },

        babelPreprocessor: {
            options: {
                presets: ['env'],
                sourceMap: 'inline'
            },
            filename: function (file) {
                return file.originalPath.replace(/\.js$/, '.es5.js');
            },
            sourceFileName: function (file) {
                return file.originalPath;
            }
        },

        files: [
            // 'src/flowtype/empty.js',
            // 'src/js/core/Core.js',
            'src/__tests__/core/*.test.js',
            { pattern: 'src/data/config.json', included: false, served: true, nocache: true },
            { pattern: 'src/data/coins.json', included: false, served: true, nocache: true },
            { pattern: 'src/data/releases-1.json', included: false, served: true, nocache: true },
            { pattern: 'src/data/messages.json', included: false, served: true, nocache: true },
            { pattern: 'src/data/latest.txt', included: false, served: true, nocache: true },
        ],

        proxies: {
            // "/iframe.js": "http://localhost:8099/base/src/js/iframe/iframe.js",
        },

        // test results reporter to use
        // possible values: 'dots', 'progress'
        // available reporters: https://npmjs.org/browse/keyword/karma-reporter
        reporters: ['progress'],

        // web server port


        // enable / disable colors in the output (reporters and logs)
        colors: true,

        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_DEBUG,

        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: true,

        // start these browsers
        // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
        //browsers: ['chrome_without_security'],
        //browsers: ['ChromeCanary'],
        browsers: ['Chrome'],
        //browsers: ['Firefox'],

        // customLaunchers: {
        //     chrome_without_security: {
        //         base: 'Chrome',
        //         flags: [
        //             '--load-extension=/Users/szymon.lesisz/Library/Application Support/Google/Chrome/Default/Extensions/jcjjhjgimijdkoamemaghajlhegmoclj'
        //         ],
        //         displayName: 'Chrome w/o security'
        //     }
        // },

        client: {
            captureConsole: true,
            clearContext: true,
            useIframe: false,
            runInParent: true
        },

        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: false,

        // Concurrency level
        // how many browser should be started simultaneous
        concurrency: Infinity,

        hostname: 'localhost',
        port: 8099,

        webpack: {
            cache: true,
            devtool: 'inline-source-map',
            module: {
                loaders: [
                    {
                        test: /\.(js|jsx)$/,
                        exclude: /(node_modules)/,
                        use: {
                            loader: 'babel-loader',
                            options: {

                            }
                        }
                    },
                    {
                        test: /\.less$/,
                        exclude: /node_modules/,
                        loader: extractLess.extract({
                            use: [
                                { loader: 'css-loader' },
                                { loader: 'less-loader' }
                            ],
                            fallback: 'style-loader'
                        })
                    },
                    {
                        test: /\.(ttf|eot|svg|woff|woff2)$/,
                        loader: 'file-loader',
                        query: {
                            name: './fonts/[name].[hash].[ext]',
                        },
                    },
                ]
            },
            plugins: [
                extractLess,
                new webpack.IgnorePlugin(/\/iconv-loader$/),
            ],
            resolve: {
                modules: ['./src/js', './node_modules'],
                alias: {
                    'flowtype/trezor': `${ SRC }/flowtype/empty.js`,
                }
            },
            node: {
                fs: "empty"
            }
        },

    })
}
