import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = fileURLToPath(new URL(".", import.meta.url));

const config = {
	entry: "./index.ts",
	target: "node",
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				use: "ts-loader",
				exclude: /node_modules/,
			},
		],
	},

	resolve: {
		extensions: [".tsx", ".ts", ".js"],
	},
	output: {
		filename: "index.cjs",
		path: path.resolve(__dirname, "build"),
	},
	optimization: {
		minimize: false,
	},
};

export default config;
