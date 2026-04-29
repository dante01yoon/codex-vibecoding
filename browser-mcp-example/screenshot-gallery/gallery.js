const captures = [
  {
    siteName: "OpenAI Developers Codex",
    url: "https://developers.openai.com/codex",
    capturedAt: "2026-04-29",
    image: "./public/site-shots/openai-codex-2026-04-29-1365x768.png",
    note: "Codex 문서의 첫 화면과 주요 소개 영역을 데스크톱 viewport로 캡처했습니다.",
  },
  {
    siteName: "OpenAI Developers Codex CLI",
    url: "https://developers.openai.com/codex/cli",
    capturedAt: "2026-04-29",
    image: "./public/site-shots/openai-codex-cli-2026-04-29-1365x768.png",
    note: "터미널에서 Codex를 사용하는 CLI 소개 화면을 같은 viewport로 캡처했습니다.",
  },
  {
    siteName: "OpenAI Developers Codex IDE Extension",
    url: "https://developers.openai.com/codex/ide",
    capturedAt: "2026-04-29",
    image: "./public/site-shots/openai-codex-ide-2026-04-29-1365x768.png",
    note: "IDE 안에서 Codex를 사용하는 확장 프로그램 소개 화면을 캡처했습니다.",
  },
];

const gallery = document.querySelector("[data-gallery]");

gallery.innerHTML = captures
  .map(
    (capture) => `
      <article class="site-card">
        <a class="site-card__image-frame" href="${capture.url}" target="_blank" rel="noreferrer">
          <img class="site-card__image" src="${capture.image}" alt="${capture.siteName} 페이지 스크린샷" />
        </a>
        <div class="site-card__body">
          <h2 class="site-card__title">${capture.siteName}</h2>
          <a class="site-card__url" href="${capture.url}" target="_blank" rel="noreferrer">${capture.url}</a>
          <p class="site-card__meta">
            <span>캡처 날짜 ${capture.capturedAt}</span>
            <span>1365x768</span>
          </p>
          <p class="site-card__note">${capture.note}</p>
        </div>
      </article>
    `,
  )
  .join("");
