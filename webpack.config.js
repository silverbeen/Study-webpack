const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const apiMocker = require("connect-api-mocker");
const OptimizeCSSAssetsPlugin = require("css-minimizer-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
// https://webpack.js.org/plugins/copy-webpack-plugin/
const CopyPlugin = require("copy-webpack-plugin");

/**
 * @devServer
 * contentBase: 정적파일을 제공할 경로. 기본값은 웹팩 아웃풋이다.
 * publicPath: 브라우져를 통해 접근하는 경로. 기본값은 '/' 이다.
 * host: 개발환경에서 도메인을 맞추어야 하는 상황에서 사용한다. 예를들어 쿠기 기반의 인증은 인증 서버와 동일한 도메인으로 개발환경을 맞추어야 한다. 운영체제의 호스트 파일에 해당 도메인과 127.0.0.1 연결한 추가한 뒤 host 속성에 도메인을 설정해서 사용한다.
 * overlay: 빌드시 에러나 경고를 브라우져 화면에 표시한다.
 * port: 개발 서버 포트 번호를 설정한다. 기본값은 8080.
 * stats: 에러 메세지를 어떻게 표시할지 설정한다. 'none', 'errors-only', 'minimal', 'normal', 'verbose' 로 메세지 수준을 조절한다.
 * historyApiFallBack:  SPA 개발시 설정한다. 404가 발생하면 index.html로 리다이렉트한다.
 */

const mode = process.env.NODE_ENV || "development"; // 기본값을 development로 설정

module.exports = {
  mode,
  entry: {
    main: "./src/app.js",
    result: "./src/result.js",
  },
  output: {
    path: path.resolve("./dist"),
    filename: "[name].js",
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: "babel-loader", // 바벨 로더를 추가한다
      },
      {
        test: /\.css$/, // .css 확장자로 끝나는 모든 파일
        use: ["style-loader", "css-loader"], //
      },
      {
        test: /\.png$/,
        use: {
          loader: "url-loader", // url 로더를 설정한다
          options: {
            publicPath: "./dist/", // file-loader와 동일
            name: "[name].[ext]?[hash]", // file-loader와 동일
            limit: 5000, // 5kb 미만 파일만 data url로 처리
          },
        },
      },
    ],
  },
  optimization: {
    minimizer:
      mode === "production"
        ? [
            new OptimizeCSSAssetsPlugin(),
            new TerserPlugin({
              terserOptions: {
                compress: {
                  drop_console: true, // 콘솔 로그를 제거한다
                },
              },
            }),
          ]
        : [],
    splitChunks: {
      chunks: "all", // 중복 코드를 제거한다.
    },
  },
  externals: {
    axios: "axios", // axios 라는 전역변수를 선언하여 모든 코드에서 axios를 불러오지 않고 사용이 가능하다.
  },
  devServer: {
    static: {
      directory: path.join(__dirname, "app"),
    },
    client: {
      overlay: true,
      logging: "error",
    },
    hot: true,
    port: 3000,
    historyApiFallback: { index: "index.html" },

    // webpack 5 버전에서는 before 함수가 적용되지 않는다.
    // setupMiddlewares 사용
    setupMiddlewares: (middlewares, devServer) => {
      if (!devServer) {
        throw new Error("webpack-dev-server is not defined");
      }

      // apiMocker을 사용하여 json 관리
      // devServer.app.use(apiMocker("/api", "mocks/api"));

      devServer.app.get("/api/user", (_, response) => {
        response.send([
          {
            id: 1,
            name: "silverbeen",
          },
          {
            id: 2,
            name: "goldbeen",
          },
          {
            id: 3,
            name: "dummm",
          },
        ]);
      });

      // Use the `unshift` method if you want to run a middleware before all other middlewares
      // or when you are migrating from the `onBeforeSetupMiddleware` option
      middlewares.unshift({
        name: "fist-in-array",
        path: "/foo/path",
        middleware: (req, res) => {
          res.send("Foo!");
        },
      });

      // Use the `push` method if you want to run a middleware after all other middlewares
      // or when you are migrating from the `onAfterSetupMiddleware` option
      middlewares.push({
        name: "hello-world-test-one",
        // `path` is optional
        path: "/foo/bar",
        middleware: (req, res) => {
          res.send("Foo Bar!");
        },
      });

      middlewares.push((req, res) => {
        res.send("Hello World!");
      });

      return middlewares;
    },

    // 프록시로 CORS 우회 하는 방법
    proxy: {
      "/api": "http://localhost:3001", // 프록시
    },
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./src/index.html", // 템플릿 경로를 지정
      templateParameters: {
        // 템플릿에 주입할 파라매터 변수 지정
        env: process.env.NODE_ENV === "development" ? "(개발용)" : "",
      },
    }),
    new CleanWebpackPlugin(),

    new CopyPlugin({
      patterns: [
        {
          from: "./node_modules/axios/dist/axios.min.js",
          to: "./axios.min.js", // 목적지 파일에 들어간다
        },
      ],
    }),
  ],
};

// CopyPlugin와 같은 ls -lh dist 빌드 용량이 커질때 보통 사용된다.!
