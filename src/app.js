import axios from "axios";
import form from "./form";
import result from "./result";
// 스타일 로더가 핫 로딩을 제공하기에 코드가 변경되고 저장해도 바로 변경되는 것을 확인할 수 있따.
import "./app.css";

let formEl;
let resultEl;

// localhost:3000 접속시 /api/user 호출
document.addEventListener("DOMContentLoaded", async () => {
  formEl = document.createElement("div");
  formEl.innerHTML = await form.render();
  document.body.appendChild(formEl);

  resultEl = document.createElement("div");
  resultEl.innerHTML = await result.render();
  document.body.appendChild(resultEl);
});

// 코드가 변경되었을때 전체를 리프레쉬하는 것이 아니라 바뀐 그 부분만 변경사항을 적용시킨다.
if (module.hot) {
  // result 부분에 변경사항이 생겼을때 실행
  module.hot.accept("./result", async () => {
    console.log("result 모듈 변경됨");

    // form 부분과 관련없이 밑에 result 부분한 렌더한다.
    resultEl.innerHTML = await result.render();
  });

  // form 부분에 변경사항이 생겼을때 실행
  module.hot.accept("./form", async () => {
    console.log("form 모듈 변경됨");

    // form 부분과 관련없이 밑에 result 부분한 렌더한다.
    formEl.innerHTML = await form.render();
  });
}

// Promise또는 Map, Array.from 등 바벨이 변환하지 못하는 코드가 있다.
// Polyfill은 새로 추가된 전역 객체들을 사용가능하게 만들어준다.
console.log(Array.from("foo"));
console.log(process.env.NODE_ENV);
new Promise();
