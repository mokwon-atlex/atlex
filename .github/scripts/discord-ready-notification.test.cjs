const test = require("node:test");
const assert = require("node:assert/strict");

const { sendReadyNotification } = require("./discord-ready-notification.cjs");

test("웹훅 키가 없으면 Discord 알림을 건너뛴다", async () => {
  let called = false;
  const warnings = [];

  const sent = await sendReadyNotification({
    webhookUrl: "",
    pullRequest: {
      number: 25,
      title: "chore: Draft PR 리뷰 절차 자동화",
      html_url: "https://github.com/mokwon-atlex/atlex/pull/25",
      user: { login: "author" },
    },
    fetchImpl: async () => {
      called = true;
    },
    core: { warning: (message) => warnings.push(message) },
  });

  assert.equal(sent, false);
  assert.equal(called, false);
  assert.deepEqual(warnings, [
    "DISCORD_WEBHOOK_URL Secret이 없어 Discord 알림을 건너뜁니다.",
  ]);
});

test("Ready 상태의 PR 정보를 멘션 없이 Discord에 전송한다", async () => {
  const requests = [];

  const sent = await sendReadyNotification({
    webhookUrl: "https://discord.example/webhook",
    pullRequest: {
      number: 25,
      title: "제목](https://evil.example)\n*강조* @everyone",
      html_url: "https://github.com/mokwon-atlex/atlex/pull/25",
      user: { login: "author" },
    },
    fetchImpl: async (url, options) => {
      requests.push({ url, options });
      return { ok: true, status: 204 };
    },
    core: { warning() {} },
  });

  assert.equal(sent, true);
  assert.deepEqual(requests, [
    {
      url: "https://discord.example/webhook",
      options: {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: [
            "**리뷰 요청**",
            "[#25 제목\\]\\(https://evil\\.example\\) \\*강조\\* @everyone](https://github.com/mokwon-atlex/atlex/pull/25)",
            "작성자: author",
          ].join("\n"),
          allowed_mentions: { parse: [] },
        }),
      },
    },
  ]);
});

test("Discord가 알림을 거부하면 워크플로우를 실패시킨다", async () => {
  await assert.rejects(
    sendReadyNotification({
      webhookUrl: "https://discord.example/webhook",
      pullRequest: {
        number: 25,
        title: "chore: Draft PR 리뷰 절차 자동화",
        html_url: "https://github.com/mokwon-atlex/atlex/pull/25",
        user: { login: "author" },
      },
      fetchImpl: async () => ({ ok: false, status: 401 }),
      core: { warning() {} },
    }),
    new Error("Discord 알림 전송 실패: HTTP 401"),
  );
});
