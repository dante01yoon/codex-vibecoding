const registrationForm = document.querySelector("#registration-form");
const feedback = document.querySelector("#form-feedback");

if (registrationForm && feedback) {
  registrationForm.addEventListener("submit", (event) => {
    event.preventDefault();
    feedback.textContent =
      "입력 내용을 확인했습니다. 공식 접수 연결 전에는 브라우저에서만 표시됩니다.";
  });
}
