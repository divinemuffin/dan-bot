const nodeExternals = require('webpack-node-externals');
const path = require('path');

module.exports = {
	target:'node',
	externals: [ nodeExternals() ],
	context: __dirname,
	devtool: "source-map",
	entry: "./core.ts",
	module: {
    rules: [
      {
		use: 'ts-loader'
      },
    ],
  },
	resolve: {
		extensions: [ '.tsx', '.ts', '.js' ]
	},
	output: {
		path: path.resolve(__dirname, "../dist"),
		filename: "dan_bundled.js"
	}
}