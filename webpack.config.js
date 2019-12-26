const nodeExternals = require('webpack-node-externals');
const path = require('path');

var commonConfig = {
	target: 'node',
	externals: [ nodeExternals() ],
	context: __dirname,
	devtool: "source-map",
	module: {
		rules: [
			{
				use: 'ts-loader'
			}
		],
  	},
	resolve: {
		extensions: [ '.tsx', '.ts', '.js' ]
	},
}

var serverConfig = Object.assign({}, commonConfig,{
    name: "server",
    entry: "./server.ts",
    output: {
       path: path.resolve(__dirname, "./api"),
       filename: "server.js"
    },
});

var coreConfig = Object.assign({}, commonConfig, {
    name: "core",
    entry: "./core.ts",
    output: {
       path: path.resolve(__dirname, "./dist"),
       filename: "dan_bundled.js"
    },
});

module.exports = [
	coreConfig,
	serverConfig
]