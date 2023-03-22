# Study-webpack



## 웹팩 개발 서버
```npm i -D webpack-dev-server ```

#### devServer

 * contentBase: 정적파일을 제공할 경로. 기본값은 웹팩 아웃풋이다.
 * publicPath: 브라우져를 통해 접근하는 경로. 기본값은 '/' 이다.
 * host: 개발환경에서 도메인을 맞추어야 하는 상황에서 사용한다.
 * overlay: 빌드시 에러나 경고를 브라우져 화면에 표시한다.
 * port: 개발 서버 포트 번호를 설정한다. 기본값은 8080.
 * stats: 에러 메세지를 어떻게 표시할지 설정한다. 'none', 'errors-only', 'minimal', 'normal', 'verbose' 로 메세지 수준을 조절한다.
 * historyApiFallBack:  SPA 개발시 설정한다. 404가 발생하면 index.html로 리다이렉트한다.
 
 
 ```
module.exports = {
  ...
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
 }
 ```
 
 
 ## 최적화
 ``` npm run build ```

 ``` ls -lh dist ```
 
 빌드된 파일의 chank 크기를 확인한다.

 <img width="527" alt="스크린샷 2023-03-23 오전 1 55 57" src="https://user-images.githubusercontent.com/63506240/226980192-528438cc-62c1-4fd0-9c63-a81961be3d11.png">
 
 
``` npm i -D css-minimizer-webpack-plugin``` : CSS 파일의 코드가 최적화(압축) 
https://yamoo9.gitbook.io/webpack/webpack/webpack-plugins/minimize-css-files

``` npm i -D terser-webpack-plugin```  : 콘솔 을 제거할 수 있는 기능을 제공한다.

``` npm i -D copy-webpack-plugin``` : 자주 사용되는 import들을 전역으로 설정해 매번 파일에서 불러오지 않도록 설정해주기 위한 플러그인이다.


```
module.exports = {
  ...
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
}
```
