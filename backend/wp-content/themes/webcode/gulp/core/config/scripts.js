var path = require('path');
var webpack = require('webpack-stream').webpack;
var TerserPlugin = require('terser-webpack-plugin');
var ESLintPlugin = require('eslint-webpack-plugin');

// utils
var deepMerge = require('../utils/deepMerge');

// config
var assets = require('./common').paths.assets;
var jQuery = require('jquery');
/**
 * Script Building
 * Configuration
 * Object
 *
 * @type {{}}
 */
 

 module.exports = {
	options: {
			webpack: {
					defaults: {
							plugins: [
									new webpack.ProvidePlugin( {
											'$': 'jquery',
											'jQuery': 'jquery',
											'window.jQuery': 'jquery',
											// 'slick': 'slick-carousel'
									} )
							],
							externals: {
									'jquery': 'window.jQuery',
									// 'slick-carousel': 'window.slick'
							},
					}
			}
	}
};


module.exports = deepMerge({
	paths: {
		watch: assets.src + '/js/**/*.js',
		src: [
			assets.src + '/js/*.js',
			'!' + assets.src + '/js/**/_*'
		],
		dest: assets.dest + '/js',
		clean: assets.dest + '/js/**/*.{js,map}'
	},

	options: {
		webpack: {

			// merged with defaults
			// for :watch task
			watch: {
				mode: 'development',
				cache: true,
				watch: true,
				devtool: 'eval'
			},


			// merged with defaults
			// for :dev task
			dev: {
				mode: 'development',
				devtool: 'eval'
			},


			// merged with defaults
			// for :prod task
			prod: {
				mode: 'production',
				optimization: {
					minimize: true,
					minimizer: [
						new TerserPlugin({
							terserOptions: {
								output: {
									comments: false,
								},
							},
							extractComments: false,
						})
					]
				}
			},

			defaults: {
				resolve: {
					extensions: ['.js', '.jsx', '.ts', '.tsx']
				},
				output: {
					chunkFilename: 'chunk-[name].js'
				},
				stats: {
					colors: true
				},
				module: {
					rules: [
						{
							test: /\.js$/,
							exclude: /node_modules/,
							loader: 'babel-loader',
							options: {
								presets: ['@babel/preset-env'],
								plugins: [
									'@babel/plugin-transform-runtime',
									'@babel/plugin-transform-modules-commonjs'
								]
							}
						}
					]
				},
				plugins: [
					// ESLint stays
					// new ESLintPlugin(),
					// Add ProvidePlugin to automatically supply $/jQuery
					new webpack.ProvidePlugin({
					  $: 'jquery',
					//   jQuery: 'jquery',
					  'window.jQuery': 'jquery'
					}),
				  ],
				  externals: {
					// Any import of 'jquery' will refer at runtime to window.jQuery
					// jquery: 'jQuery'
				  }
			}
		}
	}
});
