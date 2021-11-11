/* config-overrides.js */
const path = require('path');
const getCSSModuleLocalIdent = require('react-dev-utils/getCSSModuleLocalIdent');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const paths = require('react-scripts/config/paths.js');
const postcssNormalize = require('postcss-normalize');
const webpack = require('webpack');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

let isEnvProduction;
let isEnvDevelopment;
const shouldUseSourceMap = process.env.GENERATE_SOURCEMAP !== 'false';

module.exports = {
    webpack: function (config, env) {
        isEnvProduction = env === 'production';
        isEnvDevelopment = !isEnvProduction;

        // add aliases
        config.resolve.alias = {
            ...config.resolve.alias,
            '@styles': path.resolve(__dirname, 'src/assets/styles'),
        };

        // dont build runtime chunk
        config.optimization.runtimeChunk = false;

        // add less
        addLess(config);

        // remove moment locales
        removeLocales(config);

        // build analyzer
        if (process.argv.includes('--report')) {
            config.plugins.push(new BundleAnalyzerPlugin())
        }

        return config;
    },
};

// remove moment locales
function removeLocales(config) {
    // your app locales
    const locales = /en-gb|fr$|de$/;

    // remove webpack IgnorePlugin which is determined inside react default webpack config as
    // new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/). Otherwise it will ignore all rules added with
    // webpack.ContextReplacementPlugin.
    config.plugins = config.plugins.filter((plugin) => {
        return !(plugin instanceof webpack.IgnorePlugin);
    });

    // webpack.ContextReplacementPlugin is more convenient. There is no need to import moment locales in every component
    // which uses it. Moreover local imports override currently selected locale, which is en by default.
    config.plugins.push(new webpack.ContextReplacementPlugin(/moment[/\\]locale$/, locales));
}

// add less
function addLess(config) {
    const lessRegex = /\.(less)$/;
    const lessModuleRegex = /\.module\.(less)$/;

    const oneOfLoadersArr = config.module.rules[2].oneOf;
    const fileLoader = oneOfLoadersArr.slice(-1);
    const restLoaders = oneOfLoadersArr.slice(0, oneOfLoadersArr.length - 1);

    config.module.rules[2].oneOf = [
        ...restLoaders,
        {
            test: lessRegex,
            exclude: lessModuleRegex,
            use: getStyleLoaders(
                {
                    importLoaders: 3,
                    sourceMap: isEnvProduction && shouldUseSourceMap,
                },
                'less-loader'
            ),
            sideEffects: true,
        },
        {
            test: lessModuleRegex,
            use: getStyleLoaders(
                {
                    importLoaders: 3,
                    sourceMap: isEnvProduction && shouldUseSourceMap,
                    modules: {
                        getLocalIdent: getCSSModuleLocalIdent,
                    },
                },
                'less-loader'
            ),
        },
        ...fileLoader,
    ];
}

// common function to get style loaders
function getStyleLoaders(cssOptions, preProcessor) {
    const loaders = [
        isEnvDevelopment && require.resolve('style-loader'),
        isEnvProduction && {
            loader: MiniCssExtractPlugin.loader,
            // css is located in `static/css`, use '../../' to locate index.html folder
            // in production `paths.publicUrlOrPath` can be a relative path
            options: paths.publicUrlOrPath.startsWith('.') ? { publicPath: '../../' } : {},
        },
        {
            loader: require.resolve('css-loader'),
            options: cssOptions,
        },
        {
            // Options for PostCSS as we reference these options twice
            // Adds vendor prefixing based on your specified browser support in
            // package.json
            loader: require.resolve('postcss-loader'),
            options: {
                // Necessary for external CSS imports to work
                // https://github.com/facebook/create-react-app/issues/2677
                ident: 'postcss',
                plugins: () => [
                    require('postcss-flexbugs-fixes'),
                    require('postcss-preset-env')({
                        autoprefixer: {
                            flexbox: 'no-2009',
                        },
                        stage: 3,
                    }),
                    // Adds PostCSS Normalize as the reset css with default options,
                    // so that it honors browserslist config in package.json
                    // which in turn let's users customize the target behavior as per their needs.
                    postcssNormalize(),
                ],
                sourceMap: isEnvProduction && shouldUseSourceMap,
            },
        },
    ].filter(Boolean);
    if (preProcessor) {
        loaders.push(
            {
                loader: require.resolve('resolve-url-loader'),
                options: {
                    sourceMap: isEnvProduction && shouldUseSourceMap,
                },
            },
            {
                loader: require.resolve(preProcessor),
                options: {
                    sourceMap: true,
                },
            }
        );
    }
    return loaders;
}
