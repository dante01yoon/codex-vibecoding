const registrationForm = document.querySelector("#registration-form");
const feedback = document.querySelector("#form-feedback");

if (registrationForm && feedback) {
  registrationForm.addEventListener("submit", (event) => {
    event.preventDefault();
    feedback.textContent =
      "기본 등록 흐름이 연결되었습니다. 다음 단계에서 실제 제출 API를 연동하면 됩니다.";
    registrationForm.reset();
  });
}
